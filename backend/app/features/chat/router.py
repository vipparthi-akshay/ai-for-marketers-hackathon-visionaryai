from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, verify_business_access
from app.core.exceptions import NotFoundException
from app.features.auth.models import User
from app.features.business.models import Business
from app.features.content.models import Chat
from app.features.chat.schemas import ChatRequest, ChatResponse, ChatMessage
from app.ai.clients import ai_client
from app.ai.prompts.templates import CHAT_ASSISTANT_SYSTEM

router = APIRouter(prefix="/chat", tags=["Chat Assistant"])


@router.post("")
async def send_message(
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    business = await verify_business_access(data.business_id, current_user=current_user, db=db)

    chat_result = await db.execute(
        select(Chat).where(
            Chat.user_id == current_user.id,
            Chat.business_id == data.business_id,
        )
    )
    chat = chat_result.scalar_one_or_none()

    if chat is None:
        chat = Chat(
            user_id=current_user.id,
            business_id=data.business_id,
            messages=[],
        )
        db.add(chat)

    messages = chat.messages or []
    messages.append({
        "role": "user",
        "content": data.message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    products_str = ", ".join(business.products) if business.products else "N/A"
    goals_str = ", ".join(business.marketing_goals) if business.marketing_goals else "N/A"

    business_context = f"""
Business: {business.name}
Industry: {business.industry}
Description: {business.description or 'N/A'}
Products: {products_str}
Target Audience: {business.target_audience or 'N/A'}
Marketing Goals: {goals_str}
Marketing Score: {business.marketing_score}/100
"""

    context_messages = data.context or messages[-10:]
    conversation_history = "\n".join([
        f"{'User' if m.get('role', 'user') == 'user' else 'Assistant'}: {m.get('content', '')}"
        for m in context_messages
    ])

    prompt = f"""Business Context:
{business_context}

Conversation History:
{conversation_history}

User's latest message: {data.message}

Respond as a helpful marketing assistant. Be concise and actionable."""

    async def generate_stream():
        full_response = ""
        try:
            async for chunk in ai_client.generate_stream(
                prompt=prompt,
                system_instruction=CHAT_ASSISTANT_SYSTEM,
                temperature=0.7,
            ):
                full_response += chunk
                yield chunk
        except Exception:
            fallback = await ai_client.generate(
                prompt=prompt,
                system_instruction=CHAT_ASSISTANT_SYSTEM,
                temperature=0.7,
            )
            full_response = fallback
            yield fallback

        messages.append({
            "role": "assistant",
            "content": full_response,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        chat.messages = messages

    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={"X-Stream": "true"},
    )


@router.get("/history/{business_id}")
async def get_chat_history(
    business_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_business_access(business_id, current_user=current_user, db=db)

    result = await db.execute(
        select(Chat).where(
            Chat.user_id == current_user.id,
            Chat.business_id == business_id,
        )
    )
    chat = result.scalar_one_or_none()

    if chat is None:
        return {"messages": []}

    return {"messages": chat.messages or []}


@router.delete("/history/{business_id}")
async def clear_chat_history(
    business_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_business_access(business_id, current_user=current_user, db=db)

    result = await db.execute(
        select(Chat).where(
            Chat.user_id == current_user.id,
            Chat.business_id == business_id,
        )
    )
    chat = result.scalar_one_or_none()

    if chat:
        chat.messages = []
        await db.flush()

    return {"message": "Chat history cleared"}
