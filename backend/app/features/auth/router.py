import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import delete, select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.core.dependencies import get_current_user, require_owner
from app.features.auth.models import LoginAttempt, PasswordReset, User
from app.features.auth.schemas import (
    ChangePassword,
    ForgotPasswordRequest,
    RefreshTokenRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
    UserUpdateProfile,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

settings = get_settings()

LOCKOUT_WINDOW_MINUTES = 15


async def _check_login_lockout(db: AsyncSession, email: str) -> bool:
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=LOCKOUT_WINDOW_MINUTES)
    result = await db.execute(
        select(LoginAttempt).where(
            and_(
                LoginAttempt.email == email,
                LoginAttempt.success == False,
                LoginAttempt.attempted_at >= cutoff,
            )
        )
    )
    recent_failures = len(result.scalars().all())
    return recent_failures >= settings.MAX_LOGIN_ATTEMPTS


async def _record_login_attempt(db: AsyncSession, email: str, ip_address: str, success: bool):
    attempt = LoginAttempt(
        email=email,
        ip_address=ip_address,
        success=success,
    )
    db.add(attempt)

    if success:
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=LOCKOUT_WINDOW_MINUTES)
        await db.execute(
            delete(LoginAttempt).where(
                and_(
                    LoginAttempt.email == email,
                    LoginAttempt.attempted_at >= cutoff,
                )
            )
        )

    await db.flush()


async def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        email=data.email,
        full_name=data.full_name,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    await db.flush()

    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    data: UserLogin,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    if await _check_login_lockout(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account locked due to too many failed attempts. "
                   f"Try again in {LOCKOUT_WINDOW_MINUTES} minutes.",
        )

    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    client_ip = request.client.host if request.client else "unknown"

    if user is None or not verify_password(data.password, user.password_hash):
        await _record_login_attempt(db, data.email, client_ip, False)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    await _record_login_attempt(db, data.email, client_ip, True)

    user.last_login_at = datetime.now(timezone.utc)
    await db.flush()

    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_refresh_token(data.refresh_token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated",
        )

    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdateProfile,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url

    await db.flush()
    return UserResponse.model_validate(current_user)


@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    data: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(data.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_user.password_hash = hash_password(data.new_password)
    await db.flush()

    return {"success": True, "message": "Password changed successfully"}


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if user is None:
        return {"success": True, "message": "If the email exists, a reset link has been sent"}

    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode()).hexdigest()

    await db.execute(
        delete(PasswordReset).where(PasswordReset.user_id == str(user.id))
    )

    reset = PasswordReset(
        user_id=str(user.id),
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    )
    db.add(reset)
    await db.flush()

    logger = __import__("logging").getLogger(__name__)
    logger.info(f"Password reset requested for user ID {user.id}")

    return {
        "success": True,
        "message": "If the email exists, a reset link has been sent",
    }


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    token_hash = hashlib.sha256(data.token.encode()).hexdigest()

    result = await db.execute(
        select(PasswordReset).where(
            PasswordReset.token_hash == token_hash,
            PasswordReset.used.is_(False),
        )
    )
    reset = result.scalar_one_or_none()

    if reset is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    if datetime.now(timezone.utc) > reset.expires_at:
        reset.used = True
        await db.flush()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    user_result = await db.execute(select(User).where(User.id == reset.user_id))
    user = user_result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found",
        )

    user.password_hash = hash_password(data.new_password)
    reset.used = True
    await db.flush()

    return {"success": True, "message": "Password reset successfully"}


@router.get("/users", response_model=list[UserResponse])
async def list_organization_members(
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    from app.features.business.models import OrganizationMember

    result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.user_id == current_user.id,
        )
    )
    membership = result.scalar_one_or_none()

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of any organization",
        )

    members_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == membership.organization_id,
        )
    )
    members = members_result.scalars().all()

    user_ids = [m.user_id for m in members]
    users_result = await db.execute(select(User).where(User.id.in_(user_ids)))
    users = users_result.scalars().all()

    return [UserResponse.model_validate(u) for u in users]
