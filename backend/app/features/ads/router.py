from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, verify_business_access
from app.core.exceptions import NotFoundException
from app.features.auth.models import User
from app.features.business.models import Business
from app.features.content.models import AdCampaign
from app.features.ads.schemas import AdsGenerateRequest, AdsGenerateResponse, AdsResponse, AdVariation
from app.ai.agents.ads_agent import generate_ads

router = APIRouter(prefix="/ads", tags=["Ads Optimization"])


@router.post("/generate", response_model=AdsGenerateResponse)
async def generate_ads_endpoint(
    data: AdsGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    business = await verify_business_access(data.business_id, current_user=current_user, db=db)

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


@router.get("/{business_id}", response_model=list[AdsResponse])
async def list_ads(
    business_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_business_access(business_id, current_user=current_user, db=db)

    offset = (page - 1) * page_size
    result = await db.execute(
        select(AdCampaign)
        .where(AdCampaign.business_id == business_id)
        .order_by(AdCampaign.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    ads = result.scalars().all()
    return [AdsResponse.model_validate(a) for a in ads]


@router.get("/detail/{ad_id}", response_model=AdsResponse)
async def get_ad(
    ad_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AdCampaign).where(AdCampaign.id == ad_id)
    )
    ad = result.scalar_one_or_none()
    if ad is None:
        raise NotFoundException("Ad Campaign", str(ad_id))
    await verify_business_access(ad.business_id, current_user=current_user, db=db)
    return AdsResponse.model_validate(ad)


@router.delete("/detail/{ad_id}", status_code=status.HTTP_200_OK)
async def delete_ad(
    ad_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AdCampaign).where(AdCampaign.id == ad_id)
    )
    ad = result.scalar_one_or_none()
    if ad is None:
        raise NotFoundException("Ad Campaign", str(ad_id))
    await verify_business_access(ad.business_id, current_user=current_user, db=db)
    await db.delete(ad)
    await db.flush()
    return {"success": True, "message": "Ad campaign deleted"}
