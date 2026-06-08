"""
Fluent API — dynamic AI-powered content generation service.
"""

from __future__ import annotations

import logging
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import ContentItem, ContentType, CefrLevel, ContentSource
from app.services.ai_router import ai_json

log = logging.getLogger(__name__)


def _cefr_to_difficulty(cefr: CefrLevel) -> float:
    """Map CEFR level to a numeric difficulty between 0.0 and 1.0."""
    mapping = {
        CefrLevel.A2: 0.3,
        CefrLevel.B1: 0.5,
        CefrLevel.B2: 0.6,
        CefrLevel.C1: 0.8,
        CefrLevel.C2: 0.9,
    }
    return mapping.get(cefr, 0.5)


async def generate_and_save_ai_content(
    db: AsyncSession,
    item_type: ContentType,
    cefr: CefrLevel,
    theme_or_topic: str,
    count: int = 1,
) -> list[ContentItem]:
    """
    Generate content items using the AI provider, save them into the database,
    flush the session to generate IDs, and return the populated ContentItem list.
    """
    log.info(
        "Generating %d dynamic AI content items of type %s for level %s and topic %s...",
        count,
        item_type.value,
        cefr.value,
        theme_or_topic,
    )

    if item_type == ContentType.vocab:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an elite English vocabulary tutor.\n"
                    "Respond ONLY with valid JSON matching this schema:\n"
                    "{\n"
                    '  "items": [\n'
                    "    {\n"
                    '      "word": "<vocabulary word>",\n'
                    '      "phonetic": "<IPA pronunciation transcription, e.g. /ˈmiːtɪŋ/>",\n'
                    '      "definition": "<clear and concise definition>",\n'
                    '      "example": "<a natural example sentence using this word>",\n'
                    '      "synonyms": ["<synonym1>", "<synonym2>"]\n'
                    "    }\n"
                    "  ]\n"
                    "}\n"
                    f"Generate exactly {count} distinct vocabulary items. "
                    f"The items MUST be appropriate for CEFR Level {cefr.value}. "
                    f"The items MUST be relevant to the theme/topic: '{theme_or_topic}'."
                ),
            },
            {
                "role": "user",
                "content": f"Generate {count} vocabulary items for CEFR level {cefr.value} on the theme '{theme_or_topic}'.",
            },
        ]

    elif item_type == ContentType.grammar:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an elite English grammar coach.\n"
                    "Respond ONLY with valid JSON matching this schema:\n"
                    "{\n"
                    '  "items": [\n'
                    "    {\n"
                    '      "prompt": "<A multiple-choice grammar question prompt, e.g., Choose the correct option: ...>",\n'
                    '      "options": ["<option A>", "<option B>", "<option C>", "<option D>"],\n'
                    '      "answer_index": <integer 0-3 of the correct option>,\n'
                    '      "explanation": "<detailed, helpful explanation of why the correct option is right and the others are wrong>",\n'
                    '      "structure": "Topic: {theme_or_topic}"\n'
                    "    }\n"
                    "  ]\n"
                    "}\n"
                    f"Generate exactly {count} multiple-choice grammar questions. "
                    f"The questions MUST be appropriate for CEFR Level {cefr.value}. "
                    f"The questions MUST test grammatical concepts related to the topic: '{theme_or_topic}'."
                ),
            },
            {
                "role": "user",
                "content": f"Generate {count} grammar question(s) for CEFR level {cefr.value} on the topic '{theme_or_topic}'.",
            },
        ]

    elif item_type == ContentType.pronunciation:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an elite English pronunciation trainer.\n"
                    "Respond ONLY with valid JSON matching this schema:\n"
                    "{\n"
                    '  "items": [\n'
                    "    {\n"
                    '      "sentence": "<A clean, natural English sentence for pronunciation practice>",\n'
                    '      "focus_phonemes": ["<target phoneme 1>", "<target phoneme 2>"],\n'
                    '      "tip": "<short, actionable physical pronunciation tip for producing the target sound(s)>"\n'
                    "    }\n"
                    "  ]\n"
                    "}\n"
                    f"Generate exactly {count} pronunciation practice sentences. "
                    f"The sentences MUST be appropriate for CEFR Level {cefr.value}. "
                    f"The sentences should optionally be contextualized around the theme: '{theme_or_topic}' if possible, but keep it natural."
                ),
            },
            {
                "role": "user",
                "content": f"Generate {count} pronunciation sentence(s) for CEFR level {cefr.value}.",
            },
        ]

    elif item_type == ContentType.reading:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an elite English reading comprehension content developer.\n"
                    "Respond ONLY with valid JSON matching this schema:\n"
                    "{\n"
                    '  "items": [\n'
                    "    {\n"
                    '      "title": "<title of the reading passage>",\n'
                    '      "body": "<A passage of 150-250 words appropriate for the level, well-written and engaging>",\n'
                    '      "questions": [\n'
                    "        {\n"
                    '          "q": "<multiple-choice comprehension question text>",\n'
                    '          "options": ["<option A>", "<option B>", "<option C>", "<option D>"],\n'
                    '          "answer_index": <integer 0-3 of the correct option>\n'
                    "        }\n"
                    "      ]\n"
                    "    }\n"
                    "  ]\n"
                    "}\n"
                    f"Generate exactly {count} reading passages. "
                    f"Each reading passage MUST include exactly 2 multiple-choice comprehension questions. "
                    f"The content and vocabulary MUST be appropriate for CEFR Level {cefr.value}. "
                    f"The topic should be related to: '{theme_or_topic}'."
                ),
            },
            {
                "role": "user",
                "content": f"Generate {count} reading passage(s) with questions for CEFR level {cefr.value} on the theme '{theme_or_topic}'.",
            },
        ]

    elif item_type == ContentType.conversation:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an elite English conversational AI prompt developer.\n"
                    "Respond ONLY with valid JSON matching this schema:\n"
                    "{\n"
                    '  "items": [\n'
                    "    {\n"
                    '      "scenario": "<scenario description, e.g. Negotiating a budget with a partner>",\n'
                    '      "role": "<the role the AI tutor plays, e.g. Business Partner>",\n'
                    '      "opening_line": "<opening greeting/remark by the AI tutor>",\n'
                    '      "goal": "<the learner\'s goal, e.g. Reach a mutually acceptable compromise on the marketing budget>"\n'
                    "    }\n"
                    "  ]\n"
                    "}\n"
                    f"Generate exactly {count} roleplay scenario(s). "
                    f"The scenarios MUST be appropriate for CEFR Level {cefr.value}. "
                    f"The topic should be related to: '{theme_or_topic}'."
                ),
            },
            {
                "role": "user",
                "content": f"Generate {count} conversation roleplay scenario(s) for CEFR level {cefr.value} on the theme '{theme_or_topic}'.",
            },
        ]

    else:
        raise ValueError(f"Unsupported content type for AI generation: {item_type}")

    # Call the LLM provider router
    data = await ai_json(messages)
    items_data = data.get("items", [])

    if len(items_data) != count:
        log.warning(
            "AI returned %d items instead of requested %d. Proceeding anyway.",
            len(items_data),
            count,
        )

    difficulty = _cefr_to_difficulty(cefr)
    created_items: list[ContentItem] = []

    for payload in items_data:
        item = ContentItem(
            type=item_type,
            cefr=cefr,
            topic=theme_or_topic,
            difficulty=difficulty,
            payload=payload,
            source=ContentSource.ai,
            active=True,
        )
        db.add(item)
        created_items.append(item)

    # Flush session to populate database-generated attributes (like ID)
    await db.flush()

    log.info(
        "Successfully generated and saved %d AI content items in the database.",
        len(created_items),
    )
    return created_items
