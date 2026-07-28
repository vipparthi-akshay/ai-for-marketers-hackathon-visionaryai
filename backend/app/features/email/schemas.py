from pydantic import BaseModel


class EmailSendRequest(BaseModel):
    business_id: str
    to: list[str]
    subject: str
    body: str
    is_html: bool = True


class EmailTemplateRequest(BaseModel):
    business_id: str
    template_type: str
    recipient_name: str = ""
    custom_variables: dict = {}


class EmailSendResponse(BaseModel):
    success: bool
    message: str
    message_id: str | None = None
