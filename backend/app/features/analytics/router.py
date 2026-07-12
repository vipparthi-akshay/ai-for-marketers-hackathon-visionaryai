import uuid
import random

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.exceptions import NotFoundException
from app.features.auth.models import User
from app.features.business.models import Business
from app.features.business.extended_models import Campaign
from app.features.content.models import MarketingAsset
from app.features.analytics.schemas import AnalyticsPredictRequest, DashboardResponse, ROIPredictionResponse
from app.ai.agents.analytics_agent import predict_analytics

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard/{business_id}", response_model=DashboardResponse)
async def get_dashboard(
    business_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Business).where(Business.id == business_id)
    )
    business = result.scalar_one_or_none()
    if business is None:
        raise NotFoundException("Business", str(business_id))

    campaign_result = await db.execute(
        select(func.count(Campaign.id)).where(Campaign.business_id == business_id)
    )
    campaign_count = campaign_result.scalar() or 0

    content_result = await db.execute(
        select(func.count(MarketingAsset.id)).where(MarketingAsset.business_id == business_id)
    )
    content_count = content_result.scalar() or 0

    return DashboardResponse(
        marketing_score=business.marketing_score,
        campaign_count=campaign_count,
        content_count=content_count,
        seo_score=business.business_analysis.get("seo_score") if business.business_analysis else None,
        predicted_reach=random.randint(5000, 50000),
        roi_prediction=round(random.uniform(1.5, 4.5), 1),
        ai_suggestions=[
            "Create a content calendar for consistent posting",
            "Optimize your website for mobile users",
            "Set up email automation for lead nurturing",
            "Run A/B tests on your top-performing content",
            "Expand to LinkedIn for B2B audience reach",
        ],
        growth_trend=[
            {"month": "Jan", "value": random.randint(1000, 5000)},
            {"month": "Feb", "value": random.randint(2000, 8000)},
            {"month": "Mar", "value": random.randint(3000, 12000)},
            {"month": "Apr", "value": random.randint(5000, 18000)},
            {"month": "May", "value": random.randint(7000, 25000)},
            {"month": "Jun", "value": random.randint(10000, 35000)},
        ],
        conversion_funnel={
            "visitors": random.randint(10000, 50000),
            "leads": random.randint(500, 5000),
            "prospects": random.randint(100, 1000),
            "customers": random.randint(20, 200),
        },
        recent_activity=[
            {"type": "content", "title": "Blog post generated", "time": "2 hours ago"},
            {"type": "campaign", "title": "Summer campaign created", "time": "1 day ago"},
            {"type": "seo", "title": "SEO audit completed", "time": "2 days ago"},
        ],
    )


@router.post("/predict", response_model=ROIPredictionResponse)
async def predict_roi(
    data: AnalyticsPredictRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Business).where(Business.id == data.business_id)
    )
    business = result.scalar_one_or_none()
    if business is None:
        raise NotFoundException("Business", str(data.business_id))

    campaign_result = await db.execute(
        select(func.count(Campaign.id)).where(Campaign.business_id == data.business_id)
    )
    campaign_count = campaign_result.scalar() or 0

    content_result = await db.execute(
        select(func.count(MarketingAsset.id)).where(MarketingAsset.business_id == data.business_id)
    )
    content_count = content_result.scalar() or 0

    ai_result = await predict_analytics(
        business_name=business.name,
        industry=business.industry,
        budget=data.budget,
        campaign_count=campaign_count,
        content_count=content_count,
        target_audience=business.target_audience or "",
    )

    return ROIPredictionResponse(
        predicted_metrics=ai_result.get("predicted_metrics", {}),
        roi_prediction=ai_result.get("roi_prediction", {}),
        growth_trajectory=ai_result.get("growth_trajectory", {}),
        recommendations=ai_result.get("recommendations", []),
    )
