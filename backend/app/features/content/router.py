from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, verify_business_access
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
    business = await verify_business_access(data.business_id, current_user=current_user, db=db)

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
        meta_data={"variations_count": len(variations), "tone": data.tone},
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
    business_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_business_access(business_id, current_user=current_user, db=db)

    offset = (page - 1) * page_size
    result = await db.execute(
        select(MarketingAsset)
        .where(MarketingAsset.business_id == business_id)
        .order_by(MarketingAsset.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    assets = result.scalars().all()
    return [ContentResponse.model_validate(a) for a in assets]


@router.get("/detail/{asset_id}", response_model=ContentResponse)
async def get_content(
    asset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MarketingAsset).where(MarketingAsset.id == asset_id)
    )
    asset = result.scalar_one_or_none()
    if asset is None:
        raise NotFoundException("Content", str(asset_id))
    await verify_business_access(asset.business_id, current_user=current_user, db=db)
    return ContentResponse.model_validate(asset)


@router.delete("/detail/{asset_id}", status_code=status.HTTP_200_OK)
async def delete_content(
    asset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MarketingAsset).where(MarketingAsset.id == asset_id)
    )
    asset = result.scalar_one_or_none()
    if asset is None:
        raise NotFoundException("Content", str(asset_id))
    await verify_business_access(asset.business_id, current_user=current_user, db=db)
    await db.delete(asset)
    await db.flush()
    return {"success": True, "message": "Content deleted"}
