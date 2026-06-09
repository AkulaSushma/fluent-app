# app/api/v1/speaking.py
from fastapi import APIRouter, Depends
from datetime import date
import re
import random
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.ai_router import ai_complete
from app.services.cache import cache_get, cache_set, make_key
from app.api.deps import get_current_user, get_db
from app.db.models import User, CardType, SRSCard

router = APIRouter(prefix="/speaking", tags=["speaking"])

SYSTEM = """You are an elite speech coach and scriptwriter for a PREMIUM English app.
Write a CEFR {level} passage of 10-14 sentences on the theme "{theme}".
Voice: warm, motivational, narrative — something the learner WANTS to read aloud.
Vary sentence length for natural rhythm/prosody. Avoid clichés and dry corporate filler.
Embed 5-7 'focus words' rich in tricky English phonemes (th /θ ð/, r/l, v/w, schwa, -tion).
Return STRICT JSON only:
{{"title": str,
  "sentences": [str, ...],
  "focus_words": [{{"word": str, "ipa": str, "tip": str}}, ...],
  "intro": "one short motivational line shown before recording",
  "level": "{level}", "theme": "{theme}"}}"""

def _tokenize(sentences):
    out, idx = [], 0
    for s_i, s in enumerate(sentences):
        words = []
        for w in s.split():
            words.append({"i": idx, "text": w, "clean": "".join(ch for ch in w.lower() if ch.isalnum())})
            idx += 1
        out.append({"sentence_index": s_i, "words": words})
    return out, idx

def _offline_passage(theme: str, level: str, weave_words: list[str] = None) -> dict:
    from app.services.content_library import get_article
    art = get_article(level, random.randint(1, 15))
    content = art.get("content", "")
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', content) if s.strip()]
    
    # Find mock focus words
    words_in_text = list(set(re.findall(r'\b[a-zA-Z]+\b', content.lower())))
    tricky_patterns = ['th', 'r', 'l', 'v', 'w', 'sh', 'ti']
    chosen_words = [w for w in words_in_text if any(p in w for p in tricky_patterns) and len(w) > 4]
    
    focus_words = []
    # Add weaved words first
    if weave_words:
        for word in weave_words:
            focus_words.append({
                "word": word,
                "ipa": "/.../",
                "tip": f"Struggling review word: focus on clear pronunciation."
            })
            
    for word in chosen_words[:max(0, 6 - len(focus_words))]:
        focus_words.append({
            "word": word,
            "ipa": "/.../",
            "tip": f"Practice pronunciation of '{word}' focusing on clear sound production."
        })
        
    return {
        "title": art.get("title", "Practice Reading"),
        "sentences": sentences,
        "focus_words": focus_words,
        "intro": "Read this classical passage to improve speaking rhythm.",
        "level": level,
        "theme": theme
    }

@router.get("/passage")
async def get_passage(theme: str = "confidence", level: str = "B1",
                      db: AsyncSession = Depends(get_db),
                      user: User = Depends(get_current_user)):
    day = date.today().isoformat()
    
    # Query due or struggling vocabulary cards (accuracy < 80% or lapsed)
    # accuracy < 80% corresponds to ease_factor < 2.0 or last_quality < 3, lapsed corresponds to interval_days == 0 after review
    srs_words = []
    try:
        stmt = (
            select(SRSCard.word)
            .where(
                SRSCard.user_id == user.id,
                SRSCard.card_type == CardType.vocab,
                ((SRSCard.next_review <= date.today()) | (SRSCard.last_quality < 3) | (SRSCard.ease_factor < 2.0))
            )
            .order_by(SRSCard.next_review.asc())
            .limit(10)
        )
        res = await db.execute(stmt)
        srs_words = [row[0] for row in res.all()]
    except Exception as e:
        # Fall-soft if query fails
        pass

    weave_words = []
    if srs_words:
        # Pick up to 3 random words to weave
        weave_words = random.sample(srs_words, min(3, len(srs_words)))

    # Weave words are part of cache key to ensure fresh content is generated when weave set changes
    key = make_key("speaking_passage", theme, level, day, "_".join(sorted(weave_words)))
    if (hit := await cache_get(key)) is not None:
        return hit
        
    # Inject weaving instructions in prompt
    prompt = SYSTEM.format(level=level, theme=theme)
    if weave_words:
        prompt += f"\nCRITICAL: You MUST naturally and organically weave the following vocabulary words into the passage: {', '.join(weave_words)}."
        
    try:
        raw = await ai_complete(prompt, json_mode=True)
        data = raw if isinstance(raw, dict) else __import__("json").loads(raw)
    except Exception:
        data = _offline_passage(theme, level, weave_words)
    
    lines, total = _tokenize(data["sentences"])
    
    # Construct a beautiful explanation guide from focus words
    focus_items = data.get("focus_words", [])
    if focus_items:
        explanation = "Key focus words for this passage:\n" + "\n".join([
            f"• {item['word']} ({item.get('ipa', '')}): {item.get('tip', '')}" 
            for item in focus_items
        ])
    else:
        explanation = "Focus on reading at a steady, natural pace. Pause briefly at periods."

    payload = {
        "title": data.get("title", "Daily Reading"),
        "intro": data.get("intro", "Read with confidence. Your voice is getting stronger."),
        "content": " ".join(data["sentences"]),
        "explanation": explanation,
        "lines": lines, 
        "word_count": total,
        "focus_words": focus_items,
        "level": level, 
        "theme": theme,
        "weaved_words": weave_words
    }
    await cache_set(key, payload, ttl=86400)
    return payload

THEMES = ["confidence", "career growth", "travel stories", "technology",
          "leadership", "everyday conversation", "interviews", "storytelling"]

@router.get("/themes")
async def themes(user: User = Depends(get_current_user)):
    return {"themes": THEMES}
