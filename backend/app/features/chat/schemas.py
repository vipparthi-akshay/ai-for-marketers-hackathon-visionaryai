import uuid
from datetime import datetime

from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: str | None = None


class ChatRequest(BaseModel):
    business_id: uuid.UUID
    message: str


class ChatResponse(BaseModel):
    response: str
    messages: list[ChatMessage]
