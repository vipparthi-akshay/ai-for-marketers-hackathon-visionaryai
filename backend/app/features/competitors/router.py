from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, verify_business_access
from app.core.exceptions import NotFoundException
from app.features.auth.models import User
from app.features.business.models import Business
from app.features.content.models import Competitor
from app.features.competitors.schemas import CompetitorAnalyzeRequest, CompetitorResponse
from app.ai.agents.competitor_agent import analyze_competitor

router = APIRouter(prefix="/competitors", tags=["Competitor Intelligence"])


@router.post("/analyze")
async def analyze_competitor_endpoint(
    data: CompetitorAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    business = await verify_business_access(data.business_id, current_user=current_user, db=db)

    ai_result = await analyze_competitor(
        business_name=business.name,
        industry=business.industry,
        description=business.description or "",
        website_url=business.website_url or "",
        target_audience=business.target_audience or "",
    )

    competitor = Competitor(
        business_id=data.business_id,
        name=data.competitor_name,
        website_url=data.website_url,
        analysis=ai_result,
        strengths=ai_result.get("swot_comparison", {}).get("your_strengths", []),
        weaknesses=ai_result.get("swot_comparison", {}).get("your_weaknesses", []),
        marketing_gaps=ai_result.get("marketing_gaps", []),
        content_gaps=ai_result.get("content_gaps", []),
        recommendations=ai_result.get("recommended_strategies", []),
    )
    db.add(competitor)
    await db.flush()

    return {
        "id": str(competitor.id),
        "name": competitor.name,
        "analysis": ai_result,
    }


@router.get("/{business_id}", response_model=list[CompetitorResponse])
async def list_competitors(
    business_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_business_access(business_id, current_user=current_user, db=db)

    offset = (page - 1) * page_size
    result = await db.execute(
        select(Competitor)
        .where(Competitor.business_id == business_id)
        .order_by(Competitor.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    competitors = result.scalars().all()
    return [CompetitorResponse.model_validate(c) for c in competitors]


@router.get("/detail/{competitor_id}", response_model=CompetitorResponse)
async def get_competitor(
    competitor_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Competitor).where(Competitor.id == competitor_id)
    )
    competitor = result.scalar_one_or_none()
    if competitor is None:
        raise NotFoundException("Competitor", str(competitor_id))
    await verify_business_access(competitor.business_id, current_user=current_user, db=db)
    return CompetitorResponse.model_validate(competitor)


@router.delete("/detail/{competitor_id}", status_code=status.HTTP_200_OK)
async def delete_competitor(
    competitor_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Competitor).where(Competitor.id == competitor_id)
    )
    competitor = result.scalar_one_or_none()
    if competitor is None:
        raise NotFoundException("Competitor", str(competitor_id))
    await verify_business_access(competitor.business_id, current_user=current_user, db=db)
    await db.delete(competitor)
    await db.flush()
    return {"success": True, "message": "Competitor deleted"}
