import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.exceptions import NotFoundException
from app.features.auth.models import User
from app.features.business.extended_models import AutomationWorkflow
from app.features.automation.schemas import WorkflowCreate, WorkflowResponse

router = APIRouter(prefix="/automation", tags=["Marketing Automation"])


@router.post("/workflows", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    data: WorkflowCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    workflow = AutomationWorkflow(
        business_id=data.business_id,
        name=data.name,
        description=data.description,
        workflow_type=data.workflow_type,
        nodes=[],
        edges=[],
    )
    db.add(workflow)
    await db.flush()
    return WorkflowResponse.model_validate(workflow)


@router.get("/workflows/{business_id}", response_model=list[WorkflowResponse])
async def list_workflows(
    business_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AutomationWorkflow)
        .where(AutomationWorkflow.business_id == business_id)
        .order_by(AutomationWorkflow.created_at.desc())
    )
    return [WorkflowResponse.model_validate(w) for w in result.scalars().all()]


@router.get("/templates")
async def get_workflow_templates():
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
    workflow_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AutomationWorkflow).where(AutomationWorkflow.id == workflow_id)
    )
    workflow = result.scalar_one_or_none()
    if workflow is None:
        raise NotFoundException("Workflow", str(workflow_id))

    workflow.is_active = True
    await db.flush()
    return WorkflowResponse.model_validate(workflow)


@router.post("/workflows/{workflow_id}/deactivate", response_model=WorkflowResponse)
async def deactivate_workflow(
    workflow_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AutomationWorkflow).where(AutomationWorkflow.id == workflow_id)
    )
    workflow = result.scalar_one_or_none()
    if workflow is None:
        raise NotFoundException("Workflow", str(workflow_id))

    workflow.is_active = False
    await db.flush()
    return WorkflowResponse.model_validate(workflow)
