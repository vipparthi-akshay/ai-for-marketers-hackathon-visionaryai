import uuid
from datetime import datetime

from pydantic import BaseModel


class WorkflowCreate(BaseModel):
    business_id: uuid.UUID
    name: str
    description: str = ""
    workflow_type: str = "email_sequence"


class WorkflowResponse(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    name: str
    description: str | None = None
    workflow_type: str
    nodes: list | None = None
    edges: list | None = None
    triggers: list | None = None
    is_active: bool
    execution_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WorkflowTemplate(BaseModel):
    name: str
    description: str
    workflow_type: str
    nodes: list
    edges: list
