from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, verify_business_access
from app.core.exceptions import NotFoundException
from app.features.auth.models import User
from app.features.business.models import Business
from app.features.content.models import AutomationWorkflow
from app.features.automation.schemas import WorkflowCreate, WorkflowGenerateRequest, WorkflowResponse, WorkflowUpdate
from app.ai.agents.automation_agent import generate_workflow

router = APIRouter(prefix="/automation", tags=["Marketing Automation"])


@router.post("/workflows", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    data: WorkflowCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_business_access(data.business_id, current_user=current_user, db=db)

    workflow = AutomationWorkflow(
        business_id=data.business_id,
        name=data.name,
        description=data.description,
        workflow_type=data.workflow_type,
        nodes=data.nodes or [],
        edges=data.edges or [],
        triggers=data.triggers or [],
    )
    db.add(workflow)
    await db.flush()
    return WorkflowResponse.model_validate(workflow)


@router.post("/workflows/generate", response_model=WorkflowResponse)
async def generate_ai_workflow(
    data: WorkflowGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    business = await verify_business_access(data.business_id, current_user=current_user, db=db)

    ai_result = await generate_workflow(
        business_name=business.name,
        industry=business.industry,
        workflow_type=data.workflow_type,
        goal=data.goal,
    )

    workflow = AutomationWorkflow(
        business_id=data.business_id,
        name=ai_result.get("workflow_name", f"{data.workflow_type} Workflow"),
        description=ai_result.get("description", ""),
        workflow_type=data.workflow_type,
        nodes=ai_result.get("nodes", []),
        edges=ai_result.get("edges", []),
    )
    db.add(workflow)
    await db.flush()
    return WorkflowResponse.model_validate(workflow)


@router.get("/workflows/{business_id}", response_model=list[WorkflowResponse])
async def list_workflows(
    business_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_business_access(business_id, current_user=current_user, db=db)

    offset = (page - 1) * page_size
    result = await db.execute(
        select(AutomationWorkflow)
        .where(AutomationWorkflow.business_id == business_id)
        .order_by(AutomationWorkflow.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    return [WorkflowResponse.model_validate(w) for w in result.scalars().all()]


@router.get("/workflows/detail/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AutomationWorkflow).where(AutomationWorkflow.id == workflow_id)
    )
    workflow = result.scalar_one_or_none()
    if workflow is None:
        raise NotFoundException("Workflow", str(workflow_id))
    await verify_business_access(workflow.business_id, current_user=current_user, db=db)
    return WorkflowResponse.model_validate(workflow)


@router.put("/workflows/detail/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: str,
    data: WorkflowUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AutomationWorkflow).where(AutomationWorkflow.id == workflow_id)
    )
    workflow = result.scalar_one_or_none()
    if workflow is None:
        raise NotFoundException("Workflow", str(workflow_id))
    await verify_business_access(workflow.business_id, current_user=current_user, db=db)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(workflow, field, value)

    await db.flush()
    return WorkflowResponse.model_validate(workflow)


@router.delete("/workflows/detail/{workflow_id}", status_code=status.HTTP_200_OK)
async def delete_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AutomationWorkflow).where(AutomationWorkflow.id == workflow_id)
    )
    workflow = result.scalar_one_or_none()
    if workflow is None:
        raise NotFoundException("Workflow", str(workflow_id))
    await verify_business_access(workflow.business_id, current_user=current_user, db=db)
    await db.delete(workflow)
    await db.flush()
    return {"success": True, "message": "Workflow deleted"}


@router.get("/templates")
async def get_workflow_templates(
    current_user: User = Depends(get_current_user),
):
    return [
        {
            "name": "Welcome Email Sequence",
            "description": "Automated welcome series for new subscribers",
            "workflow_type": "email_sequence",
            "nodes": [
                {"id": "trigger", "type": "trigger", "label": "New Subscriber", "config": {"event": "subscribe"}},
                {"id": "email1", "type": "action", "label": "Welcome Email", "config": {"template": "welcome"}},
                {"id": "delay1", "type": "delay", "label": "Wait 1 Day", "config": {"duration": "1d"}},
                {"id": "email2", "type": "action", "label": "Value Email", "config": {"template": "value"}},
            ],
            "edges": [
                {"source": "trigger", "target": "email1"},
                {"source": "email1", "target": "delay1"},
                {"source": "delay1", "target": "email2"},
            ],
        },
        {
            "name": "Lead Nurture Funnel",
            "description": "Nurture leads from awareness to conversion",
            "workflow_type": "lead_nurture",
            "nodes": [
                {"id": "trigger", "type": "trigger", "label": "Form Submission", "config": {"event": "form_submit"}},
                {"id": "email1", "type": "action", "label": "Thank You Email", "config": {"template": "thankyou"}},
                {"id": "delay1", "type": "delay", "label": "Wait 3 Days", "config": {"duration": "3d"}},
                {"id": "condition", "type": "condition", "label": "Opened Email?", "config": {"metric": "opened"}},
                {"id": "email2a", "type": "action", "label": "Case Study", "config": {"template": "casestudy"}},
                {"id": "email2b", "type": "action", "label": "Re-engagement", "config": {"template": "reengage"}},
            ],
            "edges": [
                {"source": "trigger", "target": "email1"},
                {"source": "email1", "target": "delay1"},
                {"source": "delay1", "target": "condition"},
                {"source": "condition", "target": "email2a", "label": "Yes"},
                {"source": "condition", "target": "email2b", "label": "No"},
            ],
        },
        {
            "name": "Social Media Scheduler",
            "description": "Auto-schedule social posts across platforms",
            "workflow_type": "social_scheduling",
            "nodes": [
                {"id": "trigger", "type": "trigger", "label": "Weekly Schedule", "config": {"event": "cron", "schedule": "weekly"}},
                {"id": "content", "type": "action", "label": "Generate Content", "config": {"action": "ai_generate"}},
                {"id": "approve", "type": "condition", "label": "Auto-Approve?", "config": {"auto": True}},
                {"id": "post", "type": "action", "label": "Post to Social", "config": {"action": "social_post"}},
            ],
            "edges": [
                {"source": "trigger", "target": "content"},
                {"source": "content", "target": "approve"},
                {"source": "approve", "target": "post", "label": "Yes"},
            ],
        },
    ]


@router.post("/workflows/{workflow_id}/activate", response_model=WorkflowResponse)
async def activate_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AutomationWorkflow).where(AutomationWorkflow.id == workflow_id)
    )
    workflow = result.scalar_one_or_none()
    if workflow is None:
        raise NotFoundException("Workflow", str(workflow_id))

    await verify_business_access(workflow.business_id, current_user=current_user, db=db)

    workflow.is_active = True
    await db.flush()
    return WorkflowResponse.model_validate(workflow)


@router.post("/workflows/{workflow_id}/deactivate", response_model=WorkflowResponse)
async def deactivate_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AutomationWorkflow).where(AutomationWorkflow.id == workflow_id)
    )
    workflow = result.scalar_one_or_none()
    if workflow is None:
        raise NotFoundException("Workflow", str(workflow_id))

    await verify_business_access(workflow.business_id, current_user=current_user, db=db)

    workflow.is_active = False
    await db.flush()
    return WorkflowResponse.model_validate(workflow)
