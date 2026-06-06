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


async def evaluate_pronunciation(target: str, transcript: str) -> dict:
    """
    Compare the user's spoken transcript against the target sentence and
    return an accuracy score plus feedback.
    """
    # 1. Check for empty/silent input
    if not transcript or not transcript.strip():
        target_words = re.findall(r'\b\w+\b', target.lower())
        return {
            "accuracy": 0,
            "matched_words": [],
            "problem_words": target_words,
            "tip": "No speech detected. Please speak clearly into your microphone."
        }

    # 2. Check for exact match (case-insensitive, ignoring punctuation)
    clean_target = re.sub(r'[^\w\s]', '', target.lower()).strip()
    clean_transcript = re.sub(r'[^\w\s]', '', transcript.lower()).strip()
    
    if clean_target == clean_transcript:
        target_words = re.findall(r'\b\w+\b', target)
        return {
            "accuracy": 100,
            "matched_words": target_words,
            "problem_words": [],
            "tip": "Excellent pronunciation! Perfect match."
        }

    # 3. Otherwise, perform AI-based evaluation
    try:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a pronunciation coach. Compare the TARGET sentence with "
                    "the TRANSCRIPT the student actually spoke. "
                    "Respond ONLY with valid JSON matching this schema:\n"
                    "{\n"
                    '  "accuracy": <0-100 integer>,\n'
                    '  "matched_words": ["<correctly pronounced words>"],\n'
                    '  "problem_words": ["<mispronounced or missing words>"],\n'
                    '  "tip": "<one short, actionable pronunciation tip>"\n'
                    "}\n"
                    "Be encouraging but honest. A perfect match is 100."
                ),
            },
            {
                "role": "user",
                "content": f"TARGET: {target}\nTRANSCRIPT: {transcript}",
            },
        ]
        return await ai_json(messages, fast=True)
    except Exception:
        # Fallback local comparison
        def tokenize(text):
            return re.findall(r'\b\w+\b', text.lower())
        
        target_words = tokenize(target)
        transcript_words = set(tokenize(transcript))
        
        if not target_words:
            return {"accuracy": 100, "matched_words": [], "problem_words": [], "tip": "Perfect pronunciation!"}
            
        matched = [w for w in target_words if w in transcript_words]
        problems = [w for w in target_words if w not in transcript_words]
        
        accuracy = int((len(matched) / len(target_words)) * 100)
        
        tip = "Try to speak a bit clearer and check the pronunciation of problem words."
        if accuracy >= 90:
            tip = "Excellent pronunciation! Keep it up."
        elif accuracy >= 70:
            tip = "Good effort! Focus on matching all target words."
            
        return {
            "accuracy": accuracy,
            "matched_words": matched,
            "problem_words": problems,
            "tip": tip
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
