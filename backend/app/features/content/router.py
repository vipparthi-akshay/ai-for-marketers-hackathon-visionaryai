import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.exceptions import NotFoundException
from app.features.auth.models import User
from app.features.business.models import Business
from app.features.content.models import MarketingAsset
from app.features.content.schemas import (
    ContentGenerateRequest,
    ContentGenerateResponse,
    ContentResponse,
    ContentVariation,
)
from app.ai.agents.content_agent import generate_content

router = APIRouter(prefix="/content", tags=["Content Engine"])


@router.post("/generate", response_model=ContentGenerateResponse)
async def generate_content_endpoint(
    data: ContentGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Business).where(Business.id == data.business_id)
    )
    business = result.scalar_one_or_none()
    if business is None:
        raise NotFoundException("Business", str(data.business_id))

    ai_result = await generate_content(
        business_name=business.name,
        industry=business.industry,
        target_audience=business.target_audience or "",
        content_type=data.asset_type,
        platform=data.platform,
        tone=data.tone,
        topic=data.topic,
        instructions=data.instructions,
    )

    variations = []
    for v in ai_result.get("variations", []):
        variations.append(ContentVariation(
            title=v.get("title", ""),
            content=v.get("content", ""),
            hashtags=v.get("hashtags", []),
            best_time_to_post=v.get("best_time_to_post"),
            engagement_prediction=v.get("engagement_prediction"),
            seo_keywords=v.get("seo_keywords", []),
            call_to_action=v.get("call_to_action"),
        ))

    if not variations:
        variations.append(ContentVariation(
            title="Generated Content",
            content=ai_result.get("raw_response", "Content generation in progress..."),
        ))

    first = variations[0]
    asset = MarketingAsset(
        business_id=data.business_id,
        campaign_id=data.campaign_id,
        asset_type=data.asset_type,
        platform=data.platform,
        title=first.title,
        content=first.content,
        metadata={"variations_count": len(variations), "tone": data.tone},
        status="draft",
    )
    db.add(asset)
    await db.flush()

    return ContentGenerateResponse(
        variations=variations,
        asset_type=data.asset_type,
        platform=data.platform,
    )


@router.get("/{business_id}", response_model=list[ContentResponse])
async def list_content(
    business_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MarketingAsset)
        .where(MarketingAsset.business_id == business_id)
        .order_by(MarketingAsset.created_at.desc())
    )
    assets = result.scalars().all()
    return [ContentResponse.model_validate(a) for a in assets]


@router.get("/detail/{asset_id}", response_model=ContentResponse)
async def get_content(
    asset_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MarketingAsset).where(MarketingAsset.id == asset_id)
    )
    asset = result.scalar_one_or_none()
    if asset is None:
        raise NotFoundException("Content", str(asset_id))
    return ContentResponse.model_validate(asset)
