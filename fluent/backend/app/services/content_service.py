"""
Fluent API — AI-powered content generation service.

Every function builds a prompt, calls ``ai_json()``, and returns a
structured dict ready to be validated by the corresponding Pydantic schema.
"""

from __future__ import annotations

from app.services.ai_router import ai_json
from app.services import content_library
import re
_grammar_lessons_cache: dict[str, dict] = {}
_vocab_decks_cache: dict[str, dict] = {}
_articles_cache: dict[str, dict] = {}


async def generate_grammar_lesson(topic: str, level: str = "advanced") -> dict:
    """
    Generate a structured, rich grammar lesson including rule, detailed explanation,
    timeline, formula, tokenized examples with Hindi/Telugu translations, common mistakes,
    practical tips, and a 5-question quiz with explanations.
    """
    cache_key = f"{topic}:{level}"
    if cache_key in _grammar_lessons_cache:
        return _grammar_lessons_cache[cache_key]

    # Try loading from the pre-defined local library first for instantaneous load and zero AI cost
    try:
        topic_id = topic.strip().lower()
        if topic_id == "formal_vs_informal":
            topic_id = "formal_informal"
            
        from app.services.content_library import get_grammar_topic_by_id, get_grammar_lesson
        lesson = get_grammar_topic_by_id(topic_id) or get_grammar_lesson(topic_id)
        if lesson and "quiz" in lesson and lesson["quiz"]:
            _grammar_lessons_cache[cache_key] = lesson
            return lesson
    except Exception as e:
        import logging
        logging.warning(f"Failed to load lesson '{topic}' from library, falling back to AI: {e}")

    try:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an expert English grammar coach. Focus on teaching grammar structures "
                    "with elite, native-like precision. Make concepts feel premium and intuitive.\n\n"
                    "Respond ONLY with valid JSON matching this schema:\n"
                    "{\n"
                    '  "topic": "<grammar topic name>",\n'
                    '  "level": <integer 1 (Foundation), 2 (Intermediate), 3 (Advanced), or 4 (Pro)>,\n'
                    '  "levelLabel": "<Foundation|Intermediate|Advanced|Pro>",\n'
                    '  "rule": "<punchy, clear 1-2 sentence core rule>",\n'
                    '  "explanation": "<editorial, detailed explanation of how and when to use this structure, clarifying nuances>",\n'
                    '  "formula": "<visual formula, e.g. Subject + have/has + past participle>",\n'
                    '  "timeline": {\n'
                    '    "label_left": "<label for past or beginning of timeline>",\n'
                    '    "label_right": "<label for now/future or end of timeline>",\n'
                    '    "marker": "<marker indicating the specific point/area of interest>"\n'
                    "  },\n"
                    '  "examples": [\n'
                    "    {\n"
                    '      "sentence": "<full example sentence>",\n'
                    '      "tokens": [\n'
                    '        {"text": "<word or punctuation>", "role": "<subject|verb|object|auxiliary|complement|adjective|adverb|preposition|article|conjunction|pronoun|noun>"}\n'
                    "      ],\n"
                    '      "translation_hint": "<Hindi and Telugu translations side-by-side or combined, e.g., Hindi: उसने फ़िल्म देखी। / Telugu: అతను సినిమా చూశాడు.>",\n'
                    '      "note": "<micro-explanation of this specific sentence structure>"\n'
                    "    }\n"
                    "  ],\n"
                    '  "commonMistakes": [\n'
                    "    {\n"
                    '      "wrong": "<incorrect usage example>",\n'
                    '      "right": "<corrected usage example>",\n'
                    '      "explanation": "<clear explanation of why it is incorrect and how to avoid it>"\n'
                    "    }\n"
                    "  ],\n"
                    '  "tipCards": [\n'
                    "    {\n"
                    '      "emoji": "<relevant emoji, e.g. 💡>",\n'
                    '      "title": "<short catchphrase or rule of thumb>",\n'
                    '      "body": "<actionable, premium tip for mastering this construction>"\n'
                    "    }\n"
                    "  ],\n"
                    '  "quiz": [\n'
                    "    {\n"
                    '      "q": "<question text>",\n'
                    '      "options": ["Option A", "Option B", "Option C", "Option D"],\n'
                    '      "answer": <integer 0-3 of the correct option>,\n'
                    '      "explanation": "<detailed explanation of why the correct option is correct and why others are wrong>"\n'
                    "    }\n"
                    "  ]\n"
                    "}\n\n"
                    "CRITICAL REQUIREMENTS:\n"
                    "1. Provide exactly 2 or 3 examples.\n"
                    "2. Provide exactly 2 common mistakes.\n"
                    "3. Provide exactly 1 or 2 tip cards.\n"
                    "4. Provide exactly 5 high-quality quiz questions with 4 options each.\n"
                    "5. Ensure all tokens are listed in order and represent the words of the example sentence.\n"
                    "6. Include Hindi and Telugu translation hints for all examples to build strong learning pathways.\n"
                    "7. For backward compatibility, make sure the response also includes the following top-level keys populated:\n"
                    '   - "example": "<the sentence from the first item in examples>"\n'
                    '   - "tokens": <the tokens array from the first item in examples>'
                ),
            },
            {
                "role": "user",
                "content": f"Generate a detailed grammar lesson on '{topic}' at '{level}' level.",
            },
        ]
        lesson = await ai_json(messages)
        # Ensure fallback fields are populated
        if "examples" in lesson and lesson["examples"]:
            if "example" not in lesson or not lesson["example"]:
                lesson["example"] = lesson["examples"][0].get("sentence", "")
            if "tokens" not in lesson or not lesson["tokens"]:
                lesson["tokens"] = lesson["examples"][0].get("tokens", [])
        _grammar_lessons_cache[cache_key] = lesson
        return lesson
    except Exception:
        return content_library.get_grammar_lesson(topic)


async def generate_vocab_deck(theme: str, count: int = 8) -> dict:
    """Generate a set of vocabulary flashcards around a theme."""
    cache_key = f"{theme}:{count}"
    if cache_key in _vocab_decks_cache:
        return _vocab_decks_cache[cache_key]

    # Try loading from the pre-defined local library first for instantaneous load and zero AI cost
    try:
        from app.services.content_library import get_vocab_deck
        deck = get_vocab_deck(theme, count)
        if deck and "cards" in deck and deck["cards"]:
            _vocab_decks_cache[cache_key] = deck
            return deck
    except Exception as e:
        import logging
        logging.warning(f"Failed to load vocab deck '{theme}' from library: {e}")

    try:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an English vocabulary coach. "
                    "Respond ONLY with valid JSON matching this schema:\n"
                    "{\n"
                    '  "cards": [\n'
                    "    {\n"
                    '      "word": "<vocabulary word>",\n'
                    '      "ipa": "<IPA pronunciation>",\n'
                    '      "definition": "<clear, concise definition>",\n'
                    '      "example": "<natural example sentence>"\n'
                    "    }\n"
                    "  ]\n"
                    "}\n"
                    f"Generate exactly {count} cards. "
                    "Pick highly advanced, worthy, and sophisticated real-world words (CEFR C1/C2 level) "
                    "appropriate for advanced professional and academic learners to build a premium vocabulary. "
                    "Avoid basic or standard words."
                ),
            },
            {
                "role": "user",
                "content": f"Create a vocabulary deck on the theme: {theme}",
            },
        ]
        deck = await ai_json(messages)
        _vocab_decks_cache[cache_key] = deck
        return deck
    except Exception:
        return content_library.get_vocab_deck(theme, count)


async def evaluate_pronunciation(
    target: str,
    transcript: str,
    user_id: str = None,
    db = None,
    audio_bytes: bytes = None
) -> dict:
    """
    Compare user's spoken transcript against target sentence.
    Returns WPM, word-by-word alignment score/status, phonemes, and comparative motivation delta.
    """
    # 1. Try Azure Pronunciation Assessment if enabled
    from app.services.pronunciation_azure import evaluate_with_azure
    if audio_bytes:
        azure_res = await evaluate_with_azure(audio_bytes, target)
        if azure_res:
            if db and user_id:
                try:
                    from app.db.models import SpeakingAttempt
                    new_attempt = SpeakingAttempt(
                        user_id=user_id,
                        passage_theme="Speaking Practice",
                        accuracy=azure_res["accuracy"],
                        wpm=azure_res["fluency_wpm"]
                    )
                    db.add(new_attempt)
                    await db.commit()
                except Exception:
                    pass
            return azure_res

    # 2. Local alignment fallback / cheap path
    target_words = target.split()
    transcript_words = transcript.lower().split()

    words_result = []
    matched_count = 0
    t_idx = 0

    for idx, tw in enumerate(target_words):
        tw_clean = "".join(c for c in tw.lower() if c.isalnum())
        matched = False
        status = "miss"
        score = 0

        # Slide window up to 3 words
        for offset in range(4):
            if t_idx + offset < len(transcript_words):
                trans_w_clean = "".join(c for c in transcript_words[t_idx + offset] if c.isalnum())
                if tw_clean == trans_w_clean or (len(tw_clean) > 3 and (tw_clean in trans_w_clean or trans_w_clean in tw_clean)):
                    matched = True
                    t_idx += offset + 1
                    matched_count += 1
                    score = 100
                    status = "good"
                    break

        if not matched:
            score = 0
            status = "miss"

        words_result.append({
            "i": idx,
            "text": tw,
            "score": score,
            "status": status
        })

    accuracy = int((matched_count / max(len(target_words), 1)) * 100)
    
    # Estimate WPM
    est_duration = max(2.0, len(audio_bytes) / 32000.0) if audio_bytes else 5.0
    wpm = int((len(transcript_words) / est_duration) * 60)
    wpm = max(40, min(wpm, 220))

    # Detect tricky phoneme problems
    problem_phonemes = []
    problems = [w["text"].lower() for w in words_result if w["status"] in ("miss", "warn")]
    phoneme_map = {
        "θ": {"patterns": ["th", "think", "thought", "theme"], "tip": "Place the tip of your tongue slightly between your upper and lower teeth."},
        "r": {"patterns": ["r", "read", "run", "right"], "tip": "Curl your tongue backward without letting the tip touch the roof of your mouth."},
        "v": {"patterns": ["v", "very", "voice", "have"], "tip": "Let your top teeth gently touch your bottom lip while making a voiced sound."},
        "w": {"patterns": ["w", "with", "would", "want"], "tip": "Round your lips into a tight circle like a whistle, then release."}
    }
    
    detected_phonemes = set()
    for w in problems:
        for ph, info in phoneme_map.items():
            if ph not in detected_phonemes and any(pat in w for pat in info["patterns"]):
                detected_phonemes.add(ph)
                problem_phonemes.append({
                    "sound": ph,
                    "examples": [info["patterns"][1]] if len(info["patterns"]) > 1 else [w],
                    "tip": info["tip"]
                })

    # Comparative Motivation Delta
    motivation = "Your reading is steady and clear. Keep practicing to build confidence!"
    if db and user_id:
        try:
            from sqlalchemy import select
            from app.db.models import SpeakingAttempt
            
            stmt = (
                select(SpeakingAttempt)
                .where(SpeakingAttempt.user_id == user_id)
                .order_by(SpeakingAttempt.created_at.desc())
                .limit(1)
            )
            res = await db.execute(stmt)
            last_attempt = res.scalar_one_or_none()

            if last_attempt:
                acc_delta = accuracy - last_attempt.accuracy
                wpm_delta = wpm - last_attempt.wpm
                
                if acc_delta > 0 and wpm_delta > 0:
                    motivation = f"Awesome! You are {acc_delta}% more accurate and read {wpm_delta} WPM faster than your last reading."
                elif acc_delta > 0:
                    motivation = f"Great progress! Your pronunciation accuracy improved by {acc_delta}% since your last attempt."
                elif wpm_delta > 0:
                    motivation = f"Nice! You spoke {wpm_delta} WPM faster than your last reading."
                else:
                    motivation = "You matched your previous performance. Keep speaking to build fluid muscle memory!"

            # Save the new attempt
            new_attempt = SpeakingAttempt(
                user_id=user_id,
                passage_theme="Speaking Practice",
                accuracy=accuracy,
                wpm=wpm
            )
            db.add(new_attempt)
            await db.commit()
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning("Failed to save or compare SpeakingAttempt: %s", e)

    return {
        "accuracy": accuracy,
        "fluency_wpm": wpm,
        "words": words_result,
        "problem_phonemes": problem_phonemes,
        "motivation": motivation
    }




async def generate_article(topic: str, level: str = "advanced", day: int | None = None) -> dict:
    """Generate a reading-practice article for the teleprompter focused on daily life and motivation."""
    cache_key = f"{topic}:{level}:{day}"
    if cache_key in _articles_cache:
        return _articles_cache[cache_key]

    # Try loading from the pre-defined local library first for instantaneous load and zero AI cost
    try:
        from app.services.content_library import get_article
        article = get_article(level, day)
        if article and "content" in article:
            _articles_cache[cache_key] = article
            return article
    except Exception as e:
        import logging
        logging.warning(f"Failed to load article from library: {e}")

    try:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an English content writer for a fluency training app. "
                    "Write a highly sophisticated, thought-provoking, and deeply motivational article "
                    "about daily routines, growth mindset, or professional excellence using advanced vocabulary "
                    "and complex sentence structures (CEFR C1/C2 standard). "
                    "Respond ONLY with valid JSON matching this schema:\n"
                    "{\n"
                    '  "title": "<article title>",\n'
                    '  "content": "<article body, 150-250 words, plain text, well-punctuated, motivational focus>",\n'
                    '  "explanation": "<detailed connected speech guidance (elision, assimilation, intrusion, weak forms), word stress guidelines, and phonetics for difficult words to help the user speak with native-level naturalness and intonation>",\n'
                    '  "word_count": <integer>\n'
                    "}\n"
                    "Make the content interesting, motivational, and natural-sounding."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Write a {level}-level article about: {topic}. "
                    "It will be used as an auto-scrolling teleprompter script for speaking practice."
                ),
            },
        ]
        article = await ai_json(messages)
        _articles_cache[cache_key] = article
        return article
    except Exception:
        return content_library.get_article(level, day)
