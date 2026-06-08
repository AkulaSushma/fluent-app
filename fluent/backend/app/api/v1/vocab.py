"""
Fluent API — Vocabulary endpoints.
"""

from __future__ import annotations

from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models import User, VocabProgress
from app.schemas.learning import VocabDeckResponse, VocabMasterRequest, VocabThemesResponse
from app.services.content_service import generate_vocab_deck

router = APIRouter(prefix="/vocab", tags=["vocabulary"])

_AVAILABLE_THEMES = [
    "corporate", "technology", "academic", "travel", "medical",
    "legal", "finance", "science", "arts", "daily_life",
]


@router.get("/themes", response_model=VocabThemesResponse)
async def get_themes(
    _current_user: User = Depends(get_current_user),
):
    """Return all available vocabulary themes."""
    return VocabThemesResponse(themes=_AVAILABLE_THEMES)


@router.get("/card/{word}")
async def get_card_by_word(
    word: str,
    _current_user: User = Depends(get_current_user),
):
    """Look up card details (ipa, definition, example, translations) for a word."""
    from app.services.content_library import _VOCAB
    word_lower = word.lower()
    for theme, cards in _VOCAB.items():
        for card in cards:
            if card["word"].lower() == word_lower:
                return card
    return {
        "word": word,
        "ipa": "/.../",
        "definition": "Active vocabulary word in your learning journey.",
        "example": f"We are practicing the word {word} today.",
        "hindi": "शब्दावली शब्द",
        "telugu": "పదం",
    }


@router.get("/deck", response_model=VocabDeckResponse)
async def get_deck(
    theme: str = Query("corporate", min_length=1, max_length=100),
    count: int = Query(8, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a vocabulary deck for a given theme."""
    from app.services.daily_planner import _get_existing_plan
    from app.db.models import ContentItem
    from zoneinfo import ZoneInfo
    
    # Get user's local today date
    tz_str = current_user.timezone or "UTC"
    try:
        user_tz = ZoneInfo(tz_str)
    except Exception:
        user_tz = timezone.utc
    now_local = datetime.now(timezone.utc).astimezone(user_tz)
    today = now_local.date()
    
    plan = await _get_existing_plan(db, current_user.id, today)
    
    content_ids = []
    if plan:
        for t in (plan.morning_tasks or []):
            if t.get("type") == "vocab" and t.get("content_ids"):
                content_ids = t.get("content_ids")
                break
        if not content_ids:
            for t in (plan.evening_tasks or []):
                if t.get("type") in ("vocab", "vocab_review") and t.get("content_ids"):
                    content_ids = t.get("content_ids")
                    break

    if content_ids:
        # Fetch content items matching content_ids
        stmt = select(ContentItem).where(ContentItem.id.in_(content_ids))
        res = await db.execute(stmt)
        items = res.scalars().all()
        # Sort items in the order of content_ids
        item_map = {item.id: item for item in items}
        sorted_items = [item_map[cid] for cid in content_ids if cid in item_map]
        
        cards = []
        for item in sorted_items:
            payload = item.payload
            cards.append({
                "word": payload.get("word"),
                "ipa": payload.get("phonetic") or payload.get("ipa", "/.../"),
                "definition": payload.get("definition"),
                "example": payload.get("example"),
                "hindi": payload.get("hindi", ""),
                "telugu": payload.get("telugu", "")
            })
        return {"cards": cards}

    data = await generate_vocab_deck(theme, count)
    return VocabDeckResponse(**data)


@router.post("/mastered", status_code=200)
async def mark_mastered(
    body: VocabMasterRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a word as mastered and add it to the SRS system."""
    result = await db.execute(
        select(VocabProgress).where(
            VocabProgress.user_id == current_user.id,
            VocabProgress.word == body.word,
        )
    )
    progress = result.scalar_one_or_none()

    if progress:
        progress.mastered = True
        progress.reviewed_count += 1
        progress.last_reviewed = datetime.now(timezone.utc)
    else:
        progress = VocabProgress(
            user_id=current_user.id,
            word=body.word,
            mastered=True,
            reviewed_count=1,
            last_reviewed=datetime.now(timezone.utc),
        )
        db.add(progress)

    # Increment user's total words if newly mastered
    if progress.reviewed_count == 1 or not progress.mastered:
        current_user.total_words += 1
        db.add(current_user)

    # Add to SRS system for spaced repetition
    try:
        from app.services.srs_engine import add_card
        await add_card(db, current_user.id, body.word, "vocab")
    except Exception:
        pass  # SRS is supplementary, don't fail the request

    # Award XP for mastering a word
    try:
        from app.services.gamification_service import award_xp
        await award_xp(db, current_user.id, 5, "vocab", f"Mastered: {body.word}")
    except Exception:
        pass  # XP is supplementary

    await db.flush()

    return {"status": "ok", "word": body.word, "mastered": True}



import asyncio
import random
import httpx
import hashlib

def _get_wikimedia_direct_url(filename: str) -> str:
    """Compute direct Wikimedia Commons 330px thumbnail URL locally from filename using MD5 hashing."""
    fn = filename.strip().replace(" ", "_")
    if fn:
        fn = fn[0].upper() + fn[1:]
    md5_hash = hashlib.md5(fn.encode("utf-8")).hexdigest()
    hash1 = md5_hash[0]
    hash2 = md5_hash[0:2]
    return f"https://upload.wikimedia.org/wikipedia/commons/thumb/{hash1}/{hash2}/{fn}/330px-{fn}"


_FALLBACK_VISUAL_POOL = [
    # Daily Life
    {
        "word": "Alarm clock",
        "ipa": "/əˈlɑːm ˌklɒk/",
        "imageFile": "2010-07-20_Black_windup_alarm_clock_face.jpg",
        "definition": "A clock that can be set to make a sound or show a light at a particular time, used to wake someone up.",
        "category": "daily_life",
        "categoryLabel": "Daily Life",
    },
    {
        "word": "Toothbrush",
        "ipa": "/ˈtuːθ.brʌʃ/",
        "imageFile": "Toothbrush_20050716_004.jpg",
        "definition": "A small brush with a long handle, used for cleaning your teeth.",
        "category": "daily_life",
        "categoryLabel": "Daily Life",
    },
    {
        "word": "Backpack",
        "ipa": "/ˈbæk.pæk/",
        "imageFile": "Rucksack1.jpg",
        "definition": "A bag with shoulder straps which allow it to be carried on someone's back.",
        "category": "daily_life",
        "categoryLabel": "Daily Life",
    },
    {
        "word": "Umbrella",
        "ipa": "/ʌmˈbrel.ə/",
        "imageFile": "Red_umbrella.jpg",
        "definition": "A folding canopy supported on wooden or metal ribs, used for protection against rain.",
        "category": "daily_life",
        "categoryLabel": "Daily Life",
    },
    {
        "word": "Keyring",
        "ipa": "/ˈkiː.rɪŋ/",
        "imageFile": "Car_Keys.jpg",
        "definition": "A metal ring for keeping keys together.",
        "category": "daily_life",
        "categoryLabel": "Daily Life",
    },
    {
        "word": "Coffee mug",
        "ipa": "/ˈkɒf.i mʌɡ/",
        "imageFile": "Mug_of_Tea.JPG",
        "definition": "A large cup, typically cylindrical with a handle, used for drinking hot beverages.",
        "category": "daily_life",
        "categoryLabel": "Daily Life",
    },
    {
        "word": "Pillow",
        "ipa": "/ˈpɪl.əʊ/",
        "imageFile": "Pillows_on_a_hotel_bed.jpg",
        "definition": "A rectangular cloth bag filled with soft material, used to support the head in bed.",
        "category": "daily_life",
        "categoryLabel": "Daily Life",
    },
    {
        "word": "Sunglasses",
        "ipa": "/ˈsʌn.ɡlɑː.sɪz/",
        "imageFile": "Sunglasses_pic17.jpg",
        "definition": "Glasses with darkened lenses to protect the eyes from the sun's glare.",
        "category": "daily_life",
        "categoryLabel": "Daily Life",
    },
    {
        "word": "Mirror",
        "ipa": "/ˈmɪr.ər/",
        "imageFile": "Mirror.jpg",
        "definition": "A surface, typically of glass coated with a metal amalgam, that reflects a clear image.",
        "category": "daily_life",
        "categoryLabel": "Daily Life",
    },
    {
        "word": "Wallet",
        "ipa": "/ˈwɒl.ɪt/",
        "imageFile": "WalletMpegMan.jpg",
        "definition": "A pocket-sized, flat folding case for holding money and cards.",
        "category": "daily_life",
        "categoryLabel": "Daily Life",
    },

    # Corporate Life
    {
        "word": "Stapler",
        "ipa": "/ˈsteɪ.plər/",
        "imageFile": "2017_Zszywacz_biurowy.jpg",
        "definition": "A device used for fastening sheets of paper together with a metal staple.",
        "category": "corporate",
        "categoryLabel": "Corporate Life",
    },
    {
        "word": "Paperclip",
        "ipa": "/ˈpeɪ.pə.klɪp/",
        "imageFile": "Wanzijia.jpg",
        "definition": "A piece of bent wire or plastic used for holding sheets of paper together.",
        "category": "corporate",
        "categoryLabel": "Corporate Life",
    },
    {
        "word": "Lanyard",
        "ipa": "/ˈlæn.jəd/",
        "imageFile": "Lanyard_Woelfe_Freiburg.jpg",
        "definition": "A cord or strap worn around the neck to carry an ID card or keys.",
        "category": "corporate",
        "categoryLabel": "Corporate Life",
    },
    {
        "word": "Whiteboard",
        "ipa": "/ˈwaɪt.bɔːd/",
        "imageFile": "Whiteboard.jpg",
        "definition": "A glossy, usually white board for writing on with dry-erase markers.",
        "category": "corporate",
        "categoryLabel": "Corporate Life",
    },
    {
        "word": "Desk lamp",
        "ipa": "/ˈdesk ˌlæmp/",
        "imageFile": "A_desk_lamp.jpg",
        "definition": "A small adjustable lamp designed to sit on a desk or table.",
        "category": "corporate",
        "categoryLabel": "Corporate Life",
    },
    {
        "word": "Calculator",
        "ipa": "/ˈkæl.kjə.leɪ.tər/",
        "imageFile": "Casio_calculator_JS-20WK_in_201901_002.jpg",
        "definition": "A small electronic device used for performing mathematical calculations.",
        "category": "corporate",
        "categoryLabel": "Corporate Life",
    },
    {
        "word": "Hole puncher",
        "ipa": "/həʊl ˈpʌn.tʃər/",
        "imageFile": "3_perforators.jpg",
        "definition": "An office tool that is used to create holes in sheets of paper.",
        "category": "corporate",
        "categoryLabel": "Corporate Life",
    },
    {
        "word": "Keyboard",
        "ipa": "/ˈkiː.bɔːd/",
        "imageFile": "QWERTY_keyboard.jpg",
        "definition": "A panel of keys used to input characters and commands into a computer.",
        "category": "corporate",
        "categoryLabel": "Corporate Life",
    },
    {
        "word": "Clipboard",
        "ipa": "/ˈklɪp.bɔːd/",
        "imageFile": "Wood-clipboard.jpg",
        "definition": "A thin, rigid board with a clip at the top for holding papers in place.",
        "category": "corporate",
        "categoryLabel": "Corporate Life",
    },
    {
        "word": "Sticky note",
        "ipa": "/ˈstɪk.i nəʊt/",
        "imageFile": "Sticky_Notes.jpg",
        "definition": "A small piece of paper with a re-adherable strip of glue on its back.",
        "category": "corporate",
        "categoryLabel": "Corporate Life",
    },

    # Catering & Dining
    {
        "word": "Serving tray",
        "ipa": "/ˈsɜː.vɪŋ ˌtreɪ/",
        "imageFile": "Wooden_tray.jpg",
        "definition": "A flat container, typically with a rim, used for carrying food and drinks.",
        "category": "catering",
        "categoryLabel": "Catering & Dining",
    },
    {
        "word": "Chafing dish",
        "ipa": "/ˈtʃeɪ.fɪŋ ˌdɪʃ/",
        "imageFile": "Chafingdish.jpg",
        "definition": "A metal pan with a heating device beneath it, used to keep food warm at a buffet.",
        "category": "catering",
        "categoryLabel": "Catering & Dining",
    },
    {
        "word": "Cocktail shaker",
        "ipa": "/ˈkɒk.teɪl ˌʃeɪ.kər/",
        "imageFile": "Shaker_-_2.jpg",
        "definition": "A container in which ingredients for cocktails are mixed by shaking.",
        "category": "catering",
        "categoryLabel": "Catering & Dining",
    },
    {
        "word": "Tongs",
        "ipa": "/tɒŋz/",
        "imageFile": "Kitchen-tongs.png",
        "definition": "A kitchen tool used for picking up or turning food items.",
        "category": "catering",
        "categoryLabel": "Catering & Dining",
    },
    {
        "word": "Apron",
        "ipa": "/ˈeɪ.prən/",
        "imageFile": "Apron.jpg",
        "definition": "A protective garment worn over the front of clothes, tied at the back.",
        "category": "catering",
        "categoryLabel": "Catering & Dining",
    },
    {
        "word": "Corkscrew",
        "ipa": "/ˈkɔːk.skruː/",
        "imageFile": "Corkscrews_December_2014-1.jpg",
        "definition": "A tool for pulling corks from wine bottles, consisting of a spiral metal screw with a handle.",
        "category": "catering",
        "categoryLabel": "Catering & Dining",
    },
    {
        "word": "Whisk",
        "ipa": "/wɪsk/",
        "imageFile": "Schneebesen1.JPG",
        "definition": "A kitchen tool used for whipping or beating ingredients.",
        "category": "catering",
        "categoryLabel": "Catering & Dining",
    },
    {
        "word": "Rolling pin",
        "ipa": "/ˈrəʊ.lɪŋ ˌpɪn/",
        "imageFile": "Rollingpin.jpg",
        "definition": "A cylinder rolled over pastry or dough in order to flatten or shape it.",
        "category": "catering",
        "categoryLabel": "Catering & Dining",
    },
    {
        "word": "Pitcher",
        "ipa": "/ˈpɪtʃ.ər/",
        "imageFile": "Milk_Pitcher_With_Lid.jpg",
        "definition": "A container with a spout and handle, used for holding and pouring liquids.",
        "category": "catering",
        "categoryLabel": "Catering & Dining",
    },
    {
        "word": "Coaster",
        "ipa": "/ˈkəʊ.stər/",
        "imageFile": "Cork_coaster.jpg",
        "definition": "A small tray or mat placed under a bottle or glass to protect the table.",
        "category": "catering",
        "categoryLabel": "Catering & Dining",
    },

    # Traveling
    {
        "word": "Suitcase",
        "ipa": "/ˈsuːt.keɪs/",
        "imageFile": "Suitcase1.jpg",
        "definition": "A case with a flat lid for carrying clothes and other belongings when traveling.",
        "category": "travel",
        "categoryLabel": "Traveling & Outdoors",
    },
    {
        "word": "Passport",
        "ipa": "/ˈpɑːs.pɔːt/",
        "imageFile": "Passports-assorted.jpg",
        "definition": "An official travel document issued by a government, certifying the holder's identity.",
        "category": "travel",
        "categoryLabel": "Traveling & Outdoors",
    },
    {
        "word": "Compass",
        "ipa": "/ˈkʌm.pəs/",
        "imageFile": "2016_Busola.JPG",
        "definition": "An instrument containing a magnetized pointer which shows the direction of magnetic north.",
        "category": "travel",
        "categoryLabel": "Traveling & Outdoors",
    },
    {
        "word": "Binoculars",
        "ipa": "/bɪˈnɒk.jə.ləz/",
        "imageFile": "Binocular_with_8x_magnification_and_42_mm_lens_diameter.jpg",
        "definition": "An optical instrument with a lens for each eye, used for viewing distant objects.",
        "category": "travel",
        "categoryLabel": "Traveling & Outdoors",
    },
    {
        "word": "Tent",
        "ipa": "/tent/",
        "imageFile": "Tent_at_High_Shelf_Camp_cropped.jpg",
        "definition": "A portable shelter made of cloth, supported by one or more poles and stretched tight by cords.",
        "category": "travel",
        "categoryLabel": "Traveling & Outdoors",
    },
    {
        "word": "Sleeping bag",
        "ipa": "/ˈsliː.pɪŋ ˌbæɡ/",
        "imageFile": "Israel_2_021_Sleeping_Rucksack-Tourist.jpg",
        "definition": "A warm padded protective bag to sleep in, especially when camping.",
        "category": "travel",
        "categoryLabel": "Traveling & Outdoors",
    },
    {
        "word": "Flashlight",
        "ipa": "/ˈflæʃ.laɪt/",
        "imageFile": "LED_Flashlights.jpg",
        "definition": "A small portable electric light, usually powered by batteries.",
        "category": "travel",
        "categoryLabel": "Traveling & Outdoors",
    },
    {
        "word": "Hiking boots",
        "ipa": "/ˈhaɪ.kɪŋ buːts/",
        "imageFile": "Wanderlust.jpg",
        "definition": "Sturdy footwear designed specifically for hiking or walking over rough terrain.",
        "category": "travel",
        "categoryLabel": "Traveling & Outdoors",
    },
    {
        "word": "Canteen",
        "ipa": "/kænˈtiːn/",
        "imageFile": "Military_Canteen_7984.jpg",
        "definition": "A small flask or flask-like container used by soldiers, travelers, or campers for carrying water.",
        "category": "travel",
        "categoryLabel": "Traveling & Outdoors",
    },
    {
        "word": "Luggage tag",
        "ipa": "/ˈlʌɡ.ɪdʒ tæɡ/",
        "imageFile": "Dca-baggage-tag.jpg",
        "definition": "A tag attached to an item of luggage to identify its owner.",
        "category": "travel",
        "categoryLabel": "Traveling & Outdoors",
    }
]

# Dynamically populate the absolute CDN URLs for fallback pool items
for _item in _FALLBACK_VISUAL_POOL:
    _item["imageUrl"] = _get_wikimedia_direct_url(_item.pop("imageFile"))

_CURATED_WIKI_MAPPINGS = {
    "alarm clock": "2010-07-20_Black_windup_alarm_clock_face.jpg",
    "toothbrush": "Toothbrush_20050716_004.jpg",
    "backpack": "Rucksack1.jpg",
    "umbrella": "Red_umbrella.jpg",
    "keyring": "Car_Keys.jpg",
    "keychain": "Car_Keys.jpg",
    "coffee mug": "Mug_of_Tea.JPG",
    "mug": "Mug_of_Tea.JPG",
    "pillow": "Pillows_on_a_hotel_bed.jpg",
    "sunglasses": "Sunglasses_pic17.jpg",
    "mirror": "Mirror.jpg",
    "wallet": "WalletMpegMan.jpg",
    "stapler": "2017_Zszywacz_biurowy.jpg",
    "paperclip": "Wanzijia.jpg",
    "paper clip": "Wanzijia.jpg",
    "lanyard": "Lanyard_Woelfe_Freiburg.jpg",
    "whiteboard": "Whiteboard.jpg",
    "desk lamp": "A_desk_lamp.jpg",
    "table lamp": "A_desk_lamp.jpg",
    "calculator": "Casio_calculator_JS-20WK_in_201901_002.jpg",
    "hole puncher": "3_perforators.jpg",
    "hole punch": "3_perforators.jpg",
    "keyboard": "QWERTY_keyboard.jpg",
    "computer keyboard": "QWERTY_keyboard.jpg",
    "clipboard": "Wood-clipboard.jpg",
    "sticky note": "Sticky_Notes.jpg",
    "post-it note": "Sticky_Notes.jpg",
    "serving tray": "Wooden_tray.jpg",
    "tray": "Wooden_tray.jpg",
    "chafing dish": "Chafingdish.jpg",
    "cocktail shaker": "Shaker_-_2.jpg",
    "tongs": "Kitchen-tongs.png",
    "apron": "Apron.jpg",
    "corkscrew": "Corkscrews_December_2014-1.jpg",
    "whisk": "Schneebesen1.JPG",
    "rolling pin": "Rollingpin.jpg",
    "pitcher": "Milk_Pitcher_With_Lid.jpg",
    "coaster": "Cork_coaster.jpg",
    "beverage coaster": "Cork_coaster.jpg",
    "suitcase": "Suitcase1.jpg",
    "passport": "Passports-assorted.jpg",
    "compass": "2016_Busola.JPG",
    "binoculars": "Binocular_with_8x_magnification_and_42_mm_lens_diameter.jpg",
    "tent": "Tent_at_High_Shelf_Camp_cropped.jpg",
    "sleeping bag": "Israel_2_021_Sleeping_Rucksack-Tourist.jpg",
    "flashlight": "LED_Flashlights.jpg",
    "hiking boots": "Wanderlust.jpg",
    "hiking boot": "Wanderlust.jpg",
    "canteen": "Military_Canteen_7984.jpg",
    "luggage tag": "Dca-baggage-tag.jpg",
    "bag tag": "Dca-baggage-tag.jpg",
}


async def _fetch_wikipedia_image_url(
    client: httpx.AsyncClient, 
    title: str, 
    wiki_article: str | None = None,
    image_search_query: str | None = None
) -> str | None:
    """Fetch high quality image URL using pre-curated mappings, smart Wikimedia Commons search, or Wikipedia fallback."""
    import re
    # 1. Try to use pre-curated mappings for exact matches
    normalized = title.strip().lower()
    if normalized in _CURATED_WIKI_MAPPINGS:
        return _get_wikimedia_direct_url(_CURATED_WIKI_MAPPINGS[normalized])
    
    if wiki_article:
        normalized_art = wiki_article.strip().lower()
        if normalized_art in _CURATED_WIKI_MAPPINGS:
            return _get_wikimedia_direct_url(_CURATED_WIKI_MAPPINGS[normalized_art])
            
    # 2. Smart Wikimedia Commons Search
    search_queries = []
    if image_search_query:
        search_queries.append(image_search_query)
    search_queries.append(f"{wiki_article if wiki_article else title} photo")
    search_queries.append(title)
    
    exclude_patterns = [
        r"logo", r"map", r"diagram", r"icon", r"flag", r"portrait", 
        r"painting", r"drawing", r"illustration", r"sketch", r"graph", 
        r"chart", r"blueprint", r"cartoon", r"statue", r"monument", 
        r"sign", r"text", r"coin", r"stamp", r"historic", r"history", r"ancient",
        r"antique", r"page"
    ]
    invalid_extensions = [".pdf", ".svg", ".djvu", ".tiff", ".tif", ".ogv", ".ogg", ".mp4", ".gif", ".webm"]
    
    headers = {
        'User-Agent': 'FluentFluencyApp/1.0 (contact@fluent.app; smart-search-resolver)'
    }
    
    for query in search_queries:
        try:
            url = "https://commons.wikimedia.org/w/api.php"
            params = {
                "action": "query",
                "generator": "search",
                "gsrsearch": query,
                "gsrnamespace": 6,  # Files only
                "prop": "imageinfo",
                "iiprop": "url",
                "iiurlwidth": 400,
                "format": "json",
                "gsrlimit": 10
            }
            resp = await client.get(url, params=params, headers=headers, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                pages = data.get("query", {}).get("pages", {})
                if pages:
                    # Sort pages by index (relevance score)
                    sorted_pages = sorted(pages.values(), key=lambda x: x.get("index", 100))
                    
                    first_img = None
                    for page in sorted_pages:
                        page_title = page.get("title", "").lower()
                        img_info = page.get("imageinfo", [])
                        if not img_info:
                            continue
                            
                        # Exclude document types and other non-jpg formats
                        if any(ext in page_title for ext in invalid_extensions):
                            continue
                            
                        thumb_url = img_info[0].get("thumburl") or img_info[0].get("url")
                        if not thumb_url:
                            continue
                            
                        # Check file extension from URL
                        ext = thumb_url.split(".")[-1].split("?")[0].lower()
                        if ext not in ["jpg", "jpeg", "png", "webp"]:
                            continue
                            
                        if not first_img:
                            first_img = thumb_url
                            
                        # Check sence exclusions
                        is_excluded = False
                        for pat in exclude_patterns:
                            if re.search(pat, page_title):
                                is_excluded = True
                                break
                                
                        if not is_excluded:
                            return thumb_url
                            
                    if first_img:
                        return first_img
        except Exception:
            pass

    # 3. Dynamic Wikipedia query fallback (original method)
    query_title = wiki_article if wiki_article else title
    formatted_title = query_title.strip().replace(" ", "_")
    url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "prop": "pageimages",
        "format": "json",
        "piprop": "thumbnail",
        "pithumbsize": 400,
        "titles": formatted_title,
    }
    try:
        resp = await client.get(url, params=params, headers=headers, timeout=4.0)
        if resp.status_code == 200:
            data = resp.json()
            pages = data.get("query", {}).get("pages", {})
            for page_id, page_data in pages.items():
                if "thumbnail" in page_data:
                    return page_data["thumbnail"]["source"]
    except Exception:
        pass
        
    return None


import urllib.parse

_IMAGE_CACHE = {}

async def _prewarm_cache():
    """Fetch and cache all fallback pool images in the background at startup."""
    await asyncio.sleep(2.0)  # Wait for server startup to complete
    headers = {
        'User-Agent': 'FluentFluencyApp/1.0 (contact@fluent.app; prewarm-cache)'
    }
    async with httpx.AsyncClient() as client:
        for item in _FALLBACK_VISUAL_POOL:
            url = item.get("imageUrl")
            if url and url not in _IMAGE_CACHE:
                try:
                    resp = await client.get(url, headers=headers, timeout=10.0)
                    if resp.status_code == 200:
                        content_type = resp.headers.get("content-type", "image/jpeg")
                        _IMAGE_CACHE[url] = (resp.content, content_type)
                except Exception:
                    pass

async def _cache_image_url(client: httpx.AsyncClient, url: str) -> None:
    """Download and cache image URL in local memory cache."""
    if not url or url in _IMAGE_CACHE:
        return
    headers = {
        'User-Agent': 'FluentFluencyApp/1.0 (contact@fluent.app; prefetch-agent)'
    }
    try:
        resp = await client.get(url, headers=headers, timeout=3.0)
        if resp.status_code == 200:
            content_type = resp.headers.get("content-type", "image/jpeg")
            _IMAGE_CACHE[url] = (resp.content, content_type)
    except Exception:
        pass


@router.get("/image-proxy")
async def image_proxy(url: str):
    """Proxy image requests to bypass Wikimedia/external user-agent blocks on mobile clients."""
    cache_headers = {
        "Cache-Control": "public, max-age=31536000, immutable"
    }
    if url in _IMAGE_CACHE:
        content, content_type = _IMAGE_CACHE[url]
        return Response(content=content, media_type=content_type, headers=cache_headers)

    headers = {
        'User-Agent': 'FluentFluencyApp/1.0 (contact@fluent.app; proxy-agent)'
    }
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, headers=headers, timeout=10.0)
            if resp.status_code == 200:
                content_type = resp.headers.get("content-type", "image/jpeg")
                _IMAGE_CACHE[url] = (resp.content, content_type)
                return Response(content=resp.content, media_type=content_type, headers=cache_headers)
            else:
                raise HTTPException(status_code=resp.status_code, detail="Failed to fetch image from source")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")


@router.get("/visual")
async def get_visual_vocab(
    request: Request,
    _current_user: User = Depends(get_current_user),
):
    """Return a randomized list of visual object naming cards, resolving images dynamically via local proxy."""
    # Shuffling and sampling the large pre-curated fallback pool of 40 objects
    sampled = random.sample(_FALLBACK_VISUAL_POOL, min(10, len(_FALLBACK_VISUAL_POOL)))
    formatted_cards = []
    base_url_str = str(request.base_url)
    for card in sampled:
        c_copy = dict(card)
        if "imageUrl" in c_copy and c_copy["imageUrl"]:
            c_copy["imageUrl"] = f"{base_url_str}api/v1/vocab/image-proxy?url={urllib.parse.quote(c_copy['imageUrl'], safe='')}"
        formatted_cards.append(c_copy)
    random.shuffle(formatted_cards)
    return {"cards": formatted_cards}

