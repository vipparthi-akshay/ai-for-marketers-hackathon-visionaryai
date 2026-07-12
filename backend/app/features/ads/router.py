import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.exceptions import NotFoundException
from app.features.auth.models import User
from app.features.business.models import Business
from app.features.content.models import AdCampaign
from app.features.ads.schemas import AdsGenerateRequest, AdsGenerateResponse, AdVariation
from app.ai.agents.ads_agent import generate_ads

router = APIRouter(prefix="/ads", tags=["Ads Optimization"])


@router.post("/generate", response_model=AdsGenerateResponse)
async def generate_ads_endpoint(
    data: AdsGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Business).where(Business.id == data.business_id)
    )
    business = result.scalar_one_or_none()
    if business is None:
        raise NotFoundException("Business", str(data.business_id))

    ai_result = await generate_ads(
        business_name=business.name,
        industry=business.industry,
        platform=data.platform,
        objective=data.objective,
        budget=data.budget,
        target_audience=data.target_audience or business.target_audience or "",
    )

    ads = []
    for ad in ai_result.get("ads", []):
        ads.append(AdVariation(
            headline=ad.get("headline", ""),
            description=ad.get("description", ""),
            call_to_action=ad.get("call_to_action"),
            predicted_ctr=ad.get("predicted_ctr"),
            predicted_cpc=ad.get("predicted_cpc"),
            variation=ad.get("variation", "A"),
        ))

    first_ad = ads[0] if ads else AdVariation(headline="Ad", description="Description")

    ad_campaign = AdCampaign(
        business_id=data.business_id,
        platform=data.platform,
        ad_type="search" if data.platform == "google" else "social",
        headlines=[a.headline for a in ads],
        descriptions=[a.description for a in ads],
        keywords=ai_result.get("keywords", []),
        budget_recommendation=data.budget,
        predicted_ctr=first_ad.predicted_ctr,
        predicted_cpc=first_ad.predicted_cpc,
        ab_variations=[a.model_dump() for a in ads],
        status="draft",
    )
    db.add(ad_campaign)
    await db.flush()

    return AdsGenerateResponse(
        ads=ads,
        keywords=ai_result.get("keywords", []),
        budget_allocation=ai_result.get("budget_allocation", {}),
        ab_test_recommendations=ai_result.get("ab_test_recommendations", []),
        platform=data.platform,
    )


@router.get("/{business_id}")
async def list_ads(
    business_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AdCampaign)
        .where(AdCampaign.business_id == business_id)
        .order_by(AdCampaign.created_at.desc())
    )
    return result.scalars().all()
