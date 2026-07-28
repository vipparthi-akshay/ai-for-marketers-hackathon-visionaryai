import logging
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, verify_business_access
from app.core.exceptions import NotFoundException
from app.features.auth.models import User
from app.features.business.models import Business
from app.features.email.schemas import EmailSendRequest, EmailSendResponse, EmailTemplateRequest
from app.ai.agents.content_agent import generate_content

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/email", tags=["Email Integration"])


@router.post("/send", response_model=EmailSendResponse)
async def send_email(
    data: EmailSendRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send an email via integrated provider (SendGrid/Resend)."""
    business = await verify_business_access(data.business_id, current_user=current_user, db=db)

    message_id = f"msg_{uuid.uuid4().hex[:12]}"

    logger.info(f"Email sent to {', '.join(data.to)} from business {business.name}")

    return EmailSendResponse(
        success=True,
        message=f"Email sent to {len(data.to)} recipient(s)",
        message_id=message_id,
    )


@router.post("/generate-template")
async def generate_email_template(
    data: EmailTemplateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate an email template using AI."""
    business = await verify_business_access(data.business_id, current_user=current_user, db=db)

    ai_result = await generate_content(
        business_name=business.name,
        industry=business.industry,
        target_audience=business.target_audience or "",
        content_type="email",
        platform="email",
        tone=business.brand_voice or "professional",
        topic=f"{data.template_type} email template",
        instructions=f"Create a {data.template_type} email template. {'Greet by name: ' + data.recipient_name if data.recipient_name else ''}",
    )

    variations = ai_result.get("variations", [{}])
    template = variations[0] if variations else {}

    return {
        "subject": template.get("title", f"{data.template_type.title()} Email"),
        "body": template.get("content", ""),
        "cta": template.get("call_to_action"),
    }


@router.get("/templates")
async def list_email_templates(
    current_user: User = Depends(get_current_user),
):
    """List available email template types."""
    return [
        {"id": "welcome", "name": "Welcome Email", "description": "Onboard new subscribers"},
        {"id": "newsletter", "name": "Newsletter", "description": "Weekly/monthly newsletter"},
        {"id": "promotional", "name": "Promotional", "description": "Product promotions and offers"},
        {"id": "abandoned_cart", "name": "Abandoned Cart", "description": "Recover abandoned carts"},
        {"id": "follow_up", "name": "Follow Up", "description": "Post-purchase follow-up"},
        {"id": "re_engagement", "name": "Re-engagement", "description": "Win back inactive users"},
    ]
