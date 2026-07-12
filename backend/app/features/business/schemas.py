import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class OrganizationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class OrganizationResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    plan: str
    created_at: datetime

    model_config = {"from_attributes": True}


class BusinessCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    industry: str = Field(min_length=1, max_length=100)
    description: str | None = Field(None, max_length=5000)
    website_url: str | None = Field(None, max_length=500)
    products: list[str] = []
    target_audience: str | None = Field(None, max_length=2000)
    marketing_goals: list[str] = []
    budget_range: str | None = None
    social_links: dict = {}
    brand_voice: str | None = None


class BusinessUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    industry: str | None = Field(None, max_length=100)
    description: str | None = Field(None, max_length=5000)
    website_url: str | None = Field(None, max_length=500)
    products: list[str] | None = None
    target_audience: str | None = Field(None, max_length=2000)
    marketing_goals: list[str] | None = None
    budget_range: str | None = None
    social_links: dict | None = None
    brand_voice: str | None = None


class BusinessResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    name: str
    industry: str
    description: str | None = None
    website_url: str | None = None
    logo_url: str | None = None
    products: list | None = None
    target_audience: str | None = None
    marketing_goals: list | None = None
    budget_range: str | None = None
    social_links: dict | None = None
    brand_voice: str | None = None
    business_analysis: dict | None = None
    marketing_score: int = 0
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BusinessAnalysisResponse(BaseModel):
    business_id: uuid.UUID
    marketing_score: int
    swot: dict
    opportunities: list[str]
    strengths: list[str]
    weaknesses: list[str]
    recommendations: list[str]
    competitor_suggestions: list[str]
