import asyncio
import json
import os
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base
from app.db.session import async_session_factory, engine
from app.db.models import ContentItem, ContentType, CefrLevel, ContentSource

async def seed_content(db: AsyncSession) -> None:
    """Read content_library.json and load it into the database idempotently."""
    dir_path = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(dir_path, "content_library.json")
    
    if not os.path.exists(json_path):
        print(f"[WARNING] Seed file {json_path} not found. Skip seeding content items.")
        return
        
    with open(json_path, "r", encoding="utf-8") as f:
        items = json.load(f)
        
    print(f"Reading {len(items)} content items from JSON...")
    
    # Query all existing content items in one call for fast in-memory deduplication
    res = await db.execute(select(ContentItem))
    existing_items = res.scalars().all()
    
    existing_vocab = set()
    existing_grammar = set()
    existing_pron = set()
    existing_read = set()
    existing_conv = set()
    
    for item in existing_items:
        if item.type == ContentType.vocab:
            existing_vocab.add(item.payload.get("word"))
        elif item.type == ContentType.grammar:
            existing_grammar.add(item.payload.get("prompt"))
        elif item.type == ContentType.pronunciation:
            existing_pron.add(item.payload.get("sentence"))
        elif item.type == ContentType.reading:
            existing_read.add(item.payload.get("title"))
        elif item.type == ContentType.conversation:
            existing_conv.add(item.payload.get("scenario"))

    added_count = 0
    skipped_count = 0
    
    for item_data in items:
        ctype = item_data["type"]
        cefr = item_data["cefr"]
        topic = item_data["topic"]
        payload = item_data["payload"]
        
        is_duplicate = False
        if ctype == "vocab" and payload.get("word") in existing_vocab:
            is_duplicate = True
        elif ctype == "grammar" and payload.get("prompt") in existing_grammar:
            is_duplicate = True
        elif ctype == "pronunciation" and payload.get("sentence") in existing_pron:
            is_duplicate = True
        elif ctype == "reading" and payload.get("title") in existing_read:
            is_duplicate = True
        elif ctype == "conversation" and payload.get("scenario") in existing_conv:
            is_duplicate = True
            
        if not is_duplicate:
            db.add(ContentItem(
                id=item_data.get("id"),
                type=ContentType(ctype),
                cefr=CefrLevel(cefr),
                topic=topic,
                difficulty=item_data.get("difficulty", 0.5),
                payload=payload,
                source=ContentSource(item_data.get("source", "seed")),
                active=item_data.get("active", True)
            ))
            # Keep in-memory cache updated during this transaction
            if ctype == "vocab":
                existing_vocab.add(payload.get("word"))
            elif ctype == "grammar":
                existing_grammar.add(payload.get("prompt"))
            elif ctype == "pronunciation":
                existing_pron.add(payload.get("sentence"))
            elif ctype == "reading":
                existing_read.add(payload.get("title"))
            elif ctype == "conversation":
                existing_conv.add(payload.get("scenario"))
                
            added_count += 1
        else:
            skipped_count += 1
            
    await db.flush()
    print(f"[SUCCESS] Content library seeded. Added: {added_count}, Skipped: {skipped_count}")

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with async_session_factory() as db:
        await seed_content(db)
        await db.commit()

if __name__ == "__main__":
    asyncio.run(main())
