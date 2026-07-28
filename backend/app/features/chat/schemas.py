from datetime import datetime

from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: str | None = None


class ChatRequest(BaseModel):
    business_id: str
    message: str
    context: list[dict] | None = None


class ChatResponse(BaseModel):
    response: str
    messages: list[ChatMessage]
