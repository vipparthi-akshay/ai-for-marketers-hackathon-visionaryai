from pydantic import BaseModel


class SEOAnalyzeRequest(BaseModel):
    business_id: str
    url: str = ""


class SEOResponse(BaseModel):
    id: str
    business_id: str
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
