import uuid

from pydantic import BaseModel


class DashboardResponse(BaseModel):
    marketing_score: int
    campaign_count: int
    content_count: int
    seo_score: int | None = None
    predicted_reach: int
    roi_prediction: float
    ai_suggestions: list[str]
    growth_trend: list[dict]
    conversion_funnel: dict
    recent_activity: list[dict]


class AnalyticsPredictRequest(BaseModel):
    business_id: uuid.UUID
    budget: float = 1000.0


class ROIPredictionResponse(BaseModel):
    predicted_metrics: dict
    roi_prediction: dict
    growth_trajectory: dict
    recommendations: list[str]
