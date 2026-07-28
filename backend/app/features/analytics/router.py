from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, verify_business_access
from app.core.exceptions import NotFoundException
from app.features.auth.models import User
from app.features.business.models import Business
from app.features.business.extended_models import Campaign
from app.features.content.models import MarketingAsset, SEOReport, AdCampaign, Competitor, Notification
from app.features.analytics.schemas import AnalyticsPredictRequest, DashboardResponse, ROIPredictionResponse
from app.ai.agents.analytics_agent import predict_analytics

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard/{business_id}", response_model=DashboardResponse)
async def get_dashboard(
    business_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    business = await verify_business_access(business_id, current_user=current_user, db=db)

    campaign_result = await db.execute(
        select(func.count(Campaign.id)).where(Campaign.business_id == business_id)
    )
    campaign_count = campaign_result.scalar() or 0

    content_result = await db.execute(
        select(func.count(MarketingAsset.id)).where(MarketingAsset.business_id == business_id)
    )
    content_count = content_result.scalar() or 0

    seo_result = await db.execute(
        select(func.count(SEOReport.id)).where(SEOReport.business_id == business_id)
    )
    seo_count = seo_result.scalar() or 0

    ads_result = await db.execute(
        select(func.count(AdCampaign.id)).where(AdCampaign.business_id == business_id)
    )
    ads_count = ads_result.scalar() or 0

    competitor_result = await db.execute(
        select(func.count(Competitor.id)).where(Competitor.business_id == business_id)
    )
    competitor_count = competitor_result.scalar() or 0

    total_assets = content_count + ads_count + seo_count + competitor_count

    ai_suggestions = []
    if campaign_count == 0:
        ai_suggestions.append("Create your first marketing campaign to get started")
    if content_count < 5:
        ai_suggestions.append("Generate more content to improve your marketing reach")
    if seo_count == 0:
        ai_suggestions.append("Run an SEO audit to optimize your website")
    if competitor_count == 0:
        ai_suggestions.append("Analyze your competitors to find market gaps")
    if ads_count == 0:
        ai_suggestions.append("Create ad campaigns to boost your visibility")
    if business.marketing_score < 50:
        ai_suggestions.append("Improve your business profile for better AI recommendations")
    if not ai_suggestions:
        ai_suggestions = [
            "Run A/B tests on your top-performing content",
            "Expand to LinkedIn for B2B audience reach",
            "Set up email automation for lead nurturing",
        ]

    predicted_reach = max(1000, total_assets * 500 + campaign_count * 2000)
    roi_prediction = round(min(5.0, 1.0 + (total_assets * 0.1) + (campaign_count * 0.3)), 1)

    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    base_value = max(1000, total_assets * 200)
    growth_trend = []
    for i, month in enumerate(months):
        multiplier = 1 + (i * 0.15) + (campaign_count * 0.05)
        growth_trend.append({"month": month, "value": int(base_value * multiplier)})

    visitor_base = max(5000, total_assets * 1000)
    conversion_funnel = {
        "visitors": visitor_base,
        "leads": int(visitor_base * 0.05),
        "prospects": int(visitor_base * 0.01),
        "customers": max(1, int(visitor_base * 0.002)),
    }

    return DashboardResponse(
        marketing_score=business.marketing_score,
        campaign_count=campaign_count,
        content_count=content_count,
        seo_score=business.business_analysis.get("seo_score") if business.business_analysis else None,
        predicted_reach=predicted_reach,
        roi_prediction=roi_prediction,
        ai_suggestions=ai_suggestions,
        growth_trend=growth_trend,
        conversion_funnel=conversion_funnel,
        recent_activity=[
            {"type": "content", "title": f"{content_count} content pieces created", "time": "recent"},
            {"type": "campaign", "title": f"{campaign_count} campaigns running", "time": "recent"},
            {"type": "seo", "title": f"{seo_count} SEO reports generated", "time": "recent"},
        ],
    )


@router.post("/predict", response_model=ROIPredictionResponse)
async def predict_roi(
    data: AnalyticsPredictRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    business = await verify_business_access(data.business_id, current_user=current_user, db=db)

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
