from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.shared.models import UUIDMixin, TimestampMixin


class Organization(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    owner_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    plan: Mapped[str] = mapped_column(String(50), default="starter")

    members = relationship("OrganizationMember", back_populates="organization")
    businesses = relationship("Business", back_populates="organization")


class OrganizationMember(UUIDMixin, Base):
    __tablename__ = "organization_members"

    organization_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("organizations.id"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(50), default="member", nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    organization = relationship("Organization", back_populates="members")


class Business(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "businesses"

    organization_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("organizations.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    industry: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String(5000), nullable=True)
    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    products: Mapped[dict | None] = mapped_column(JSON, default=list)
    target_audience: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    marketing_goals: Mapped[dict | None] = mapped_column(JSON, default=list)
    budget_range: Mapped[str | None] = mapped_column(String(50), nullable=True)
    social_links: Mapped[str | None] = mapped_column(JSON, default=dict)
    brand_voice: Mapped[str | None] = mapped_column(String(100), nullable=True)
    business_analysis: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    marketing_score: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    organization = relationship("Organization", back_populates="businesses")
    personas = relationship("Persona", back_populates="business")
    campaigns = relationship("Campaign", back_populates="business")
