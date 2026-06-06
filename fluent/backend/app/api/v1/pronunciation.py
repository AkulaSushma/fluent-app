"""
Fluent API — Pronunciation evaluation endpoints.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models import User
from app.schemas.learning import PronunciationResult
from app.services.content_service import evaluate_pronunciation
from app.services.tts_service import transcribe_audio

router = APIRouter(prefix="/pronunciation", tags=["pronunciation"])

_MAX_AUDIO_SIZE = 25 * 1024 * 1024  # 25 MB (Whisper limit)


@router.post("/evaluate", response_model=PronunciationResult)
async def evaluate(
    audio: UploadFile = File(...),
    target: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Accept an audio file upload, transcribe it with Groq, Gemini, or OpenRouter,
    and evaluate pronunciation accuracy against the target sentence.
    """
    # Validate file size
    contents = await audio.read()
    if len(contents) > _MAX_AUDIO_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Audio file too large. Maximum size is {_MAX_AUDIO_SIZE // (1024*1024)} MB.",
        )

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file")

    # Retrieve user's keys from request-scoped context populated by get_current_user
    from app.core.context import user_api_keys
    ctx_keys = user_api_keys.get()
    gemini_key = ctx_keys.get("gemini_api_key")
    openrouter_key = ctx_keys.get("openrouter_api_key")
    groq_key = ctx_keys.get("groq_api_key")

    # Check if any transcription key exists
    has_key = bool(
        gemini_key or openrouter_key or groq_key or
        settings.GEMINI_API_KEY or settings.OPENROUTER_API_KEY or settings.GROQ_API_KEY
    )

    if not has_key:
        result = {
            "accuracy": 0,
            "matched_words": [],
            "problem_words": target.split(),
            "tip": "⚠️ Speech transcription requires a Gemini, OpenRouter, or Groq API key. Please save your key in Profile settings, or tap 'Skip voice check' below to bypass."
        }
        return PronunciationResult(**result)

    # Transcribe with configured keys
    filename = audio.filename or "audio.webm"
    transcript = None
    error_msg = ""
    
    try:
        transcript = await transcribe_audio(
            contents, 
            filename, 
            gemini_key=gemini_key, 
            openrouter_key=openrouter_key,
            groq_key=groq_key
        )
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning("Audio transcription failed: %s", e)
        error_msg = str(e)

    if not transcript:
        # Transcription failed (e.g. invalid key, balance error). Return 0% accuracy so it locks and displays the error.
        result = {
            "accuracy": 0,
            "matched_words": [],
            "problem_words": target.split(),
            "tip": f"⚠️ Speech check failed. Error: {error_msg}."
        }
        return PronunciationResult(**result)

    # Evaluate accuracy using AI (or fast-path local match)
    result = await evaluate_pronunciation(target, transcript)
    return PronunciationResult(**result)


