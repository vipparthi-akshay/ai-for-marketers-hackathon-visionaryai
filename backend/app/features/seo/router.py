import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.exceptions import NotFoundException
from app.features.auth.models import User
from app.features.business.models import Business
from app.features.content.models import SEOReport
from app.features.seo.schemas import SEOAnalyzeRequest, SEOResponse
from app.ai.agents.seo_agent import analyze_seo

router = APIRouter(prefix="/seo", tags=["SEO Engine"])


@router.post("/analyze", response_model=SEOResponse)
async def analyze_seo_endpoint(
    data: SEOAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Business).where(Business.id == data.business_id)
    )
    business = result.scalar_one_or_none()
    if business is None:
        raise NotFoundException("Business", str(data.business_id))

    ai_result = await analyze_seo(
        business_name=business.name,
        industry=business.industry,
        website_url=data.url or business.website_url or "",
        description=business.description or "",
    )

    report = SEOReport(
        business_id=data.business_id,
        url=data.url or business.website_url,
        report_type="full_audit",
        score=ai_result.get("seo_score", 0),
        keywords=ai_result.get("keywords", []),
        issues=ai_result.get("issues", []),
        recommendations=ai_result.get("recommendations", []),
        meta_tags=ai_result.get("meta_tags", {}),
        topic_clusters=ai_result.get("topic_clusters", []),
        full_report=ai_result,
    )
    db.add(report)
    await db.flush()

    return SEOResponse.model_validate(report)


@router.get("/{business_id}", response_model=list[SEOResponse])
async def list_seo_reports(
    business_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SEOReport)
        .where(SEOReport.business_id == business_id)
        .order_by(SEOReport.created_at.desc())
    )
    reports = result.scalars().all()
    return [SEOResponse.model_validate(r) for r in reports]
