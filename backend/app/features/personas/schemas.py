from datetime import datetime

from pydantic import BaseModel


class PersonaResponse(BaseModel):
    id: str
    business_id: str
    name: str
    age_range: str | None = None
    job_title: str | None = None
    income_range: str | None = None
    demographics: dict | None = None
    pain_points: list | None = None
    goals: list | None = None
    preferred_channels: list | None = None
    buying_behavior: str | None = None
    content_preferences: list | None = None
    objections: list | None = None
    customer_journey: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PersonaGenerateRequest(BaseModel):
    business_id: str


class PersonaGenerateResponse(BaseModel):
    personas: list[PersonaResponse]
    count: int
