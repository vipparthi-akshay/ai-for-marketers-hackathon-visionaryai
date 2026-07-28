from datetime import datetime

from pydantic import BaseModel, Field


class ContentGenerateRequest(BaseModel):
    business_id: str
    asset_type: str = Field(..., description="blog, instagram_post, linkedin_post, etc.")
    platform: str = Field(default="general")
    tone: str = Field(default="professional")
    topic: str = Field(default="")
    instructions: str = Field(default="")
    campaign_id: str | None = None


class ContentResponse(BaseModel):
    id: str
    asset_type: str
    platform: str | None = None
    title: str | None = None
    content: str
    meta_data: dict | None = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ContentVariation(BaseModel):
    title: str
    content: str
    hashtags: list[str] = []
    best_time_to_post: str | None = None
    engagement_prediction: str | None = None
    seo_keywords: list[str] = []
    call_to_action: str | None = None


class ContentGenerateResponse(BaseModel):
    variations: list[ContentVariation]
    asset_type: str
    platform: str
