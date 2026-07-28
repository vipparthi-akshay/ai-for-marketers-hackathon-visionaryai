from datetime import datetime

from pydantic import BaseModel, Field


class WorkflowCreate(BaseModel):
    business_id: str
    name: str = Field(min_length=1, max_length=255)
    description: str = ""
    workflow_type: str = "email_sequence"
    nodes: list | None = None
    edges: list | None = None
    triggers: list | None = None


class WorkflowGenerateRequest(BaseModel):
    business_id: str
    workflow_type: str = "email_sequence"
    goal: str = Field(min_length=1, max_length=500)


class WorkflowUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    description: str | None = None
    workflow_type: str | None = None
    nodes: list | None = None
    edges: list | None = None
    triggers: list | None = None
    is_active: bool | None = None


class WorkflowResponse(BaseModel):
    id: str
    business_id: str
    name: str
    description: str | None = None
    workflow_type: str
    nodes: list | None = None
    edges: list | None = None
    triggers: list | None = None
    is_active: bool
    execution_count: int
    last_executed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WorkflowTemplate(BaseModel):
    name: str
    description: str
    workflow_type: str
    nodes: list
    edges: list
