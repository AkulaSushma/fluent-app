from pydantic import BaseModel, Field
from datetime import datetime
from typing import Any, Dict, Optional


class ContentItemOut(BaseModel):
    id: str
    type: str
    cefr: str
    topic: str
    difficulty: float
    payload: Dict[str, Any]
    source: str
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ContentReviewRequest(BaseModel):
    item_id: str
    grade: int = Field(..., ge=0, le=3, description="0=Again, 1=Hard, 2=Good, 3=Easy")


class UserItemStateOut(BaseModel):
    user_id: str
    item_id: str
    stability: float
    difficulty: float
    due_at: datetime
    reps: int
    lapses: int
    last_reviewed: Optional[datetime] = None

    class Config:
        from_attributes = True
