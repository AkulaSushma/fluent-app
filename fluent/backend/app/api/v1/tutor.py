"""
Fluent API — Conversational AI tutor endpoints.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.db.models import User
from app.schemas.ai import ChatMessage, TutorResponse, TutorTurn
from app.services.ai_router import ai_complete

router = APIRouter(prefix="/tutor", tags=["tutor"])

_SYSTEM_PROMPT = (
    "You are Fluent Tutor, a warm, encouraging English conversation partner. "
    "Your goal is to help the user practice English fluency through natural dialogue.\n\n"
    "Guidelines:\n"
    "• Keep responses concise (2-4 sentences) to maintain a conversational rhythm.\n"
    "• GENTLY CORRECT TYPOS AND HOMOPHONES: English learners often write typos or swap homophones "
    "  (such as typing 'wood' instead of 'would', 'could' instead of 'should', 'where' instead of 'were', "
    "  or 'their' instead of 'there'). Always look for their contextual intent. If they make a homophone typo, "
    "  gently correct it first (e.g., 'I think you meant \"would\" instead of \"wood\"!') and then answer their intended question.\n"
    "• If the user makes a grammar or vocabulary mistake, gently correct it inline "
    "  (e.g. 'Great point! Just a small note — we say \"have been\" instead of \"have be\".').\n"
    "• Ask follow-up questions to keep the conversation flowing.\n"
    "• Adjust your vocabulary to match the user's apparent level.\n"
    "• Use natural contractions and spoken English style.\n"
    "• Occasionally introduce a new useful word or phrase and explain it briefly.\n"
    "• Never break character — you are always the English tutor."
)


@router.post("/chat", response_model=TutorResponse)
async def chat(
    body: TutorTurn,
    current_user: User = Depends(get_current_user),
):
    """
    Send a message to the AI tutor. The client maintains conversation
    history and sends it with each turn.
    """
    messages: list[dict] = [
        {"role": "system", "content": _SYSTEM_PROMPT},
    ]

    # Append conversation history
    for msg in body.history:
        messages.append({"role": msg.role, "content": msg.content})

    # Append current user message
    messages.append({"role": "user", "content": body.message})

    try:
        reply = await ai_complete(messages, fast=True)
    except Exception:
        # Fallback local conversational tutor response matching user input keywords
        user_msg = body.message.lower()
        if "hello" in user_msg or "hi" in user_msg:
            reply = "Hello! I'm your Fluent Tutor. How is your day going? Let's practice some English!"
        elif "mistake" in user_msg or "correct" in user_msg:
            reply = "Making mistakes is a natural part of learning. Just keep practicing and you'll get better!"
        elif "grammar" in user_msg:
            reply = "Grammar is like the puzzle pieces of a language. Tell me what topic you want to discuss today!"
        elif "routine" in user_msg or "morning" in user_msg:
            reply = "A structured daily routine is key to success! What does your typical morning look like?"
        elif "motivated" in user_msg or "motivation" in user_msg:
            reply = "Motivation gets you started, but consistency is what keeps you going. Let's practice for just 5 minutes today!"
        else:
            reply = "That's very interesting! Could you tell me more about it? Let's keep the conversation going."

    return TutorResponse(reply=reply)
