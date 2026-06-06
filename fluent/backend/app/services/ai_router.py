"""
Fluent API — Resilient multi-provider AI completion router.

Call chain:  Groq  →  Gemini  →  OpenRouter
Each provider gets up to 2 attempts with 1.5 s backoff on 429 (rate-limit).
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

import httpx

from app.core.config import settings

log = logging.getLogger(__name__)

_TIMEOUT = httpx.Timeout(60.0, connect=10.0)


class AIUnavailable(Exception):
    """Raised when all three AI providers have been exhausted."""
    pass


# ── Helpers ──────────────────────────────────────────────────────────


def _openai_messages(messages: list[dict]) -> list[dict]:
    """Normalise messages into OpenAI-compatible format."""
    return [{"role": m["role"], "content": m["content"]} for m in messages]


def _gemini_messages(messages: list[dict]) -> tuple[str | None, list[dict]]:
    """
    Convert OpenAI-style messages → Gemini ``systemInstruction`` + ``contents``.
    Returns (system_text, contents_list).
    """
    system_text: str | None = None
    contents: list[dict] = []
    for m in messages:
        role = m["role"]
        if role == "system":
            system_text = m["content"]
        else:
            gemini_role = "user" if role == "user" else "model"
            contents.append({
                "role": gemini_role,
                "parts": [{"text": m["content"]}],
            })
    return system_text, contents


# ── Provider implementations ────────────────────────────────────────


async def _groq(
    messages: list[dict],
    json_mode: bool = False,
    fast: bool = False,
) -> str:
    """Call Groq's OpenAI-compatible chat endpoint."""
    if not settings.GROQ_API_KEY:
        raise AIUnavailable("GROQ_API_KEY not configured")

    model = settings.GROQ_MODEL_FAST if fast else settings.GROQ_MODEL
    body: dict[str, Any] = {
        "model": model,
        "messages": _openai_messages(messages),
        "temperature": 0.7,
    }
    if json_mode:
        body["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json=body,
        )
        if resp.status_code == 429:
            raise httpx.HTTPStatusError(
                "Rate limited", request=resp.request, response=resp
            )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def _gemini(
    messages: list[dict],
    json_mode: bool = False,
) -> str:
    """Call Google Gemini generateContent API."""
    from app.core.context import user_api_keys
    
    ctx_keys = user_api_keys.get()
    api_key = ctx_keys.get("gemini_api_key") or settings.GEMINI_API_KEY
    if not api_key:
        raise AIUnavailable("GEMINI_API_KEY not configured")

    system_text, contents = _gemini_messages(messages)

    body: dict[str, Any] = {"contents": contents}
    if system_text:
        body["systemInstruction"] = {
            "parts": [{"text": system_text}],
        }
    generation_config: dict[str, Any] = {"temperature": 0.7}
    if json_mode:
        generation_config["responseMimeType"] = "application/json"
    body["generationConfig"] = generation_config

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/"
        f"models/{settings.GEMINI_MODEL}:generateContent"
        f"?key={api_key}"
    )

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.post(url, json=body)
        if resp.status_code == 429:
            raise httpx.HTTPStatusError(
                "Rate limited", request=resp.request, response=resp
            )
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


async def _openrouter(
    messages: list[dict],
    json_mode: bool = False,
) -> str:
    """Call OpenRouter's OpenAI-compatible chat endpoint."""
    from app.core.context import user_api_keys
    
    ctx_keys = user_api_keys.get()
    api_key = ctx_keys.get("openrouter_api_key") or settings.OPENROUTER_API_KEY
    if not api_key:
        raise AIUnavailable("OPENROUTER_API_KEY not configured")

    body: dict[str, Any] = {
        "model": settings.OPENROUTER_MODEL,
        "messages": _openai_messages(messages),
        "temperature": 0.7,
    }
    if json_mode:
        body["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://fluent.app",
                "X-Title": "Fluent",
            },
            json=body,
        )
        if resp.status_code == 429:
            raise httpx.HTTPStatusError(
                "Rate limited", request=resp.request, response=resp
            )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


# ── Public API ───────────────────────────────────────────────────────

_PROVIDERS: list[tuple[str, Any]] = [
    ("groq", _groq),
    ("gemini", _gemini),
    ("openrouter", _openrouter),
]


async def ai_complete(
    messages: list[dict],
    *,
    json_mode: bool = False,
    fast: bool = False,
) -> str:
    """
    Try each AI provider in order.  Each gets 2 attempts with a 1.5 s
    back-off on 429 rate-limits.  Returns the first successful response
    or raises ``AIUnavailable``.
    """
    errors: list[str] = []

    for provider_name, provider_fn in _PROVIDERS:
        for attempt in range(1, 3):
            try:
                kwargs: dict[str, Any] = {
                    "messages": messages,
                    "json_mode": json_mode,
                }
                # Only Groq accepts the `fast` parameter
                if provider_name == "groq":
                    kwargs["fast"] = fast

                result = await provider_fn(**kwargs)
                log.info("AI response via %s (attempt %d)", provider_name, attempt)
                return result

            except httpx.HTTPStatusError as exc:
                if exc.response.status_code == 429 and attempt < 2:
                    log.warning(
                        "%s rate-limited (attempt %d), retrying in 1.5 s …",
                        provider_name,
                        attempt,
                    )
                    await asyncio.sleep(1.5)
                    continue
                errors.append(f"{provider_name}[{attempt}]: HTTP {exc.response.status_code}")
                log.warning("Provider %s failed: %s", provider_name, exc)
                break

            except AIUnavailable as exc:
                errors.append(f"{provider_name}: {exc}")
                log.info("Skipping %s — %s", provider_name, exc)
                break

            except Exception as exc:
                errors.append(f"{provider_name}[{attempt}]: {exc}")
                log.warning("Provider %s failed unexpectedly: %s", provider_name, exc)
                break

    raise AIUnavailable(f"All AI providers exhausted. Errors: {'; '.join(errors)}")


async def ai_json(
    messages: list[dict],
    *,
    fast: bool = False,
) -> dict:
    """
    Call ``ai_complete`` with ``json_mode=True`` and parse the response
    as JSON.  Handles markdown-wrapped code fences (```json ... ```) that
    some models emit even in json mode.
    """
    raw = await ai_complete(messages, json_mode=True, fast=fast)
    text = raw.strip()
    # Strip markdown code fences if present
    if text.startswith("```"):
        lines = text.split("\n")
        # Remove first and last lines (``` markers)
        lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)
    return json.loads(text)
