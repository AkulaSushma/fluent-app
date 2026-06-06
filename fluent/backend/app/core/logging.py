"""
Fluent API — Structured logging configuration.

- **dev** : human-readable coloured stream handler.
- **production** : JSON-formatted lines for log aggregators.
"""

import logging
import sys
import json
from datetime import datetime, timezone

from app.core.config import settings


class _JsonFormatter(logging.Formatter):
    """Emit each log record as a single JSON line."""

    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info and record.exc_info[1] is not None:
            log_obj["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_obj, default=str)


class _DevFormatter(logging.Formatter):
    """Simple readable formatter for development."""

    _FMT = "%(asctime)s | %(levelname)-8s | %(name)s — %(message)s"
    _DATE_FMT = "%H:%M:%S"

    def __init__(self) -> None:
        super().__init__(fmt=self._FMT, datefmt=self._DATE_FMT)


def setup_logging(level: int = logging.INFO) -> None:
    """Configure the root logger based on the current environment."""
    root = logging.getLogger()
    root.setLevel(level)

    # Remove any existing handlers to avoid duplicate output.
    for handler in root.handlers[:]:
        root.removeHandler(handler)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)

    if settings.ENV == "dev":
        handler.setFormatter(_DevFormatter())
    else:
        handler.setFormatter(_JsonFormatter())

    root.addHandler(handler)

    # Quieten noisy third-party loggers
    for name in ("httpx", "httpcore", "uvicorn.access"):
        logging.getLogger(name).setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Return a named logger (call after setup_logging)."""
    return logging.getLogger(name)
