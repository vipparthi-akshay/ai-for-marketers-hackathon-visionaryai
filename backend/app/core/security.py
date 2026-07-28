import re
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import get_settings

settings = get_settings()

COMMON_PASSWORDS = {
    "password", "password1", "password12", "password123", "123456", "12345678",
    "123456789", "1234567890", "qwerty", "abc123", "letmein", "admin", "admin123",
    "welcome", "monkey", "master", "dragon", "login", "princess", "football",
    "shadow", "sunshine", "trustno1", "iloveyou", "batman", "access", "hello",
    "charlie", "donald", "passw0rd", "michael", "pass", "pass123", "pass1234",
    "qwerty123", "1q2w3e4r", "baseball", "soccer", "hockey", "ranger",
    "buster", "thomas", "hunter", "killer", "george", "pepper", "zxcvbn",
    "summer", "winter", "spring", "ashley", "jessica", "maggie", "andrew",
    "joshua", "matthew", "123qwe",
}

SPECIAL_CHAR_PATTERN = re.compile(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?`~]")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access", "iss": settings.APP_NAME})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh", "iss": settings.APP_NAME})
    return jwt.encode(to_encode, settings.jwt_refresh_secret_key, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.APP_NAME,
        )
        if payload.get("type") != "access":
            return None
        return payload
    except (jwt.InvalidTokenError, jwt.ExpiredSignatureError, jwt.InvalidIssuerError):
        return None


def decode_refresh_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_refresh_secret_key,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.APP_NAME,
        )
        if payload.get("type") != "refresh":
            return None
        return payload
    except (jwt.InvalidTokenError, jwt.ExpiredSignatureError, jwt.InvalidIssuerError):
        return None


def validate_password_strength(
    password: str, email: str = "", full_name: str = ""
) -> tuple[bool, list[str]]:
    errors = []

    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")

    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter")

    if not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter")

    if not re.search(r"\d", password):
        errors.append("Password must contain at least one digit")

    if not SPECIAL_CHAR_PATTERN.search(password):
        errors.append("Password must contain at least one special character")

    if password.lower() in COMMON_PASSWORDS:
        errors.append("Password is too common. Please choose a stronger password")

    if email:
        email_local = email.split("@")[0].lower()
        if len(email_local) >= 4 and email_local in password.lower():
            errors.append("Password should not be similar to your email address")

    if full_name:
        name_parts = [p.lower() for p in full_name.split() if len(p) >= 3]
        for part in name_parts:
            if part in password.lower():
                errors.append("Password should not be similar to your name")
                break

    return (len(errors) == 0, errors)
