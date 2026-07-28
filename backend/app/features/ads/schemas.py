from datetime import datetime

from pydantic import BaseModel


class AdsGenerateRequest(BaseModel):
    business_id: str
    platform: str = "google"
    objective: str = "conversions"
    budget: float = 1000.0
    target_audience: str = ""


class AdVariation(BaseModel):
    headline: str
    description: str
    call_to_action: str | None = None
    predicted_ctr: float | None = None
    predicted_cpc: float | None = None
    variation: str = "A"


class AdsResponse(BaseModel):
    id: str
    business_id: str
    platform: str
    ad_type: str
    headlines: list | None = None
    descriptions: list | None = None
    keywords: list | None = None
    budget_recommendation: float | None = None
    predicted_ctr: float | None = None
    predicted_cpc: float | None = None
    ab_variations: list | None = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AdsGenerateResponse(BaseModel):
    ads: list[AdVariation]
    keywords: list[str]
    budget_allocation: dict
    ab_test_recommendations: list[str]
    platform: str
