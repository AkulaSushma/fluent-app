from __future__ import annotations

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime, timezone
try:
    from zoneinfo import ZoneInfo
except ImportError:
    try:
        import pytz
        def ZoneInfo(tz_name):
            return pytz.timezone(tz_name)
    except ImportError:
        def ZoneInfo(tz_name):
            return timezone.utc

from app.api.deps import get_current_user, get_db
from app.db.models import User, ContentItem, ContentType, CefrLevel, UserItemState, DailySession
from app.schemas.content import ContentItemOut, ContentReviewRequest, UserItemStateOut
from app.services.fsrs import calculate_next_review

router = APIRouter(prefix="/content", tags=["content"])


@router.get("", response_model=List[ContentItemOut])
async def get_content_items(
    type: Optional[ContentType] = None,
    cefr: Optional[CefrLevel] = None,
    topic: Optional[str] = None,
    exclude_ids: Optional[str] = Query(None, description="Comma-separated list of IDs to exclude"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve filtered content items from the library."""
    query = select(ContentItem).where(ContentItem.active == True)

    # Apply filters
    if type is not None:
        query = query.where(ContentItem.type == type)
    if cefr is not None:
        query = query.where(ContentItem.cefr == cefr)
    if topic is not None:
        query = query.where(ContentItem.topic.ilike(f"%{topic}%"))

    # Apply exclusions
    if exclude_ids:
        exclude_list = [id_str.strip() for id_str in exclude_ids.split(",") if id_str.strip()]
        if exclude_list:
            query = query.where(ContentItem.id.notin_(exclude_list))

    # Apply pagination limit
    query = query.limit(limit)

    result = await db.execute(query)
    items = result.scalars().all()
    return items


@router.post("/review", response_model=UserItemStateOut)
async def review_content_item(
    review_req: ContentReviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log a review for a content item, updating its FSRS schedule and session log."""
    item_id = review_req.item_id
    grade = review_req.grade

    # Verify content item exists
    content_item = await db.get(ContentItem, item_id)
    if not content_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content item with ID {item_id} not found",
        )

    # Fetch user timezone
    tz_str = current_user.timezone or "UTC"
    try:
        user_tz = ZoneInfo(tz_str)
    except Exception:
        user_tz = timezone.utc

    # Get local calendar date for daily sessions
    now_utc = datetime.now(timezone.utc)
    now_local = now_utc.astimezone(user_tz)
    today_local_date = now_local.date()

    # Fetch or initialize UserItemState
    stmt = select(UserItemState).where(
        and_(
            UserItemState.user_id == current_user.id,
            UserItemState.item_id == item_id
        )
    )
    result = await db.execute(stmt)
    state = result.scalar_one_or_none()

    if not state:
        state = UserItemState(
            user_id=current_user.id,
            item_id=item_id,
            stability=2.5,
            difficulty=5.0,
            due_at=now_utc,
            reps=0,
            lapses=0,
            last_reviewed=None
        )
        db.add(state)

    # Calculate next FSRS values
    new_stability, new_difficulty, due_at = calculate_next_review(
        stability=state.stability,
        difficulty=state.difficulty,
        grade=grade,
        last_reviewed=state.last_reviewed,
        current_time=now_utc
    )

    # Update state
    state.stability = new_stability
    state.difficulty = new_difficulty
    state.due_at = due_at
    state.reps += 1
    if grade == 0:
        state.lapses += 1
    state.last_reviewed = now_utc

    # Log to DailySession
    session_stmt = select(DailySession).where(
        and_(
            DailySession.user_id == current_user.id,
            DailySession.session_date == today_local_date
        )
    )
    session_result = await db.execute(session_stmt)
    session_record = session_result.scalar_one_or_none()

    if not session_record:
        session_record = DailySession(
            user_id=current_user.id,
            session_date=today_local_date,
            items_served=[item_id],
            completed=[item_id]
        )
        db.add(session_record)
    else:
        served = list(session_record.items_served or [])
        completed = list(session_record.completed or [])
        if item_id not in served:
            served.append(item_id)
        if item_id not in completed:
            completed.append(item_id)
        session_record.items_served = served
        session_record.completed = completed

    await db.flush()
    return state

