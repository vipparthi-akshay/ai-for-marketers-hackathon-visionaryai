from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.features.auth.models import User
from app.features.auth.schemas import UserResponse

router = APIRouter(prefix="/settings", tags=["User Settings"])


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = Field(None, min_length=1, max_length=255)
    avatar_url: str | None = Field(None, max_length=500)


class NotificationPreferences(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    marketing_emails: bool = False
    weekly_report: bool = True
    campaign_alerts: bool = True
    team_mentions: bool = True

    model_config = {"from_attributes": True}


class ProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: str | None = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    notification_preferences: NotificationPreferences = NotificationPreferences()

    model_config = {"from_attributes": True}


_notification_preferences_store: dict[str, dict] = {}


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
):
    prefs = _notification_preferences_store.get(
        str(current_user.id), NotificationPreferences().model_dump()
    )
    user_data = UserResponse.model_validate(current_user).model_dump()
    user_data["notification_preferences"] = prefs
    return ProfileResponse(**user_data)


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url

    await db.flush()

    prefs = _notification_preferences_store.get(
        str(current_user.id), NotificationPreferences().model_dump()
    )
    user_data = UserResponse.model_validate(current_user).model_dump()
    user_data["notification_preferences"] = prefs
    return ProfileResponse(**user_data)


@router.get("/notifications", response_model=NotificationPreferences)
async def get_notification_preferences(
    current_user: User = Depends(get_current_user),
):
    prefs = _notification_preferences_store.get(
        str(current_user.id), NotificationPreferences().model_dump()
    )
    return NotificationPreferences(**prefs)


@router.put("/notifications", response_model=NotificationPreferences)
async def update_notification_preferences(
    data: NotificationPreferences,
    current_user: User = Depends(get_current_user),
):
    _notification_preferences_store[str(current_user.id)] = data.model_dump()
    return data


@router.delete("/account", status_code=status.HTTP_200_OK)
async def deactivate_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    current_user.is_active = False
    await db.flush()

    _notification_preferences_store.pop(str(current_user.id), None)

    return {"success": True, "message": "Account deactivated successfully"}
