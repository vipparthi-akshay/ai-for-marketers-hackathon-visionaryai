import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.shared.models import UUIDMixin, TimestampMixin


class Persona(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "personas"

    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    age_range: Mapped[str | None] = mapped_column(String(50), nullable=True)
    job_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    income_range: Mapped[str | None] = mapped_column(String(100), nullable=True)
    demographics: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    pain_points: Mapped[dict | None] = mapped_column(JSONB, default=list)
    goals: Mapped[dict | None] = mapped_column(JSONB, default=list)
    preferred_channels: Mapped[dict | None] = mapped_column(JSONB, default=list)
    buying_behavior: Mapped[str | None] = mapped_column(Text, nullable=True)
    content_preferences: Mapped[dict | None] = mapped_column(JSONB, default=list)
    objections: Mapped[dict | None] = mapped_column(JSONB, default=list)
    customer_journey: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    business = relationship("Business", back_populates="personas")


class Campaign(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "campaigns"

    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    objective: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft")
    target_audience: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    platforms: Mapped[dict | None] = mapped_column(JSONB, default=list)
    budget_total: Mapped[float | None] = mapped_column(nullable=True)
    budget_allocation: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    start_date: Mapped[datetime | None] = mapped_column(nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(nullable=True)
    content_calendar: Mapped[dict | None] = mapped_column(JSONB, default=list)
    tasks: Mapped[dict | None] = mapped_column(JSONB, default=list)
    kpis: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    performance_data: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    ai_strategy: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    business = relationship("Business", back_populates="campaigns")
    marketing_assets = relationship("MarketingAsset", back_populates="campaign")
