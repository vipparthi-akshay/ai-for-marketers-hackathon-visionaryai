import uuid
import re
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, verify_business_access
from app.core.exceptions import ConflictException, NotFoundException
from app.features.auth.models import User
from app.features.business.models import Business, Organization, OrganizationMember
from app.features.business.schemas import (
    BusinessAnalysisResponse,
    BusinessCreate,
    BusinessResponse,
    BusinessUpdate,
    OrganizationCreate,
    OrganizationResponse,
)

router = APIRouter(prefix="/businesses", tags=["Businesses"])


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text


@router.post("/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    data: OrganizationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    slug = slugify(data.name) + f"-{str(uuid.uuid4())[:8]}"

    org = Organization(
        name=data.name,
        slug=slug,
        owner_id=current_user.id,
    )
    db.add(org)
    await db.flush()

    membership = OrganizationMember(
        organization_id=org.id,
        user_id=current_user.id,
        role="owner",
    )
    db.add(membership)
    await db.flush()

    return OrganizationResponse.model_validate(org)


@router.post("/{org_id}/businesses", response_model=BusinessResponse, status_code=status.HTTP_201_CREATED)
async def create_business(
    org_id: str,
    data: BusinessCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.user_id == current_user.id,
        )
    )
    membership = result.scalar_one_or_none()
    if membership is None:
        raise NotFoundException("Organization", str(org_id))

    business = Business(
        organization_id=org_id,
        name=data.name,
        industry=data.industry,
        description=data.description,
        website_url=data.website_url,
        products=data.products,
        target_audience=data.target_audience,
        marketing_goals=data.marketing_goals,
        budget_range=data.budget_range,
        social_links=data.social_links,
        brand_voice=data.brand_voice,
    )
    db.add(business)
    await db.flush()

    return BusinessResponse.model_validate(business)


@router.get("/{org_id}/businesses", response_model=list[BusinessResponse])
async def list_businesses(
    org_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.user_id == current_user.id,
        )
    )
    if member_result.scalar_one_or_none() is None:
        raise NotFoundException("Organization", str(org_id))

    offset = (page - 1) * page_size
    result = await db.execute(
        select(Business).where(
            Business.organization_id == org_id,
            Business.is_active == True,
        )
        .offset(offset)
        .limit(page_size)
    )
    businesses = result.scalars().all()
    return [BusinessResponse.model_validate(b) for b in businesses]


@router.get("/{org_id}/businesses/{business_id}", response_model=BusinessResponse)
async def get_business(
    org_id: str,
    business_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Business).where(
            Business.id == business_id,
            Business.organization_id == org_id,
        )
    )
    business = result.scalar_one_or_none()
    if business is None:
        raise NotFoundException("Business", str(business_id))

    member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.user_id == current_user.id,
        )
    )
    if member_result.scalar_one_or_none() is None:
        raise NotFoundException("Business", str(business_id))

    return BusinessResponse.model_validate(business)


@router.put("/{org_id}/businesses/{business_id}", response_model=BusinessResponse)
async def update_business(
    org_id: str,
    business_id: str,
    data: BusinessUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Business).where(
            Business.id == business_id,
            Business.organization_id == org_id,
        )
    )
    business = result.scalar_one_or_none()
    if business is None:
        raise NotFoundException("Business", str(business_id))

    member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.user_id == current_user.id,
        )
    )
    if member_result.scalar_one_or_none() is None:
        raise NotFoundException("Business", str(business_id))

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(business, field, value)

    await db.flush()
    return BusinessResponse.model_validate(business)


@router.post("/{org_id}/businesses/{business_id}/analyze", response_model=BusinessAnalysisResponse)
async def analyze_business(
    org_id: str,
    business_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Business).where(
            Business.id == business_id,
            Business.organization_id == org_id,
        )
    )
    business = result.scalar_one_or_none()
    if business is None:
        raise NotFoundException("Business", str(business_id))

    member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.user_id == current_user.id,
        )
    )
    if member_result.scalar_one_or_none() is None:
        raise NotFoundException("Business", str(business_id))

    from app.ai.agents.business_analyzer import analyze_business_profile

    analysis = await analyze_business_profile(business)

    business.business_analysis = analysis
    business.marketing_score = analysis.get("marketing_score", 0)
    await db.flush()

    return BusinessAnalysisResponse(
        business_id=business.id,
        marketing_score=business.marketing_score,
        swot=analysis.get("swot", {}),
        opportunities=analysis.get("opportunities", []),
        strengths=analysis.get("strengths", []),
        weaknesses=analysis.get("weaknesses", []),
        recommendations=analysis.get("recommendations", []),
        competitor_suggestions=analysis.get("competitor_suggestions", []),
    )
