import re
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.security import validate_password_strength


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        valid, errors = validate_password_strength(v)
        if not valid:
            raise ValueError("; ".join(errors))
        return v

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z0-9\s\-'\.]+$", v):
            raise ValueError(
                "Name can only contain letters, numbers, spaces, hyphens, "
                "apostrophes, and periods"
            )
        if len(v.strip()) < 1:
            raise ValueError("Name cannot be empty or whitespace")
        return v.strip()


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: str | None = None
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserUpdateProfile(BaseModel):
    full_name: str | None = Field(None, min_length=1, max_length=255)
    avatar_url: str | None = Field(None, max_length=500)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not re.match(r"^[a-zA-Z0-9\s\-'\.]+$", v):
            raise ValueError(
                "Name can only contain letters, numbers, spaces, hyphens, "
                "apostrophes, and periods"
            )
        return v.strip()


class ChangePassword(BaseModel):
    old_password: str
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        valid, errors = validate_password_strength(v)
        if not valid:
            raise ValueError("; ".join(errors))
        return v


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        valid, errors = validate_password_strength(v)
        if not valid:
            raise ValueError("; ".join(errors))
        return v
