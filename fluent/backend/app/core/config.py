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


import socket

def force_ipv4_in_url(url_str: str) -> str:
    if not url_str or "://" not in url_str:
        return url_str
    if url_str.startswith("sqlite"):
        return url_str
    try:
        prefix, rest = url_str.split("://", 1)
        if "@" in rest:
            credentials, host_port_db = rest.split("@", 1)
        else:
            credentials = ""
            host_port_db = rest
            
        if "/" in host_port_db:
            host_port, db = host_port_db.split("/", 1)
        else:
            host_port = host_port_db
            db = ""
            
        if ":" in host_port:
            host, port = host_port.split(":", 1)
        else:
            host = host_port
            port = ""
            
        if not host:
            return url_str
            
        try:
            addr_info = socket.getaddrinfo(host, None, family=socket.AF_INET)
            if addr_info:
                ipv4_address = addr_info[0][4][0]
                host = ipv4_address
        except Exception as e:
            import logging
            logging.warning(f"[DNS Resolver] Could not resolve host {host} to IPv4: {e}")
            
        new_host_port = f"{host}:{port}" if port else host
        new_host_port_db = f"{new_host_port}/{db}" if db else new_host_port
        new_rest = f"{credentials}@{new_host_port_db}" if credentials else new_host_port_db
        return f"{prefix}://{new_rest}"
    except Exception as e:
        import logging
        logging.warning(f"[DNS Resolver] Error forcing IPv4: {e}")
        return url_str

settings = Settings()

# Clean DATABASE_URL for async compatibility (e.g. for Railway Postgres deployment)
_db_url = settings.DATABASE_URL
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql+psycopg://", 1)
elif _db_url.startswith("postgresql://"):
    _db_url = _db_url.replace("postgresql://", "postgresql+psycopg://", 1)
elif _db_url.startswith("sqlite://") and not _db_url.startswith("sqlite+aiosqlite://"):
    _db_url = _db_url.replace("sqlite://", "sqlite+aiosqlite://", 1)

# Force IPv4 resolution to prevent IPv6 routing failures on Render
_db_url = force_ipv4_in_url(_db_url)
settings.DATABASE_URL = _db_url
