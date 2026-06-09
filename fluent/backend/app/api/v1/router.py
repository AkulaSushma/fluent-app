"""
Fluent API — Main v1 router that aggregates all sub-routers.
"""

from fastapi import APIRouter

from app.api.v1.articles import router as articles_router
from app.api.v1.auth import router as auth_router
from app.api.v1.coach import router as coach_router
from app.api.v1.curriculum import router as curriculum_router
from app.api.v1.speaking import router as speaking_router
from app.api.v1.gamification import router as gamification_router
from app.api.v1.grammar import router as grammar_router
from app.api.v1.progress import router as progress_router
from app.api.v1.pronunciation import router as pronunciation_router
from app.api.v1.settings import router as settings_router
from app.api.v1.srs import router as srs_router
from app.api.v1.tutor import router as tutor_router
from app.api.v1.vocab import router as vocab_router
from app.api.v1.cognitive import router as cognitive_router
from app.api.v1.content import router as content_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(vocab_router)
api_router.include_router(grammar_router)
api_router.include_router(pronunciation_router)
api_router.include_router(articles_router)
api_router.include_router(tutor_router)
api_router.include_router(progress_router)
api_router.include_router(curriculum_router)
api_router.include_router(srs_router)
api_router.include_router(gamification_router)
api_router.include_router(settings_router)
api_router.include_router(coach_router)
api_router.include_router(cognitive_router)
api_router.include_router(content_router)
api_router.include_router(speaking_router)

