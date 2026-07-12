import uuid

from pydantic import BaseModel


class SEOAnalyzeRequest(BaseModel):
    business_id: uuid.UUID
    url: str = ""


class SEOKeyword(BaseModel):
    keyword: str
    difficulty: int = 50
    volume: str = "medium"
    relevance: int = 70


class SEOIssue(BaseModel):
    severity: str = "medium"
    category: str = ""
    description: str = ""
    fix: str = ""


class SEOResponse(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    url: str | None = None
    report_type: str
    score: int | None = None
    keywords: list[dict] | None = None
    issues: list[dict] | None = None
    recommendations: list[str] | None = None
    meta_tags: dict | None = None
    topic_clusters: list | None = None
    full_report: dict | None = None

    model_config = {"from_attributes": True}
