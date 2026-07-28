from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, verify_business_access
from app.core.exceptions import NotFoundException
from app.features.auth.models import User
from app.features.business.models import Business
from app.features.business.extended_models import Persona
from app.features.personas.schemas import PersonaGenerateRequest, PersonaGenerateResponse, PersonaResponse
from app.ai.agents.persona_generator import generate_personas

router = APIRouter(prefix="/personas", tags=["Personas"])


@router.post("/generate", response_model=PersonaGenerateResponse)
async def generate_personas_endpoint(
    data: PersonaGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    business = await verify_business_access(data.business_id, current_user=current_user, db=db)

    ai_result = await generate_personas(business)

    saved_personas = []
    for p in ai_result.get("personas", []):
        persona = Persona(
            business_id=data.business_id,
            name=p.get("name", "Unknown Persona"),
            age_range=p.get("age_range"),
            job_title=p.get("job_title"),
            income_range=p.get("income_range"),
            demographics=p.get("demographics"),
            pain_points=p.get("pain_points", []),
            goals=p.get("goals", []),
            preferred_channels=p.get("preferred_channels", []),
            buying_behavior=p.get("buying_behavior"),
            content_preferences=p.get("content_preferences", []),
            objections=p.get("objections", []),
            customer_journey=p.get("customer_journey"),
        )
        db.add(persona)
        await db.flush()
        saved_personas.append(persona)

    return PersonaGenerateResponse(
        personas=[PersonaResponse.model_validate(p) for p in saved_personas],
        count=len(saved_personas),
    )


@router.get("/{business_id}", response_model=list[PersonaResponse])
async def list_personas(
    business_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_business_access(business_id, current_user=current_user, db=db)

    offset = (page - 1) * page_size
    result = await db.execute(
        select(Persona)
        .where(Persona.business_id == business_id, Persona.is_active == True)
        .order_by(Persona.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    personas = result.scalars().all()
    return [PersonaResponse.model_validate(p) for p in personas]


@router.get("/detail/{persona_id}", response_model=PersonaResponse)
async def get_persona(
    persona_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Persona).where(Persona.id == persona_id)
    )
    persona = result.scalar_one_or_none()
    if persona is None:
        raise NotFoundException("Persona", str(persona_id))
    await verify_business_access(persona.business_id, current_user=current_user, db=db)
    return PersonaResponse.model_validate(persona)


@router.delete("/detail/{persona_id}", status_code=status.HTTP_200_OK)
async def delete_persona(
    persona_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Persona).where(Persona.id == persona_id)
    )
    persona = result.scalar_one_or_none()
    if persona is None:
        raise NotFoundException("Persona", str(persona_id))
    await verify_business_access(persona.business_id, current_user=current_user, db=db)
    persona.is_active = False
    await db.flush()
    return {"success": True, "message": "Persona deleted"}
