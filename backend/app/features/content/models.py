import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.shared.models import UUIDMixin, TimestampMixin


class MarketingAsset(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "marketing_assets"

    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False
    )
    campaign_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=True
    )
    asset_type: Mapped[str] = mapped_column(String(100), nullable=False)
    platform: Mapped[str | None] = mapped_column(String(100), nullable=True)
    title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    metadata: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    seo_data: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    status: Mapped[str] = mapped_column(String(50), default="draft")
    performance_data: Mapped[dict | None] = mapped_column(JSONB, default=dict)

    business = relationship("Business", back_populates="marketing_assets", foreign_keys=[business_id])
    campaign = relationship("Campaign", back_populates="marketing_assets")


class SEOReport(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "seo_reports"

    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False
    )
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    report_type: Mapped[str] = mapped_column(String(100), nullable=False)
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    keywords: Mapped[dict | None] = mapped_column(JSONB, default=list)
    issues: Mapped[dict | None] = mapped_column(JSONB, default=list)
    recommendations: Mapped[dict | None] = mapped_column(JSONB, default=list)
    meta_tags: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    schema_suggestions: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    topic_clusters: Mapped[dict | None] = mapped_column(JSONB, default=list)
    full_report: Mapped[dict | None] = mapped_column(JSONB, default=dict)


class AdCampaign(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "ad_campaigns"

    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False
    )
    campaign_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=True
    )
    platform: Mapped[str] = mapped_column(String(100), nullable=False)
    ad_type: Mapped[str] = mapped_column(String(100), nullable=False)
    headlines: Mapped[dict | None] = mapped_column(JSONB, default=list)
    descriptions: Mapped[dict | None] = mapped_column(JSONB, default=list)
    target_audience: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    budget_recommendation: Mapped[float | None] = mapped_column(nullable=True)
    bidding_strategy: Mapped[str | None] = mapped_column(String(100), nullable=True)
    keywords: Mapped[dict | None] = mapped_column(JSONB, default=list)
    predicted_ctr: Mapped[float | None] = mapped_column(nullable=True)
    predicted_cpc: Mapped[float | None] = mapped_column(nullable=True)
    ab_variations: Mapped[dict | None] = mapped_column(JSONB, default=list)
    performance_data: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    status: Mapped[str] = mapped_column(String(50), default="draft")


class Competitor(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "competitors"

    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    analysis: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    strengths: Mapped[dict | None] = mapped_column(JSONB, default=list)
    weaknesses: Mapped[dict | None] = mapped_column(JSONB, default=list)
    marketing_gaps: Mapped[dict | None] = mapped_column(JSONB, default=list)
    content_gaps: Mapped[dict | None] = mapped_column(JSONB, default=list)
    recommendations: Mapped[dict | None] = mapped_column(JSONB, default=list)


class AutomationWorkflow(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "automation_workflows"

    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    workflow_type: Mapped[str] = mapped_column(String(100), nullable=False)
    nodes: Mapped[dict | None] = mapped_column(JSONB, default=list)
    edges: Mapped[dict | None] = mapped_column(JSONB, default=list)
    triggers: Mapped[dict | None] = mapped_column(JSONB, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    execution_count: Mapped[int] = mapped_column(Integer, default=0)
    last_executed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Chat(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "chats"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False
    )
    messages: Mapped[dict | None] = mapped_column(JSONB, default=list)
    context: Mapped[dict | None] = mapped_column(JSONB, default=dict)


class AIUsage(UUIDMixin, Base):
    __tablename__ = "ai_usage"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
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

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String(50), default="info")
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
