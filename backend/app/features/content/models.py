from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, JSON, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.shared.models import UUIDMixin, TimestampMixin


class MarketingAsset(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "marketing_assets"

    business_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("businesses.id"), nullable=False
    )
    campaign_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("campaigns.id"), nullable=True
    )
    asset_type: Mapped[str] = mapped_column(String(100), nullable=False)
    platform: Mapped[str | None] = mapped_column(String(100), nullable=True)
    title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    meta_data: Mapped[dict | None] = mapped_column(JSON, default=dict)
    seo_data: Mapped[dict | None] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(50), default="draft")
    performance_data: Mapped[dict | None] = mapped_column(JSON, default=dict)

    business = relationship("Business", foreign_keys=[business_id])
    campaign = relationship("Campaign", back_populates="marketing_assets")


class SEOReport(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "seo_reports"

    business_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("businesses.id"), nullable=False
    )
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    report_type: Mapped[str] = mapped_column(String(100), nullable=False)
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    keywords: Mapped[dict | None] = mapped_column(JSON, default=list)
    issues: Mapped[dict | None] = mapped_column(JSON, default=list)
    recommendations: Mapped[dict | None] = mapped_column(JSON, default=list)
    meta_tags: Mapped[dict | None] = mapped_column(JSON, default=dict)
    schema_suggestions: Mapped[dict | None] = mapped_column(JSON, default=dict)
    topic_clusters: Mapped[dict | None] = mapped_column(JSON, default=list)
    full_report: Mapped[dict | None] = mapped_column(JSON, default=dict)


class AdCampaign(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "ad_campaigns"

    business_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("businesses.id"), nullable=False
    )
    campaign_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("campaigns.id"), nullable=True
    )
    platform: Mapped[str] = mapped_column(String(100), nullable=False)
    ad_type: Mapped[str] = mapped_column(String(100), nullable=False)
    headlines: Mapped[dict | None] = mapped_column(JSON, default=list)
    descriptions: Mapped[dict | None] = mapped_column(JSON, default=list)
    target_audience: Mapped[dict | None] = mapped_column(JSON, default=dict)
    budget_recommendation: Mapped[float | None] = mapped_column(nullable=True)
    bidding_strategy: Mapped[str | None] = mapped_column(String(100), nullable=True)
    keywords: Mapped[dict | None] = mapped_column(JSON, default=list)
    predicted_ctr: Mapped[float | None] = mapped_column(nullable=True)
    predicted_cpc: Mapped[float | None] = mapped_column(nullable=True)
    ab_variations: Mapped[dict | None] = mapped_column(JSON, default=list)
    performance_data: Mapped[dict | None] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(50), default="draft")


class Competitor(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "competitors"

    business_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("businesses.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    analysis: Mapped[dict | None] = mapped_column(JSON, default=dict)
    strengths: Mapped[dict | None] = mapped_column(JSON, default=list)
    weaknesses: Mapped[dict | None] = mapped_column(JSON, default=list)
    marketing_gaps: Mapped[dict | None] = mapped_column(JSON, default=list)
    content_gaps: Mapped[dict | None] = mapped_column(JSON, default=list)
    recommendations: Mapped[dict | None] = mapped_column(JSON, default=list)


class AutomationWorkflow(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "automation_workflows"

    business_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("businesses.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    workflow_type: Mapped[str] = mapped_column(String(100), nullable=False)
    nodes: Mapped[dict | None] = mapped_column(JSON, default=list)
    edges: Mapped[dict | None] = mapped_column(JSON, default=list)
    triggers: Mapped[dict | None] = mapped_column(JSON, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    execution_count: Mapped[int] = mapped_column(Integer, default=0)
    last_executed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Chat(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "chats"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    business_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("businesses.id"), nullable=False
    )
    messages: Mapped[dict | None] = mapped_column(JSON, default=list)
    context: Mapped[dict | None] = mapped_column(JSON, default=dict)


class AIUsage(UUIDMixin, Base):
    __tablename__ = "ai_usage"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    organization_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("organizations.id"), nullable=False
    )
    operation_type: Mapped[str] = mapped_column(String(100), nullable=False)
    model_used: Mapped[str] = mapped_column(String(100), nullable=False)
    tokens_input: Mapped[int] = mapped_column(Integer, default=0)
    tokens_output: Mapped[int] = mapped_column(Integer, default=0)
    estimated_cost: Mapped[float] = mapped_column(default=0.0)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(50), default="success")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Notification(UUIDMixin, Base):
    __tablename__ = "notifications"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String(50), default="info")
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
