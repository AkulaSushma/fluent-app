"""
Fluent API — JWT authentication and password hashing utilities.
"""

from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

_ALGORITHM = "HS256"


# ── Password helpers ────────────────────────────────────────────────

def hash_password(password: str) -> str:
    """Return a bcrypt hash of *password*."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Check *plain* against *hashed*."""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ── JWT helpers ─────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a signed HS256 JWT embedding *data* as claims."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=_ALGORITHM)


def verify_token(token: str) -> dict:
    """Decode and verify a JWT.  Returns the payload dict or raises JWTError."""
    try:
        payload: dict = jwt.decode(token, settings.SECRET_KEY, algorithms=[_ALGORITHM])
        return payload
    except JWTError:
        raise
