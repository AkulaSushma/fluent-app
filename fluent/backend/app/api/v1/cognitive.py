"""
Fluent API — Cognitive Pattern Engine endpoints.
"""

from __future__ import annotations

import json
from datetime import date, datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.core.srs import sm2
from app.services.cache import cache_get, cache_set, make_key
from app.db.models import (
    User,
    EtymologyPart,
    WordFamily,
    VocabularyNode,
    UserJournal,
    LibraryBook,
    CognitiveSrsQueue,
    JournalSource,
    Theme,
    StoryMnemonic,
    StoryWordLink,
    FavoriteList,
    FavoriteEntry,
    Challenge,
    ChallengeDay,
    UserChallengeProgress
)
from app.schemas.cognitive import (
    LibraryBookOut,
    VocabularyNodeOut,
    WordFamilyOut,
    CognitiveSrsOut,
    SrsReviewRequest,
    EnqueueRequest,
    JournalEntryOut,
    JournalCreateRequest,
    ThemeOut,
    StoryMnemonicOut,
    FavoriteEntryOut,
    FavoriteCreateRequest,
    ChallengeOut,
    UserChallengeProgressOut
)

router = APIRouter(prefix="/cognitive", tags=["cognitive"])


@router.get("/library", response_model=list[LibraryBookOut])
async def get_library(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """Get all library books ordered by sort_order."""
    key = make_key("cognitive_library")
    hit = await cache_get(key)
    if hit is not None:
        return hit
    result = await db.execute(
        select(LibraryBook).order_by(LibraryBook.sort_order.asc())
    )
    books = result.scalars().all()
    books_data = [
        {
            "id": b.id,
            "title": b.title,
            "author": b.author,
            "track": b.track.value,
            "cover_url": b.cover_url,
            "content_url": b.content_url,
            "is_public_domain": b.is_public_domain,
            "accent_color": b.accent_color,
            "sort_order": b.sort_order,
            "description": b.description,
            "chapter_count": b.chapter_count
        } for b in books
    ]
    await cache_set(key, books_data, ttl=604800)  # 7 days
    return books


GUTENBERG_CACHE: dict[str, str] = {}


@router.get("/library/{book_id}", response_model=LibraryBookOut)
async def get_book(
    book_id: str,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """Get a single library book by ID. Fetches Gutenberg texts dynamically for public domain books."""
    book = await db.get(LibraryBook, book_id)
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    if book.is_public_domain and book.content_url and book.content_url.startswith("http"):
        if book_id not in GUTENBERG_CACHE:
            try:
                import httpx
                async with httpx.AsyncClient() as client:
                    resp = await client.get(book.content_url, timeout=15.0)
                    if resp.status_code == 200:
                        text = resp.text
                        # Try to find START and END markers to clean the Gutenberg header/footer
                        start_markers = [
                            "*** START OF THE PROJECT GUTENBERG EBOOK",
                            "*** START OF THIS PROJECT GUTENBERG EBOOK"
                        ]
                        start_idx = -1
                        for marker in start_markers:
                            start_idx = text.upper().find(marker)
                            if start_idx != -1:
                                line_end = text.find("\n", start_idx)
                                text = text[line_end + 1:]
                                break
                        
                        end_marker = "*** END OF THE PROJECT GUTENBERG EBOOK"
                        end_idx = text.upper().find(end_marker)
                        if end_idx != -1:
                            text = text[:end_idx]
                        
                        text = text.strip()
                        # Limit to first 25000 characters to make it readable and fast on mobile
                        if len(text) > 25000:
                            text = text[:25000] + "\n\n[... This classic story continues in the library ...]"
                        
                        GUTENBERG_CACHE[book_id] = text
                    else:
                        GUTENBERG_CACHE[book_id] = f"Error: Received status code {resp.status_code} from Project Gutenberg."
            except Exception as e:
                GUTENBERG_CACHE[book_id] = f"Error downloading book: {str(e)}"
        
        return LibraryBookOut(
            id=book.id,
            title=book.title,
            author=book.author,
            track=book.track.value,
            cover_url=book.cover_url,
            content_url=GUTENBERG_CACHE[book_id],
            is_public_domain=book.is_public_domain,
            accent_color=book.accent_color,
            sort_order=book.sort_order,
            description=book.description,
            chapter_count=book.chapter_count
        )

    return book


@router.get("/etymology/{word}", response_model=VocabularyNodeOut | None)
async def get_word_etymology(
    word: str,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """Fetch etymology breakdown for a specific word (case-insensitive) with Free Dictionary fallback."""
    clean_word = word.strip().lower()
    
    # 1. Check SQLite database
    result = await db.execute(
        select(VocabularyNode)
        .options(
            selectinload(VocabularyNode.root),
            selectinload(VocabularyNode.prefix),
            selectinload(VocabularyNode.suffix),
            selectinload(VocabularyNode.word_family),
        )
        .where(VocabularyNode.word.ilike(clean_word))
    )
    node = result.scalar_one_or_none()
    
    if node:
        return VocabularyNodeOut(
            id=node.id,
            word=node.word,
            definition=node.definition,
            difficulty=node.difficulty,
            visual_url=node.visual_url,
            context_sentence=node.context_sentence,
            root=node.root,
            prefix=node.prefix,
            suffix=node.suffix,
            word_family_name=node.word_family.name if node.word_family else None,
            mnemonic_text=node.mnemonic_text,
            mnemonic_image_url=node.mnemonic_image_url,
            intensity=node.intensity,
            theme_id=node.theme_id,
            synonyms=node.synonyms or "[]",
            antonyms=node.antonyms or "[]"
        )

    # 2. If not found in database, check Free Dictionary API
    try:
        import httpx
        url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{clean_word}"
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                if data and isinstance(data, list):
                    entry = data[0]
                    word_val = entry.get("word", clean_word)
                    
                    # Extract definition and context sentence
                    definition = None
                    context_sentence = None
                    synonyms = []
                    antonyms = []
                    
                    meanings = entry.get("meanings", [])
                    if meanings:
                        # Grab first definition
                        defs = meanings[0].get("definitions", [])
                        if defs:
                            definition = defs[0].get("definition")
                            context_sentence = defs[0].get("example")
                        
                        # Aggregate synonyms and antonyms
                        for m in meanings:
                            synonyms.extend(m.get("synonyms", []))
                            antonyms.extend(m.get("antonyms", []))
                            for d in m.get("definitions", []):
                                synonyms.extend(d.get("synonyms", []))
                                antonyms.extend(d.get("antonyms", []))
                    
                    # Dedup synonyms and antonyms
                    synonyms = list(set(synonyms))[:5]
                    antonyms = list(set(antonyms))[:5]
                    
                    # 3. Dynamic Etymology Morpheme Decoder
                    # Fetch all known prefixes, roots, and suffixes from DB
                    parts_result = await db.execute(select(EtymologyPart))
                    all_parts = parts_result.scalars().all()
                    
                    prefix_parts = [p for p in all_parts if p.part_type == PartType.prefix]
                    root_parts = [p for p in all_parts if p.part_type == PartType.root]
                    suffix_parts = [p for p in all_parts if p.part_type == PartType.suffix]
                    
                    matched_prefix = None
                    matched_root = None
                    matched_suffix = None
                    
                    # Match prefix (longest first)
                    for p in sorted(prefix_parts, key=lambda x: len(x.morpheme), reverse=True):
                        if word_val.startswith(p.morpheme) and len(word_val) > len(p.morpheme):
                            matched_prefix = p
                            break
                            
                    # Match suffix (longest first)
                    for s in sorted(suffix_parts, key=lambda x: len(x.morpheme), reverse=True):
                        if word_val.endswith(s.morpheme) and len(word_val) > len(s.morpheme):
                            # Ensure no prefix overlap
                            rem_len = len(word_val) - len(s.morpheme)
                            if matched_prefix and rem_len < len(matched_prefix.morpheme):
                                continue
                            matched_suffix = s
                            break
                            
                    # Remove matched prefix/suffix to search for root in the stem
                    stem = word_val
                    if matched_prefix:
                        stem = stem[len(matched_prefix.morpheme):]
                    if matched_suffix:
                        stem = stem[:-len(matched_suffix.morpheme)]
                        
                    # Match root in stem
                    for r in sorted(root_parts, key=lambda x: len(x.morpheme), reverse=True):
                        if r.morpheme in stem:
                            matched_root = r
                            break
                            
                    # Fallback: match root anywhere in word
                    if not matched_root:
                        for r in sorted(root_parts, key=lambda x: len(x.morpheme), reverse=True):
                            if r.morpheme in word_val:
                                matched_root = r
                                break
                    
                    # Return dynamic node
                    import uuid
                    return VocabularyNodeOut(
                        id=str(uuid.uuid4()),  # Transient UUID
                        word=word_val,
                        definition=definition or "No definition available.",
                        difficulty=2,
                        visual_url=None,
                        context_sentence=context_sentence,
                        root=matched_root,
                        prefix=matched_prefix,
                        suffix=matched_suffix,
                        word_family_name=None,
                        mnemonic_text=f"Dynamic lookup for '{word_val}'. Detected root: {matched_root.morpheme if matched_root else 'None'}.",
                        mnemonic_image_url=None,
                        intensity=0.5,
                        theme_id=None,
                        synonyms=synonyms,
                        antonyms=antonyms
                    )
    except Exception as e:
        print(f"Error in dynamic dictionary fallback lookup: {e}")
        
    return None


@router.get("/word-families", response_model=list[WordFamilyOut])
async def get_word_families(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """Get all word families with nested vocabulary nodes."""
    key = make_key("cognitive_word_families")
    hit = await cache_get(key)
    if hit is not None:
        return hit
    result = await db.execute(
        select(WordFamily)
        .options(
            selectinload(WordFamily.words).selectinload(VocabularyNode.root),
            selectinload(WordFamily.words).selectinload(VocabularyNode.prefix),
            selectinload(WordFamily.words).selectinload(VocabularyNode.suffix),
        )
        .order_by(WordFamily.sort_order.asc())
    )
    families = result.scalars().all()
    
    out_list = []
    for f in families:
        words_out = [
            VocabularyNodeOut(
                id=w.id,
                word=w.word,
                definition=w.definition,
                difficulty=w.difficulty,
                visual_url=w.visual_url,
                context_sentence=w.context_sentence,
                root=w.root,
                prefix=w.prefix,
                suffix=w.suffix,
                word_family_name=f.name,
                mnemonic_text=w.mnemonic_text,
                mnemonic_image_url=w.mnemonic_image_url,
                intensity=w.intensity,
                theme_id=w.theme_id,
                synonyms=w.synonyms or "[]",
                antonyms=w.antonyms or "[]"
            ) for w in f.words
        ]
        out_list.append(
            WordFamilyOut(
                id=f.id,
                name=f.name,
                theme=f.theme,
                theme_id=f.theme_id,
                base_meaning=f.base_meaning,
                fluency_tier=f.fluency_tier.value if f.fluency_tier else None,
                words=words_out
            )
        )
    # Cache the word families list
    serialized = [item.model_dump(mode='json') for item in out_list]
    await cache_set(key, serialized, ttl=604800)  # 7 days
    return out_list


@router.get("/srs/due", response_model=list[CognitiveSrsOut])
async def get_srs_due(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get due SRS queue items for the current user."""
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(CognitiveSrsQueue)
        .options(
            selectinload(CognitiveSrsQueue.word).selectinload(VocabularyNode.root),
            selectinload(CognitiveSrsQueue.word).selectinload(VocabularyNode.prefix),
            selectinload(CognitiveSrsQueue.word).selectinload(VocabularyNode.suffix),
        )
        .where(
            and_(
                CognitiveSrsQueue.user_id == current_user.id,
                CognitiveSrsQueue.is_buried == False,
                CognitiveSrsQueue.next_review_at <= now
            )
        )
        .order_by(CognitiveSrsQueue.next_review_at.asc())
        .limit(limit)
    )
    items = result.scalars().all()
    
    out_list = []
    for item in items:
        w = item.word
        word_out = VocabularyNodeOut(
            id=w.id,
            word=w.word,
            definition=w.definition,
            difficulty=w.difficulty,
            visual_url=w.visual_url,
            context_sentence=w.context_sentence,
            root=w.root,
            prefix=w.prefix,
            suffix=w.suffix,
            word_family_name=None,
            mnemonic_text=w.mnemonic_text,
            mnemonic_image_url=w.mnemonic_image_url,
            intensity=w.intensity,
            theme_id=w.theme_id,
            synonyms=w.synonyms or "[]",
            antonyms=w.antonyms or "[]"
        )
        out_list.append(
            CognitiveSrsOut(
                id=item.id,
                vocabulary_node_id=item.vocabulary_node_id,
                stage=item.stage,
                next_review_at=item.next_review_at,
                last_reviewed_at=item.last_reviewed_at,
                total_reviews=item.total_reviews,
                total_lapses=item.total_lapses,
                ease_factor=item.ease_factor,
                repetitions=item.repetitions,
                interval_days=item.interval_days,
                word=word_out
            )
        )
    return out_list


@router.post("/srs/review", response_model=CognitiveSrsOut)
async def review_srs_item(
    body: SrsReviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Process an SRS review utilizing the SM-2 algorithm."""
    result = await db.execute(
        select(CognitiveSrsQueue)
        .options(
            selectinload(CognitiveSrsQueue.word).selectinload(VocabularyNode.root),
            selectinload(CognitiveSrsQueue.word).selectinload(VocabularyNode.prefix),
            selectinload(CognitiveSrsQueue.word).selectinload(VocabularyNode.suffix),
        )
        .where(
            and_(
                CognitiveSrsQueue.user_id == current_user.id,
                CognitiveSrsQueue.vocabulary_node_id == body.node_id
            )
        )
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SRS item not found"
        )
        
    from app.services.fsrs import calculate_next_review

    # Map quality (0-5) to FSRS grade (0-3)
    fsrs_grade = 0
    if body.quality == 3:
        fsrs_grade = 1
    elif body.quality == 4:
        fsrs_grade = 2
    elif body.quality >= 5:
        fsrs_grade = 3

    # Load existing difficulty & stability
    stability = item.fsrs_stability if item.fsrs_stability is not None else 2.5
    difficulty = item.fsrs_difficulty if item.fsrs_difficulty is not None else 5.0

    new_stability, new_difficulty, due_at = calculate_next_review(
        stability=stability,
        difficulty=difficulty,
        grade=fsrs_grade,
        last_reviewed=item.last_reviewed_at,
        current_time=datetime.now(timezone.utc)
    )

    interval_days = max(1, round(new_stability))

    item.fsrs_state = 2 if body.quality >= 3 else 3
    item.fsrs_stability = new_stability
    item.fsrs_difficulty = new_difficulty
    item.interval_days = interval_days
    item.repetitions = item.repetitions + 1 if body.quality >= 3 else 0
    item.ease_factor = new_stability / max(1, item.repetitions)
    
    # Map quality to original stage counter (0 to 4)
    if body.quality >= 3:
        item.stage = min(item.stage + 1, 4)
    else:
        item.stage = 0
        item.total_lapses += 1
        
    item.total_reviews += 1
    now = datetime.now(timezone.utc)
    item.last_reviewed_at = now
    item.next_review_at = now + timedelta(days=interval_days)
    
    db.add(item)
    await db.commit()
    
    # Reload item for serialization
    result = await db.execute(
        select(CognitiveSrsQueue)
        .options(
            selectinload(CognitiveSrsQueue.word).selectinload(VocabularyNode.root),
            selectinload(CognitiveSrsQueue.word).selectinload(VocabularyNode.prefix),
            selectinload(CognitiveSrsQueue.word).selectinload(VocabularyNode.suffix),
        )
        .where(CognitiveSrsQueue.id == item.id)
    )
    item = result.scalar_one()
    
    w = item.word
    word_out = VocabularyNodeOut(
        id=w.id,
        word=w.word,
        definition=w.definition,
        difficulty=w.difficulty,
        visual_url=w.visual_url,
        context_sentence=w.context_sentence,
        root=w.root,
        prefix=w.prefix,
        suffix=w.suffix,
        word_family_name=None,
        mnemonic_text=w.mnemonic_text,
        mnemonic_image_url=w.mnemonic_image_url,
        intensity=w.intensity,
        theme_id=w.theme_id,
        synonyms=w.synonyms or "[]",
        antonyms=w.antonyms or "[]"
    )
    return CognitiveSrsOut(
        id=item.id,
        vocabulary_node_id=item.vocabulary_node_id,
        stage=item.stage,
        next_review_at=item.next_review_at,
        last_reviewed_at=item.last_reviewed_at,
        total_reviews=item.total_reviews,
        total_lapses=item.total_lapses,
        ease_factor=item.ease_factor,
        repetitions=item.repetitions,
        interval_days=item.interval_days,
        word=word_out
    )


@router.post("/srs/enqueue", response_model=CognitiveSrsOut)
async def enqueue_srs_item(
    body: EnqueueRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Enqueue a vocabulary node into the user's SRS review queue."""
    vocab_node = await db.get(VocabularyNode, body.node_id)
    if not vocab_node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vocabulary node not found"
        )
        
    result = await db.execute(
        select(CognitiveSrsQueue)
        .options(
            selectinload(CognitiveSrsQueue.word).selectinload(VocabularyNode.root),
            selectinload(CognitiveSrsQueue.word).selectinload(VocabularyNode.prefix),
            selectinload(CognitiveSrsQueue.word).selectinload(VocabularyNode.suffix),
        )
        .where(
            and_(
                CognitiveSrsQueue.user_id == current_user.id,
                CognitiveSrsQueue.vocabulary_node_id == body.node_id
            )
        )
    )
    item = result.scalar_one_or_none()
    
    if not item:
        now = datetime.now(timezone.utc)
        item = CognitiveSrsQueue(
            user_id=current_user.id,
            vocabulary_node_id=body.node_id,
            stage=0,
            next_review_at=now + timedelta(days=1),
            last_reviewed_at=None,
            total_reviews=0,
            total_lapses=0,
            is_buried=False,
            ease_factor=2.5,
            repetitions=0,
            interval_days=1
        )
        db.add(item)
        await db.commit()
        
        result = await db.execute(
            select(CognitiveSrsQueue)
            .options(
                selectinload(CognitiveSrsQueue.word).selectinload(VocabularyNode.root),
                selectinload(CognitiveSrsQueue.word).selectinload(VocabularyNode.prefix),
                selectinload(CognitiveSrsQueue.word).selectinload(VocabularyNode.suffix),
            )
            .where(CognitiveSrsQueue.id == item.id)
        )
        item = result.scalar_one()

    w = item.word
    word_out = VocabularyNodeOut(
        id=w.id,
        word=w.word,
        definition=w.definition,
        difficulty=w.difficulty,
        visual_url=w.visual_url,
        context_sentence=w.context_sentence,
        root=w.root,
        prefix=w.prefix,
        suffix=w.suffix,
        word_family_name=None,
        mnemonic_text=w.mnemonic_text,
        mnemonic_image_url=w.mnemonic_image_url,
        intensity=w.intensity,
        theme_id=w.theme_id,
        synonyms=w.synonyms or "[]",
        antonyms=w.antonyms or "[]"
    )
    return CognitiveSrsOut(
        id=item.id,
        vocabulary_node_id=item.vocabulary_node_id,
        stage=item.stage,
        next_review_at=item.next_review_at,
        last_reviewed_at=item.last_reviewed_at,
        total_reviews=item.total_reviews,
        total_lapses=item.total_lapses,
        ease_factor=item.ease_factor,
        repetitions=item.repetitions,
        interval_days=item.interval_days,
        word=word_out
    )


@router.get("/journal", response_model=list[JournalEntryOut])
async def get_journal_entries(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all journal entries for the current user."""
    result = await db.execute(
        select(UserJournal)
        .options(
            selectinload(UserJournal.word).selectinload(VocabularyNode.root),
            selectinload(UserJournal.word).selectinload(VocabularyNode.prefix),
            selectinload(UserJournal.word).selectinload(VocabularyNode.suffix),
        )
        .where(UserJournal.user_id == current_user.id)
        .order_by(UserJournal.created_at.desc())
    )
    entries = result.scalars().all()
    
    out_list = []
    for entry in entries:
        word_out = None
        if entry.word:
            w = entry.word
            word_out = VocabularyNodeOut(
                id=w.id,
                word=w.word,
                definition=w.definition,
                difficulty=w.difficulty,
                visual_url=w.visual_url,
                context_sentence=w.context_sentence,
                root=w.root,
                prefix=w.prefix,
                suffix=w.suffix,
                word_family_name=None,
                mnemonic_text=w.mnemonic_text,
                mnemonic_image_url=w.mnemonic_image_url,
                intensity=w.intensity,
                theme_id=w.theme_id,
                synonyms=w.synonyms or "[]",
                antonyms=w.antonyms or "[]"
            )
        out_list.append(
            JournalEntryOut(
                id=entry.id,
                vocabulary_node_id=entry.vocabulary_node_id,
                personal_sentence=entry.personal_sentence,
                emotion_tag=entry.emotion_tag,
                source=entry.source.value,
                created_at=entry.created_at,
                spoken_aloud=entry.spoken_aloud,
                spoken_at=entry.spoken_at,
                word=word_out
            )
        )
    return out_list


@router.post("/journal", response_model=JournalEntryOut)
async def create_journal_entry(
    body: JournalCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new journal entry for the current user."""
    if body.vocabulary_node_id:
        vocab_node = await db.get(VocabularyNode, body.vocabulary_node_id)
        if not vocab_node:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vocabulary node not found"
            )
            
    entry = UserJournal(
        user_id=current_user.id,
        vocabulary_node_id=body.vocabulary_node_id,
        personal_sentence=body.personal_sentence,
        emotion_tag=body.emotion_tag,
        source=JournalSource(body.source)
    )
    db.add(entry)
    await db.commit()
    
    result = await db.execute(
        select(UserJournal)
        .options(
            selectinload(UserJournal.word).selectinload(VocabularyNode.root),
            selectinload(UserJournal.word).selectinload(VocabularyNode.prefix),
            selectinload(UserJournal.word).selectinload(VocabularyNode.suffix),
        )
        .where(UserJournal.id == entry.id)
    )
    entry = result.scalar_one()
    
    word_out = None
    if entry.word:
        w = entry.word
        word_out = VocabularyNodeOut(
            id=w.id,
            word=w.word,
            definition=w.definition,
            difficulty=w.difficulty,
            visual_url=w.visual_url,
            context_sentence=w.context_sentence,
            root=w.root,
            prefix=w.prefix,
            suffix=w.suffix,
            word_family_name=None,
            mnemonic_text=w.mnemonic_text,
            mnemonic_image_url=w.mnemonic_image_url,
            intensity=w.intensity,
            theme_id=w.theme_id,
            synonyms=w.synonyms or "[]",
            antonyms=w.antonyms or "[]"
        )
        
    return JournalEntryOut(
        id=entry.id,
        vocabulary_node_id=entry.vocabulary_node_id,
        personal_sentence=entry.personal_sentence,
        emotion_tag=entry.emotion_tag,
        source=entry.source.value,
        created_at=entry.created_at,
        spoken_aloud=entry.spoken_aloud,
        spoken_at=entry.spoken_at,
        word=word_out
    )


@router.post("/journal/{journal_id}/spoken", response_model=JournalEntryOut)
async def mark_journal_entry_spoken(
    journal_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a journal entry's word as verbalized/spoken aloud (24h rule)."""
    entry = await db.get(UserJournal, journal_id)
    if not entry or entry.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found"
        )
        
    entry.spoken_aloud = True
    entry.spoken_at = datetime.now(timezone.utc)
    db.add(entry)
    await db.commit()
    
    result = await db.execute(
        select(UserJournal)
        .options(
            selectinload(UserJournal.word).selectinload(VocabularyNode.root),
            selectinload(UserJournal.word).selectinload(VocabularyNode.prefix),
            selectinload(UserJournal.word).selectinload(VocabularyNode.suffix),
        )
        .where(UserJournal.id == journal_id)
    )
    entry = result.scalar_one()
    
    word_out = None
    if entry.word:
        w = entry.word
        word_out = VocabularyNodeOut(
            id=w.id,
            word=w.word,
            definition=w.definition,
            difficulty=w.difficulty,
            visual_url=w.visual_url,
            context_sentence=w.context_sentence,
            root=w.root,
            prefix=w.prefix,
            suffix=w.suffix,
            word_family_name=None,
            mnemonic_text=w.mnemonic_text,
            mnemonic_image_url=w.mnemonic_image_url,
            intensity=w.intensity,
            theme_id=w.theme_id,
            synonyms=w.synonyms or "[]",
            antonyms=w.antonyms or "[]"
        )
        
    return JournalEntryOut(
        id=entry.id,
        vocabulary_node_id=entry.vocabulary_node_id,
        personal_sentence=entry.personal_sentence,
        emotion_tag=entry.emotion_tag,
        source=entry.source.value,
        created_at=entry.created_at,
        spoken_aloud=entry.spoken_aloud,
        spoken_at=entry.spoken_at,
        word=word_out
    )


# ── Themes & Families ────────────────────────────────────────────────


@router.get("/themes", response_model=list[ThemeOut])
async def get_themes(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """Get all themes."""
    key = make_key("cognitive_themes")
    hit = await cache_get(key)
    if hit is not None:
        return hit
    result = await db.execute(select(Theme).order_by(Theme.name.asc()))
    themes = result.scalars().all()
    themes_data = [
        {
            "id": t.id,
            "name": t.name,
            "slug": t.slug,
            "description": t.description,
            "icon": t.icon,
            "accent_color": t.accent_color
        } for t in themes
    ]
    await cache_set(key, themes_data, ttl=604800)  # 7 days
    return themes


@router.get("/themes/{theme_id}/families", response_model=list[WordFamilyOut])
async def get_theme_families(
    theme_id: str,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """Get word families and words nested under a theme."""
    result = await db.execute(
        select(WordFamily)
        .options(
            selectinload(WordFamily.words).selectinload(VocabularyNode.root),
            selectinload(WordFamily.words).selectinload(VocabularyNode.prefix),
            selectinload(WordFamily.words).selectinload(VocabularyNode.suffix),
        )
        .where(WordFamily.theme_id == theme_id)
        .order_by(WordFamily.sort_order.asc())
    )
    families = result.scalars().all()
    
    out_list = []
    for f in families:
        words_out = [
            VocabularyNodeOut(
                id=w.id,
                word=w.word,
                definition=w.definition,
                difficulty=w.difficulty,
                visual_url=w.visual_url,
                context_sentence=w.context_sentence,
                root=w.root,
                prefix=w.prefix,
                suffix=w.suffix,
                word_family_name=f.name,
                mnemonic_text=w.mnemonic_text,
                mnemonic_image_url=w.mnemonic_image_url,
                intensity=w.intensity,
                theme_id=w.theme_id,
                synonyms=w.synonyms or "[]",
                antonyms=w.antonyms or "[]"
            ) for w in f.words
        ]
        out_list.append(
            WordFamilyOut(
                id=f.id,
                name=f.name,
                theme=f.theme,
                theme_id=f.theme_id,
                base_meaning=f.base_meaning,
                fluency_tier=f.fluency_tier.value if f.fluency_tier else None,
                words=words_out
            )
        )
    return out_list


# ── Fables / Stories ─────────────────────────────────────────────────


@router.get("/stories", response_model=list[StoryMnemonicOut])
async def get_stories(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """Get all illustrated fables."""
    result = await db.execute(
        select(StoryMnemonic)
        .options(
            selectinload(StoryMnemonic.links).selectinload(StoryWordLink.node).selectinload(VocabularyNode.root),
            selectinload(StoryMnemonic.links).selectinload(StoryWordLink.node).selectinload(VocabularyNode.prefix),
            selectinload(StoryMnemonic.links).selectinload(StoryWordLink.node).selectinload(VocabularyNode.suffix),
        )
        .where(StoryMnemonic.is_system == True)
    )
    return result.scalars().all()


@router.get("/stories/{story_id}", response_model=StoryMnemonicOut)
async def get_story(
    story_id: str,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """Get a single fable with its linked word etymologies."""
    result = await db.execute(
        select(StoryMnemonic)
        .options(
            selectinload(StoryMnemonic.links).selectinload(StoryWordLink.node).selectinload(VocabularyNode.root),
            selectinload(StoryMnemonic.links).selectinload(StoryWordLink.node).selectinload(VocabularyNode.prefix),
            selectinload(StoryMnemonic.links).selectinload(StoryWordLink.node).selectinload(VocabularyNode.suffix),
        )
        .where(StoryMnemonic.id == story_id)
    )
    story = result.scalar_one_or_none()
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Story not found"
        )
    return story


# ── Favorites (100 words list) ──────────────────────────────────────


@router.get("/favorites", response_model=list[FavoriteEntryOut])
async def get_favorites(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user's 100 Favorite Words entries."""
    result = await db.execute(
        select(FavoriteList).where(FavoriteList.user_id == current_user.id)
    )
    fav_list = result.scalar_one_or_none()
    if not fav_list:
        fav_list = FavoriteList(user_id=current_user.id, title="My 100 Words", target_count=100)
        db.add(fav_list)
        await db.commit()
        
        result = await db.execute(
            select(FavoriteList).where(FavoriteList.user_id == current_user.id)
        )
        fav_list = result.scalar_one()

    result = await db.execute(
        select(FavoriteEntry)
        .options(
            selectinload(FavoriteEntry.node).selectinload(VocabularyNode.root),
            selectinload(FavoriteEntry.node).selectinload(VocabularyNode.prefix),
            selectinload(FavoriteEntry.node).selectinload(VocabularyNode.suffix),
        )
        .where(FavoriteEntry.list_id == fav_list.id)
        .order_by(FavoriteEntry.word.asc())
    )
    return result.scalars().all()


@router.post("/favorites", response_model=FavoriteEntryOut)
async def add_favorite(
    body: FavoriteCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a word to the user's active favorites list."""
    result = await db.execute(
        select(FavoriteList).where(FavoriteList.user_id == current_user.id)
    )
    fav_list = result.scalar_one_or_none()
    if not fav_list:
        fav_list = FavoriteList(user_id=current_user.id, title="My 100 Words", target_count=100)
        db.add(fav_list)
        await db.commit()
        
        result = await db.execute(
            select(FavoriteList).where(FavoriteList.user_id == current_user.id)
        )
        fav_list = result.scalar_one()

    # Check for duplicate entry
    result = await db.execute(
        select(FavoriteEntry).where(
            and_(
                FavoriteEntry.list_id == fav_list.id,
                FavoriteEntry.word.ilike(body.word.strip())
            )
        )
    )
    entry = result.scalar_one_or_none()
    
    if not entry:
        entry = FavoriteEntry(
            list_id=fav_list.id,
            node_id=body.node_id,
            word=body.word.strip(),
            letter=body.letter.strip().upper()[0],
            mastered=False
        )
        db.add(entry)
        await db.commit()

    result = await db.execute(
        select(FavoriteEntry)
        .options(
            selectinload(FavoriteEntry.node).selectinload(VocabularyNode.root),
            selectinload(FavoriteEntry.node).selectinload(VocabularyNode.prefix),
            selectinload(FavoriteEntry.node).selectinload(VocabularyNode.suffix),
        )
        .where(FavoriteEntry.id == entry.id)
    )
    return result.scalar_one()


@router.post("/favorites/{entry_id}/master", response_model=FavoriteEntryOut)
async def toggle_favorite_master(
    entry_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle the mastery checkbox of a favorited word."""
    entry = await db.get(FavoriteEntry, entry_id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite entry not found"
        )
        
    fav_list = await db.get(FavoriteList, entry.list_id)
    if fav_list.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
        
    entry.mastered = not entry.mastered
    db.add(entry)
    await db.commit()
    
    result = await db.execute(
        select(FavoriteEntry)
        .options(
            selectinload(FavoriteEntry.node).selectinload(VocabularyNode.root),
            selectinload(FavoriteEntry.node).selectinload(VocabularyNode.prefix),
            selectinload(FavoriteEntry.node).selectinload(VocabularyNode.suffix),
        )
        .where(FavoriteEntry.id == entry_id)
    )
    return result.scalar_one()


# ── 30-Day Challenges ────────────────────────────────────────────────


@router.get("/challenges", response_model=list[ChallengeOut])
async def get_challenges(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    """Get all 30-day challenge programs."""
    result = await db.execute(
        select(Challenge).options(selectinload(Challenge.days))
    )
    return result.scalars().all()


@router.post("/challenges/{challenge_id}/start", response_model=UserChallengeProgressOut)
async def start_challenge(
    challenge_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Start a challenge program."""
    challenge = await db.get(Challenge, challenge_id)
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
        
    result = await db.execute(
        select(UserChallengeProgress).where(
            and_(
                UserChallengeProgress.user_id == current_user.id,
                UserChallengeProgress.challenge_id == challenge_id
            )
        )
    )
    progress = result.scalar_one_or_none()
    
    if not progress:
        progress = UserChallengeProgress(
            user_id=current_user.id,
            challenge_id=challenge_id,
            current_day=1,
            completed_days="[]",
            started_at=date.today()
        )
        db.add(progress)
        await db.commit()
        
        result = await db.execute(
            select(UserChallengeProgress).where(
                and_(
                    UserChallengeProgress.user_id == current_user.id,
                    UserChallengeProgress.challenge_id == challenge_id
                )
            )
        )
        progress = result.scalar_one()
        
    return progress


@router.post("/challenges/{challenge_id}/day/{day_num}/complete", response_model=UserChallengeProgressOut)
async def complete_challenge_day(
    challenge_id: str,
    day_num: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a challenge day as completed."""
    result = await db.execute(
        select(UserChallengeProgress).where(
            and_(
                UserChallengeProgress.user_id == current_user.id,
                UserChallengeProgress.challenge_id == challenge_id
            )
        )
    )
    progress = result.scalar_one_or_none()
    
    if not progress:
        progress = UserChallengeProgress(
            user_id=current_user.id,
            challenge_id=challenge_id,
            current_day=1,
            completed_days="[]",
            started_at=date.today()
        )
        db.add(progress)
        await db.commit()
        
        result = await db.execute(
            select(UserChallengeProgress).where(
                and_(
                    UserChallengeProgress.user_id == current_user.id,
                    UserChallengeProgress.challenge_id == challenge_id
                )
            )
        )
        progress = result.scalar_one()

    try:
        completed = json.loads(progress.completed_days)
    except Exception:
        completed = []
        
    if day_num not in completed:
        completed.append(day_num)
        progress.completed_days = json.dumps(completed)
        
    if day_num == progress.current_day:
        progress.current_day += 1
        
    progress.last_active = date.today()
    db.add(progress)
    await db.commit()
    
    # Reload progress
    result = await db.execute(
        select(UserChallengeProgress).where(UserChallengeProgress.id == progress.id)
    )
    return result.scalar_one()
