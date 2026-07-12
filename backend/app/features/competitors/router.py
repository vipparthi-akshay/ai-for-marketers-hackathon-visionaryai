import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.exceptions import NotFoundException
from app.features.auth.models import User
from app.features.business.models import Business
from app.features.content.models import Competitor
from app.features.competitors.schemas import CompetitorAnalyzeRequest
from app.ai.agents.competitor_agent import analyze_competitor

router = APIRouter(prefix="/competitors", tags=["Competitor Intelligence"])


@router.post("/analyze")
async def analyze_competitor_endpoint(
    data: CompetitorAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Business).where(Business.id == data.business_id)
    )
    business = result.scalar_one_or_none()
    if business is None:
        raise NotFoundException("Business", str(data.business_id))

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


@router.get("/{business_id}")
async def list_competitors(
    business_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Competitor)
        .where(Competitor.business_id == business_id)
        .order_by(Competitor.created_at.desc())
    )
    return result.scalars().all()
