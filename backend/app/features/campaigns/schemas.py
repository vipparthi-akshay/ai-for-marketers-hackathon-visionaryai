from datetime import datetime

from pydantic import BaseModel, Field


class CampaignCreate(BaseModel):
    business_id: str
    name: str = Field(min_length=1, max_length=255)
    objective: str = Field(..., description="awareness, leads, sales, retention")
    budget_total: float | None = None
    platforms: list[str] = []
    target_audience: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None


class CampaignGenerateRequest(BaseModel):
    business_id: str
    objective: str
    budget: float = 1000.0
    duration: int = 30
    platforms: list[str] = ["instagram", "facebook", "linkedin"]
    target_audience: str = ""


class CampaignResponse(BaseModel):
    id: str
    business_id: str | None = None
    name: str
    objective: str
    status: str
    platforms: list | None = None
    budget_total: float | None = None
    budget_allocation: dict | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    content_calendar: list | None = None
    tasks: list | None = None
    kpis: dict | None = None
    performance_data: dict | None = None
    ai_strategy: dict | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CampaignUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    objective: str | None = None
    status: str | None = None
    platforms: list[str] | None = None
    budget_total: float | None = None
    target_audience: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
