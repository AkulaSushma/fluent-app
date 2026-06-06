"""
Fluent API — Speech-to-text service using Groq Whisper.
"""

from __future__ import annotations

import logging
import re

import httpx

from app.core.config import settings

log = logging.getLogger(__name__)

_TIMEOUT = httpx.Timeout(30.0, connect=10.0)


def _sanitize_exception(e: Exception) -> str:
    """Sanitize exceptions to avoid leaking API keys or URLs and keep messages short."""
    import re
    msg = ""
    if isinstance(e, httpx.HTTPStatusError):
        status_code = e.response.status_code
        # Try to parse JSON error message
        try:
            data = e.response.json()
            if isinstance(data, dict) and "error" in data:
                err_info = data["error"]
                if isinstance(err_info, dict) and "message" in err_info:
                    msg = err_info["message"]
                elif isinstance(err_info, str):
                    msg = err_info
        except Exception:
            pass
        if not msg:
            msg = e.response.reason_phrase
        msg = f"HTTP {status_code}: {msg}"
    else:
        msg = str(e)

    # Redact keys and tokens
    msg = re.sub(r"key=[a-zA-Z0-9_\-]+", "key=***", msg)
    msg = re.sub(r"Bearer\s+[a-zA-Z0-9_\-\.]+", "Bearer ***", msg)
    # Remove URLs to prevent UI clutter
    msg = re.sub(r"https?://\S+", "", msg)
    # Clean up spaces and trailing punctuation
    msg = re.sub(r"\s+", " ", msg).strip()
    msg = msg.rstrip(".:* ")

    # Limit message length strictly to 90 characters
    if len(msg) > 90:
        msg = msg[:87] + "..."
    return msg


async def transcribe_audio(
    audio_bytes: bytes, 
    filename: str = "audio.webm", 
    gemini_key: str | None = None,
    openrouter_key: str | None = None,
    groq_key: str | None = None
) -> str:
    """
    Send raw audio bytes to Groq's Whisper endpoint, Google Gemini, or OpenRouter
    and return the transcribed text.
    """
    import base64
    
    # Determine MIME type from filename
    mime = "audio/webm"
    if filename.endswith(".wav"):
        mime = "audio/wav"
    elif filename.endswith(".mp3") or filename.endswith(".mpeg"):
        mime = "audio/mp3"
    elif filename.endswith(".m4a") or filename.endswith(".aac"):
        mime = "audio/aac"
    elif filename.endswith(".ogg"):
        mime = "audio/ogg"

    errors = []

    # 1. Try Groq Whisper if key exists
    api_key_groq = groq_key or settings.GROQ_API_KEY
    if api_key_groq:
        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                resp = await client.post(
                    "https://api.groq.com/openai/v1/audio/transcriptions",
                    headers={"Authorization": f"Bearer {api_key_groq}"},
                    data={"model": settings.GROQ_WHISPER, "language": "en"},
                    files={"file": (filename, audio_bytes, mime)},
                )
                resp.raise_for_status()
                data = resp.json()
                transcript: str = data.get("text", "").strip()
                log.info("Whisper transcription: %d characters", len(transcript))
                return transcript
        except Exception as e:
            log.warning("Groq Whisper transcription failed: %s", e)
            errors.append(f"Groq: {_sanitize_exception(e)}")

    # 2. Try Gemini if key is provided or configured in settings
    api_key = gemini_key or settings.GEMINI_API_KEY
    if api_key:
        try:
            audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
            url = (
                f"https://generativelanguage.googleapis.com/v1beta/"
                f"models/{settings.GEMINI_MODEL}:generateContent"
                f"?key={api_key}"
            )
            body = {
                "contents": [
                    {
                        "parts": [
                            {
                                "inlineData": {
                                    "mimeType": mime,
                                    "data": audio_b64
                                }
                            },
                            {
                                "text": (
                                    "Transcribe this audio exactly as it is spoken. "
                                    "Do not add any conversational text, explanations, or formatting. "
                                    "Just output the plain text transcription. "
                                    "If you cannot hear anything or it is silent, output an empty string."
                                )
                            }
                        ]
                    }
                ]
            }
            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                resp = await client.post(url, json=body)
                resp.raise_for_status()
                data = resp.json()
                transcript = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                log.info("Gemini transcription: %d characters", len(transcript))
                return transcript
        except Exception as e:
            log.warning("Gemini transcription failed: %s", e)
            errors.append(f"Gemini: {_sanitize_exception(e)}")

    # 3. Try OpenRouter if key is provided or configured in settings
    api_key_or = openrouter_key or settings.OPENROUTER_API_KEY
    if api_key_or:
        try:
            audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
            # Map MIME type to OpenRouter input_audio format string
            fmt = "wav"
            if mime == "audio/mp3":
                fmt = "mp3"
            elif mime == "audio/aac":
                fmt = "aac"
            elif mime == "audio/webm":
                fmt = "webm"
            elif mime == "audio/ogg":
                fmt = "ogg"

            url = "https://openrouter.ai/api/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key_or}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://fluent.app",
                "X-Title": "Fluent"
            }
            body = {
                "model": "google/gemini-2.5-flash",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": (
                                    "Transcribe this audio exactly as it is spoken. "
                                    "Do not add any conversational text, explanations, or formatting. "
                                    "Just output the plain text transcription. "
                                    "If you cannot hear anything or it is silent, output an empty string."
                                )
                            },
                            {
                                "type": "input_audio",
                                "input_audio": {
                                    "data": audio_b64,
                                    "format": fmt
                                }
                            }
                        ]
                    }
                ]
            }
            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                resp = await client.post(url, headers=headers, json=body)
                resp.raise_for_status()
                data = resp.json()
                if "error" in data:
                    raise RuntimeError(data["error"].get("message", "OpenRouter error"))
                transcript = data["choices"][0]["message"]["content"].strip()
                log.info("OpenRouter transcription: %d characters", len(transcript))
                return transcript
        except Exception as e:
            err_msg = _sanitize_exception(e)
            log.warning("OpenRouter transcription failed: %s", err_msg)
            errors.append(f"OpenRouter: {err_msg}")

    # 4. Raise error if no key could transcribe
    if errors:
        raise RuntimeError(" | ".join(errors))
    raise RuntimeError("No transcription service configured (Groq/Gemini/OpenRouter)")

