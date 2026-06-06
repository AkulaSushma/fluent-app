"""
Fluent API — AI / tutor chat schemas.
"""

from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str  # "system" | "user" | "assistant"
    content: str


class TutorTurn(BaseModel):
    history: list[ChatMessage] = []
    message: str


class TutorResponse(BaseModel):
    reply: str
