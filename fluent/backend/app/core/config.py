"""
Fluent API — Application configuration via environment variables.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Fluent API"
    ENV: str = "dev"

    # Auth / Security
    SECRET_KEY: str = "change-me-in-prod"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 14  # 14 days

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./fluent.db"

    # ── AI Provider Keys ──
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""

    # ── AI Model Identifiers ──
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_MODEL_FAST: str = "llama-3.1-8b-instant"
    GROQ_WHISPER: str = "whisper-large-v3-turbo"
    GEMINI_MODEL: str = "gemini-2.5-flash"
    OPENROUTER_MODEL: str = "meta-llama/llama-3.3-70b-instruct"


settings = Settings()
