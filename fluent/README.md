# Fluent — Premium English Fluency App

A production-grade English speaking trainer. Expo (mobile) + FastAPI (backend).
AI via free tiers: Groq (primary), Gemini (fallback), OpenRouter (fallback).

## Architecture

```
fluent/
├── backend/     ← FastAPI + SQLAlchemy + AI Router
└── mobile/      ← Expo React Native + Reanimated + Skia
```

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env          # add your free API keys
pip install -e ".[dev]"
uvicorn app.main:app --reload # http://localhost:8000/docs
```

### Mobile

```bash
cd mobile
npm install
npx expo start                # press i / a / w
```

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to your backend URL.

### Docker (Backend)

```bash
docker-compose up --build     # backend at :8000, auto-creates DB
```

## API Keys (Free Tiers)

| Provider    | Get Key At                          | Free Tier            |
|-------------|-------------------------------------|----------------------|
| Groq        | https://console.groq.com           | ~1000 req/day        |
| Gemini      | https://aistudio.google.com        | ~1500 req/day        |
| OpenRouter  | https://openrouter.ai              | Free models          |

Add any/all to `backend/.env`. The AI router falls back gracefully:
**Groq → Gemini → OpenRouter**

## Tech Stack

### Backend
- **FastAPI** — async Python web framework
- **SQLAlchemy 2.0** — async ORM with aiosqlite
- **httpx** — async HTTP client for AI APIs
- **python-jose** — JWT authentication
- **passlib** — bcrypt password hashing

### Mobile
- **Expo SDK 52** — React Native platform
- **React Native Reanimated** — 60fps spring animations
- **React Native Gesture Handler** — swipe/drag physics
- **@shopify/react-native-skia** — GPU-accelerated progress rings
- **Zustand** — lightweight state management
- **Fraunces + Inter** — premium typography

## Features

- 🎙 **Pronunciation Teleprompter** — real-time word-by-word feedback
- 📚 **Swipeable Flashcards** — gesture-driven vocabulary with 3D flip
- 📝 **Grammar Engine** — visual sentence parsing with animated timeline
- 🤖 **AI Tutor** — conversational practice with context awareness
- 📊 **Progress Analytics** — streak tracking, fluency scoring, achievements
- 🏆 **Gamification** — badges, daily goals, streak system

## License

Private — All rights reserved.
