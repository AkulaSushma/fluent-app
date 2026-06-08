"""
Fluent API — Conversational AI tutor endpoints.
"""

from __future__ import annotations

import datetime
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.db.models import User, TutorMessage, DailyPlan, ContentItem, ContentType, CefrLevel
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


@router.get("/history", response_model=list[ChatMessage])
async def get_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get the tutor conversation history for the current user.
    """
    stmt = (
        select(TutorMessage)
        .where(TutorMessage.user_id == current_user.id)
        .order_by(TutorMessage.created_at.asc())
    )
    result = await db.execute(stmt)
    messages = result.scalars().all()
    return [
        ChatMessage(role=msg.role, content=msg.content)
        for msg in messages
    ]


@router.post("/chat", response_model=TutorResponse)
async def chat(
    body: TutorTurn,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Send a message to the AI tutor. The client maintains conversation
    history (for backwards compatibility), but the server loads actual persistent 
    history from the database and updates it.
    """
    # 1. Fetch user's local today date based on their timezone
    tz_str = current_user.timezone or "UTC"
    try:
        from zoneinfo import ZoneInfo
        user_tz = ZoneInfo(tz_str)
    except Exception:
        user_tz = datetime.timezone.utc

    now_utc = datetime.datetime.now(datetime.timezone.utc)
    now_local = now_utc.astimezone(user_tz)
    today = now_local.date()

    # 2. Query today's DailyPlan to inject active content items
    vocab_words = []
    grammar_topics = []

    plan_stmt = select(DailyPlan).where(
        DailyPlan.user_id == current_user.id,
        DailyPlan.date == today
    )
    daily_plan = (await db.execute(plan_stmt)).scalar_one_or_none()

    if daily_plan:
        content_ids = []
        for task in (daily_plan.morning_tasks or []):
            content_ids.extend(task.get("content_ids") or [])
        for task in (daily_plan.evening_tasks or []):
            content_ids.extend(task.get("content_ids") or [])

        if content_ids:
            item_stmt = select(ContentItem).where(ContentItem.id.in_(content_ids))
            items = (await db.execute(item_stmt)).scalars().all()
            for item in items:
                if item.type == ContentType.vocab:
                    w = item.payload.get("word")
                    if w:
                        vocab_words.append(w)
                elif item.type == ContentType.grammar:
                    t = item.payload.get("topic") or item.payload.get("prompt")
                    if t:
                        grammar_topics.append(t)

    # 3. Determine user's CEFR level
    user_level = current_user.level or "intermediate"
    if user_level == "beginner":
        user_cefr = CefrLevel.A2
    elif user_level == "advanced":
        user_cefr = CefrLevel.C1
    else:
        user_cefr = CefrLevel.B2

    # 4. Construct dynamically adapted system prompt
    adapted_prompt = _SYSTEM_PROMPT
    adaptation_info = f"\n\n[USER CONTEXT]\nUser Level: {user_cefr.value}\n"
    if vocab_words:
        adaptation_info += f"Today's Vocabulary Words: {', '.join(vocab_words)}\n"
    if grammar_topics:
        adaptation_info += f"Today's Grammar Topic/Focus: {', '.join(grammar_topics)}\n"
    
    adaptation_info += (
        "Please naturally and gently weave these vocabulary terms and grammar topics into the dialogue "
        "when appropriate, and encourage the user to use them."
    )

    messages = [
        {"role": "system", "content": adapted_prompt + adaptation_info}
    ]

    # 5. Fetch past 20 messages from the database
    history_stmt = (
        select(TutorMessage)
        .where(TutorMessage.user_id == current_user.id)
        .order_by(TutorMessage.created_at.desc())
        .limit(20)
    )
    res = await db.execute(history_stmt)
    past_messages = list(res.scalars().all())
    past_messages.reverse()

    for msg in past_messages:
        messages.append({"role": msg.role, "content": msg.content})

    # Append current user message
    messages.append({"role": "user", "content": body.message})

    # 6. Call LLM (or fallback on error)
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

    # 7. Persist both user message and assistant reply to DB
    user_msg_db = TutorMessage(
        user_id=current_user.id,
        role="user",
        content=body.message
    )
    assistant_msg_db = TutorMessage(
        user_id=current_user.id,
        role="assistant",
        content=reply
    )
    db.add(user_msg_db)
    db.add(assistant_msg_db)
    await db.commit()

    return TutorResponse(reply=reply)
