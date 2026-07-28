from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, verify_business_access
from app.core.exceptions import NotFoundException
from app.features.auth.models import User
from app.features.business.models import Business
from app.features.business.extended_models import Campaign
from app.features.campaigns.schemas import (
    CampaignCreate,
    CampaignGenerateRequest,
    CampaignResponse,
    CampaignUpdate,
)
from app.ai.agents.campaign_agent import build_campaign

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


@router.post("/", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    data: CampaignCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_business_access(data.business_id, current_user=current_user, db=db)

    campaign = Campaign(
        business_id=data.business_id,
        name=data.name,
        objective=data.objective,
        platforms=data.platforms,
        budget_total=data.budget_total,
        target_audience=data.target_audience,
        start_date=data.start_date,
        end_date=data.end_date,
    )
    db.add(campaign)
    await db.flush()
    return CampaignResponse.model_validate(campaign)


@router.post("/generate", response_model=CampaignResponse)
async def generate_campaign(
    data: CampaignGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    business = await verify_business_access(data.business_id, current_user=current_user, db=db)

    ai_result = await build_campaign(
        business_name=business.name,
        industry=business.industry,
        objective=data.objective,
        budget=data.budget,
        duration=data.duration,
        target_audience=data.target_audience or business.target_audience or "",
        platforms=data.platforms,
    )

    campaign = Campaign(
        business_id=data.business_id,
        name=ai_result.get("campaign_name", f"{data.objective} Campaign"),
        objective=data.objective,
        platforms=data.platforms,
        budget_total=data.budget,
        content_calendar=ai_result.get("content_calendar", []),
        tasks=ai_result.get("tasks", []),
        kpis=ai_result.get("kpis", {}),
        budget_allocation=ai_result.get("budget_allocation", {}),
        ai_strategy=ai_result,
        status="draft",
    )
    db.add(campaign)
    await db.flush()

    return CampaignResponse.model_validate(campaign)


@router.get("/{business_id}", response_model=list[CampaignResponse])
async def list_campaigns(
    business_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_business_access(business_id, current_user=current_user, db=db)

    offset = (page - 1) * page_size
    result = await db.execute(
        select(Campaign)
        .where(Campaign.business_id == business_id)
        .order_by(Campaign.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    campaigns = result.scalars().all()
    return [CampaignResponse.model_validate(c) for c in campaigns]


@router.get("/detail/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Campaign).where(Campaign.id == campaign_id)
    )
    campaign = result.scalar_one_or_none()
    if campaign is None:
        raise NotFoundException("Campaign", str(campaign_id))
    await verify_business_access(campaign.business_id, current_user=current_user, db=db)
    return CampaignResponse.model_validate(campaign)


@router.put("/detail/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(
    campaign_id: str,
    data: CampaignUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Campaign).where(Campaign.id == campaign_id)
    )
    campaign = result.scalar_one_or_none()
    if campaign is None:
        raise NotFoundException("Campaign", str(campaign_id))
    await verify_business_access(campaign.business_id, current_user=current_user, db=db)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(campaign, field, value)

    await db.flush()
    return CampaignResponse.model_validate(campaign)


@router.delete("/detail/{campaign_id}", status_code=status.HTTP_200_OK)
async def delete_campaign(
    campaign_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Campaign).where(Campaign.id == campaign_id)
    )
    campaign = result.scalar_one_or_none()
    if campaign is None:
        raise NotFoundException("Campaign", str(campaign_id))
    await verify_business_access(campaign.business_id, current_user=current_user, db=db)
    await db.delete(campaign)
    await db.flush()
    return {"success": True, "message": "Campaign deleted"}
