import contextvars
from typing import Any

# Context variable to hold API keys resolved from user settings for the duration of the request
user_api_keys: contextvars.ContextVar[dict[str, str | None]] = contextvars.ContextVar(
    "user_api_keys", 
    default={"gemini_api_key": None, "openrouter_api_key": None, "groq_api_key": None}
)
