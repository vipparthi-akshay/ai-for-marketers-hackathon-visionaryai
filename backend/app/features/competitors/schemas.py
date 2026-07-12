import uuid

from pydantic import BaseModel


class CompetitorAnalyzeRequest(BaseModel):
    business_id: uuid.UUID
    competitor_name: str
    website_url: str = ""


class CompetitorResponse(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    name: str
    website_url: str | None = None
    analysis: dict | None = None
    strengths: list | None = None
    weaknesses: list | None = None
    marketing_gaps: list | None = None
    content_gaps: list | None = None
    recommendations: list | None = None
    created_at: uuid.UUID

    model_config = {"from_attributes": True}
