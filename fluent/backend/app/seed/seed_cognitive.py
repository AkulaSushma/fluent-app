import asyncio
import json
from datetime import datetime, timezone, date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import (
    EtymologyPart,
    WordFamily,
    VocabularyNode,
    LibraryBook,
    PartType,
    FluencyTier,
    BookTrack,
    Theme,
    StoryMnemonic,
    StoryWordLink,
    Challenge,
    ChallengeDay
)

async def seed_cognitive(db: AsyncSession):
    print("  Seeding Cognitive Pattern Engine...")

    # 1. Seed Themes
    themes_data = [
        ("Emotions", "emotions", "Master the vocabulary of feelings and relationships.", "heart", "#E74C3C"),
        ("Finance & Economics", "finance", "Terms related to debt, inflation, and money markets.", "cash", "#2ECC71"),
        ("Leadership Styles", "leadership", "Describe management and authority patterns.", "account-star", "#9B59B6"),
        ("General Roots", "general", "Essential Latin and Greek building blocks of English.", "brain", "#3498DB")
    ]

    theme_map = {}
    for name, slug, desc, icon, color in themes_data:
        res = await db.execute(select(Theme).where(Theme.slug == slug))
        theme = res.scalar_one_or_none()
        if not theme:
            theme = Theme(
                name=name,
                slug=slug,
                description=desc,
                icon=icon,
                accent_color=color
            )
            db.add(theme)
            await db.flush()
        theme_map[slug] = theme.id
    print(f"    Seeded {len(theme_map)} themes.")

    # 2. Seed Etymology Parts (Prefixes, Roots, Suffixes)
    prefixes_data = [
        ("un", "not", "general", "unusual"),
        ("re", "again", "general", "rewrite"),
        ("pre", "before", "general", "predict"),
        ("mis", "wrong", "general", "misunderstand"),
        ("over", "excess", "general", "overwork"),
        ("sub", "under", "general", "submarine"),
        ("inter", "between", "general", "international"),
        ("trans", "across", "general", "translate"),
        ("anti", "against", "general", "antisocial"),
        ("dis", "apart/not", "general", "disappear"),
        ("mono", "one", "general", "monologue"),
        ("poly", "many", "general", "polygon"),
        ("neo", "new", "general", "neologism"),
        ("pseudo", "false", "general", "pseudonym"),
        ("auto", "self", "general", "automatic"),
        ("bene", "good/well", "general", "benefit"),
        ("mal", "bad", "general", "malfunction"),
        ("in", "not/in", "general", "incredible"),
        ("miso", "hate/against", "general", "misogynist"),
        ("allo", "other/different", "general", "allopathy"),
        ("sym", "together/with", "general", "sympathy"),
        ("em", "in/into", "general", "empathy"),
    ]

    roots_data = [
        ("dict", "say/speak", "general", "dictate"),
        ("aud", "hear", "general", "audible"),
        ("vis", "see", "general", "vision"),
        ("vid", "see", "general", "video"),
        ("scrib", "write", "general", "scribe"),
        ("script", "write", "general", "description"),
        ("port", "carry", "general", "transport"),
        ("ject", "throw", "general", "reject"),
        ("rupt", "break", "general", "rupture"),
        ("struct", "build", "general", "structure"),
        ("tract", "pull/draw", "general", "traction"),
        ("cred", "believe", "general", "credible"),
        ("path", "feeling", "general", "empathy"),
        ("morph", "form/shape", "general", "metamorphosis"),
        ("chron", "time", "general", "chronological"),
        ("graph", "write/draw", "general", "graphic"),
        ("phon", "sound", "general", "phonics"),
        ("luc", "light", "general", "lucid"),
        ("lum", "light", "general", "luminous"),
        ("voc", "call/voice", "general", "vocal"),
        ("vok", "call/voice", "general", "provoke"),
        ("cogn", "know", "general", "cognitive"),
        ("vol", "wish/will", "general", "volunteer"),
        ("gyn", "woman/lady", "medical", "gynecologist"),
        ("derm", "skin", "medical", "dermatology"),
        ("neuro", "nerve", "medical", "neurology"),
        ("cardio", "heart", "medical", "cardiology"),
        ("pathy", "pain/disease/feeling", "medical", "neuropathy"),
        ("amor", "love/affection", "general", "amorous"),
        ("phil", "love/affection", "general", "philosophy"),
        ("grat", "pleasure/thankfulness", "general", "gratitude"),
        ("ben", "good/kindness", "general", "benign"),
        ("soph", "wisdom", "general", "philosophy"),
        ("anthrop", "humanity", "general", "philanthropist"),
        ("arthr", "joint/bone", "medical", "arthritis"),
    ]

    suffixes_data = [
        ("tion", "act/process", "general", "action"),
        ("sion", "act/process", "general", "tension"),
        ("ness", "state/quality", "general", "kindness"),
        ("able", "capable of", "general", "readable"),
        ("ible", "capable of", "general", "incredible"),
        ("ment", "result/action", "general", "movement"),
        ("ful", "full of", "general", "beautiful"),
        ("less", "without", "general", "hopeless"),
        ("ous", "having quality", "general", "famous"),
        ("ious", "having quality", "general", "gracious"),
        ("ive", "tending to", "general", "active"),
        ("ly", "in manner of", "general", "quickly"),
        ("ist", "one who", "general", "artist"),
        ("ism", "doctrine/belief", "general", "realism"),
        ("ology", "study of", "general", "biology"),
        ("phobia", "fear of", "general", "claustrophobia"),
        ("ity", "quality/state", "general", "reality"),
        ("ent", "one who/that which", "general", "benevolent"),
        ("itis", "inflammation", "medical", "arthritis"),
    ]

    morpheme_map = {}

    async def add_parts(data, p_type):
        for morpheme, meaning, domain, example in data:
            res = await db.execute(
                select(EtymologyPart).where(
                    EtymologyPart.part_type == p_type,
                    EtymologyPart.morpheme == morpheme
                )
            )
            part = res.scalar_one_or_none()
            if not part:
                part = EtymologyPart(
                    part_type=p_type,
                    morpheme=morpheme,
                    meaning=meaning,
                    domain=domain,
                    example_word=example
                )
                db.add(part)
                await db.flush()
            morpheme_map[(p_type, morpheme)] = part.id

    await add_parts(prefixes_data, PartType.prefix)
    await add_parts(roots_data, PartType.root)
    await add_parts(suffixes_data, PartType.suffix)
    print(f"    Seeded {len(morpheme_map)} etymology parts.")

    # 3. Seed Word Families
    families_data = [
        # Growth & Change (theme: general)
        ("Growth & Change", "general", "transformation", FluencyTier.strong, 1),
        ("Communication", "general", "expression", FluencyTier.comfort, 2),
        ("Perception", "general", "awareness", FluencyTier.comfort, 3),
        ("Construction", "general", "building", FluencyTier.basic, 4),
        # Emotion & Feeling (theme: emotions)
        ("Emotion & Feeling", "emotions", "affect", FluencyTier.basic, 5),
        ("Knowledge", "general", "intellect", FluencyTier.strong, 6),
        ("Movement & Action", "general", "kinetic", FluencyTier.basic, 7),
        ("Time & Order", "general", "temporal", FluencyTier.comfort, 8),
        # Finance
        ("Finance & Debt", "finance", "monetary systems", FluencyTier.comfort, 9),
        # Leadership
        ("Authority & Styles", "leadership", "governing and lead archetypes", FluencyTier.strong, 10),
    ]

    family_map = {}
    for name, theme_slug, theme_label, tier, order in families_data:
        res = await db.execute(select(WordFamily).where(WordFamily.name == name))
        fam = res.scalar_one_or_none()
        theme_id = theme_map.get(theme_slug)
        if not fam:
            fam = WordFamily(
                name=name,
                theme=theme_label,
                theme_id=theme_id,
                base_meaning=f"Words relating to {name.lower()}.",
                fluency_tier=tier,
                sort_order=order
            )
            db.add(fam)
            await db.flush()
        else:
            fam.theme_id = theme_id
            fam.base_meaning = f"Words relating to {name.lower()}."
            db.add(fam)
            await db.flush()
        family_map[name] = fam.id
    print(f"    Seeded {len(family_map)} word families.")

    # 4. Seed Vocabulary Nodes (with calibrated intensity, synonyms, antonyms, mnemonics)
    nodes_data = [
        {
            "word": "benevolent",
            "definition": "Well meaning and kindly; wishing good things for others.",
            "prefix": "bene",
            "root": "vol",
            "suffix": "ent",
            "family": "Emotion & Feeling",
            "difficulty": 2,
            "context_sentence": "A benevolent gentleman left a large sum of money to the local school.",
            "visual_url": "https://upload.wikimedia.org/wikipedia/commons/e/eb/Benevolence_monument_square.jpg",
            "intensity": 0.6,
            "theme_slug": "emotions",
            "synonyms": ["kindly", "charitable", "generous", "altruistic"],
            "antonyms": ["malevolent", "spiteful", "selfish", "mean"],
            "mnemonic_text": "Bene (good) + vol (wish) -> wishing good on others. Imagine a sweet grandmother offering cookies."
        },
        {
            "word": "incredible",
            "definition": "Impossible to believe; extraordinary.",
            "prefix": "in",
            "root": "cred",
            "suffix": "ible",
            "family": "Perception",
            "difficulty": 1,
            "context_sentence": "The view from the top of the mountain was absolutely incredible.",
            "visual_url": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Incredible_landscape.jpg",
            "intensity": 0.5,
            "theme_slug": "general",
            "synonyms": ["extraordinary", "unbelievable", "amazing", "wonderful"],
            "antonyms": ["believable", "credible", "plausible", "ordinary"],
            "mnemonic_text": "In (not) + cred (believe) -> not believable because it's too amazing! Imagine a rabbit flying on a card."
        },
        {
            "word": "transparent",
            "definition": "Allowing light to pass through so that objects behind can be distinctly seen.",
            "prefix": "trans",
            "root": None,
            "suffix": "ent",
            "family": "Perception",
            "difficulty": 1,
            "context_sentence": "The clear water was so transparent that we could see the fish swimming at the bottom.",
            "visual_url": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Transparent_glass_sphere.jpg",
            "intensity": 0.4,
            "theme_slug": "general",
            "synonyms": ["clear", "see-through", "limpid", "obvious"],
            "antonyms": ["opaque", "hidden", "cloudy", "obscure"],
            "mnemonic_text": "Trans (across) -> appearing across so you can see right through it. Think of clean window glass."
        },
        {
            "word": "restructure",
            "definition": "Organize differently; build or rebuild in a new way.",
            "prefix": "re",
            "root": "struct",
            "suffix": None,
            "family": "Construction",
            "difficulty": 2,
            "context_sentence": "The company decided to restructure its operations to improve efficiency.",
            "visual_url": "https://upload.wikimedia.org/wikipedia/commons/f/fb/Restructuring_blocks.jpg",
            "intensity": 0.7,
            "theme_slug": "general",
            "synonyms": ["reorganize", "rebuild", "revamp", "realign"],
            "antonyms": ["preserve", "destroy", "stagnate"],
            "mnemonic_text": "Re (again) + struct (build) -> building it all over again in a better shape. Imagine a kid re-arranging Lego towers."
        },
        {
            "word": "audible",
            "definition": "Able to be heard.",
            "prefix": None,
            "root": "aud",
            "suffix": "ible",
            "family": "Perception",
            "difficulty": 1,
            "context_sentence": "The teacher's voice was barely audible above the noise of the traffic.",
            "visual_url": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Audible_sound_waves.jpg",
            "intensity": 0.3,
            "theme_slug": "general",
            "synonyms": ["hearable", "perceptible", "clear", "distinct"],
            "antonyms": ["inaudible", "silent", "faint"],
            "mnemonic_text": "Aud (hear) + ible (capable) -> capable of being heard by your ears. Think of audio volume."
        },
        {
            "word": "dictate",
            "definition": "Lay down authoritatively; say or read aloud words to be written down.",
            "prefix": None,
            "root": "dict",
            "suffix": None,
            "family": "Communication",
            "difficulty": 1,
            "context_sentence": "The manager will dictate the new office policy to her assistant.",
            "visual_url": "https://upload.wikimedia.org/wikipedia/commons/c/c2/Dictating_letter.jpg",
            "intensity": 0.5,
            "theme_slug": "general",
            "synonyms": ["command", "prescribe", "speak", "order"],
            "antonyms": ["request", "obey", "follow"],
            "mnemonic_text": "Dict (say/speak) -> laying down the spoken words. Think of a bossy dictator pointing fingers."
        },
        {
            "word": "contradict",
            "definition": "Assert the opposite of a statement made by someone.",
            "prefix": "anti",
            "root": "dict",
            "suffix": None,
            "family": "Communication",
            "difficulty": 2,
            "context_sentence": "The witness's testimony seemed to contradict the physical evidence.",
            "visual_url": "https://upload.wikimedia.org/wikipedia/commons/4/4b/Contradiction_scale.jpg",
            "intensity": 0.7,
            "theme_slug": "general",
            "synonyms": ["oppose", "gainsay", "deny", "dispute"],
            "antonyms": ["confirm", "agree", "support", "verify"],
            "mnemonic_text": "Contra (against) + dict (say) -> speaking directly against what someone else said. Imagine a scale tilting."
        },
        {
            "word": "metamorphosis",
            "definition": "A change of the form or nature of a thing or person into a completely different one.",
            "prefix": None,
            "root": "morph",
            "suffix": None,
            "family": "Growth & Change",
            "difficulty": 3,
            "context_sentence": "The caterpillar underwent a complete metamorphosis to become a butterfly.",
            "visual_url": "https://upload.wikimedia.org/wikipedia/commons/8/87/Monarch_Butterfly_Metamorphosis.jpg",
            "intensity": 0.9,
            "theme_slug": "general",
            "synonyms": ["transformation", "mutation", "transmutation", "evolution"],
            "antonyms": ["stagnation", "stasis", "permanence"],
            "mnemonic_text": "Morph (form/shape) -> changing shape completely. Visualize a green worm transforming into a beautiful blue butterfly."
        },
        {
            "word": "chronological",
            "definition": "Starting with the earliest and following the order in which they occurred.",
            "prefix": None,
            "root": "chron",
            "suffix": None,
            "family": "Time & Order",
            "difficulty": 2,
            "context_sentence": "The history teacher asked us to put the events in chronological order.",
            "visual_url": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Chronology_timeline.jpg",
            "intensity": 0.4,
            "theme_slug": "general",
            "synonyms": ["sequential", "ordered", "consecutive", "historical"],
            "antonyms": ["random", "unordered", "jumbled"],
            "mnemonic_text": "Chron (time) -> ordered on a timeline of time. Think of clocks ticking in a row."
        },
        {
            "word": "cognitive",
            "definition": "Relating to cognition; the mental action or process of acquiring knowledge and understanding.",
            "prefix": None,
            "root": "cogn",
            "suffix": "ive",
            "family": "Knowledge",
            "difficulty": 3,
            "context_sentence": "Cognitive development is a crucial part of childhood education.",
            "visual_url": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Brain_cognitive_network.jpg",
            "intensity": 0.8,
            "theme_slug": "general",
            "synonyms": ["mental", "intellectual", "rational", "subjective"],
            "antonyms": ["physical", "somatic", "automatic"],
            "mnemonic_text": "Cogn (know) -> relating to what the brain knows. Visualize neural pathways lighting up."
        },
        {
            "word": "loquacious",
            "definition": "Extremely talkative; babbling.",
            "prefix": None,
            "root": None,
            "suffix": "ous",
            "family": "Communication",
            "difficulty": 2,
            "context_sentence": "The loquacious host kept the dinner conversation lively.",
            "visual_url": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Talkative_crowd.jpg",
            "intensity": 0.85,
            "theme_slug": "general",
            "synonyms": ["talkative", "garrulous", "verbose", "chatty"],
            "antonyms": ["taciturn", "silent", "reserved", "quiet"],
            "mnemonic_text": "Loqu (speak) -> talks constantly. Visualize someone talking so fast they spit while talking!"
        },
        {
            "word": "malnutrition",
            "definition": "Lack of proper nutrition, caused by not having enough to eat or eating wrong things.",
            "prefix": "mal",
            "root": None,
            "suffix": "tion",
            "family": "Growth & Change",
            "difficulty": 2,
            "context_sentence": "The doctor diagnosed the weak child with severe malnutrition.",
            "visual_url": "https://upload.wikimedia.org/wikipedia/commons/1/18/Malnourished_child_check.jpg",
            "intensity": 0.75,
            "theme_slug": "general",
            "synonyms": ["undernourishment", "starvation", "emaciation"],
            "antonyms": ["nutrition", "health", "overfeeding"],
            "mnemonic_text": "Mal (bad) + nutrition -> bad or poor nutrition leading to weakness."
        },
        {
            "word": "malicious",
            "definition": "Characterized by malice; intending or intended to do harm.",
            "prefix": "mal",
            "root": None,
            "suffix": "ious",
            "family": "Emotion & Feeling",
            "difficulty": 2,
            "context_sentence": "A malicious rumor spread quickly through the halls.",
            "visual_url": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Malice_dark_shadows.jpg",
            "intensity": 0.8,
            "theme_slug": "emotions",
            "synonyms": ["spiteful", "malevolent", "hostile", "vicious"],
            "antonyms": ["benevolent", "kind", "friendly", "helpful"],
            "mnemonic_text": "Mal (bad/wrong) + ious -> full of bad wishes/intent. Think of a malicious computer virus."
        },
        {
            "word": "chronic",
            "definition": "Persisting for a long time or constantly recurring.",
            "prefix": None,
            "root": "chron",
            "suffix": None,
            "family": "Time & Order",
            "difficulty": 2,
            "context_sentence": "She suffers from chronic back pain.",
            "visual_url": "https://upload.wikimedia.org/wikipedia/commons/c/cb/Chronic_pain_clock.jpg",
            "intensity": 0.65,
            "theme_slug": "general",
            "synonyms": ["persistent", "constant", "continuous", "inveterate"],
            "antonyms": ["acute", "temporary", "fleeting"],
            "mnemonic_text": "Chron (time) -> lasting a very long time. Think of chronic illnesses."
        },
        {
            "word": "neurologist",
            "definition": "A specialist in the anatomy, functions, and organic disorders of nerves and the nervous system.",
            "prefix": None,
            "root": "neuro",
            "suffix": "ist",
            "family": "Knowledge",
            "difficulty": 3,
            "context_sentence": "The neurologist examined the patient's reflexes and brain scans.",
            "visual_url": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Neurologist_brain_scan.jpg",
            "intensity": 0.7,
            "theme_slug": "general",
            "synonyms": ["nerve specialist", "brain doctor"],
            "antonyms": [],
            "mnemonic_text": "Neuro (nerve) + logist (specialist) -> nerve and brain specialist. Think of neuro-science."
        },
        {
            "word": "dermatitis",
            "definition": "Inflammation of the skin.",
            "prefix": None,
            "root": "derm",
            "suffix": "itis",
            "family": "Emotion & Feeling",
            "difficulty": 2,
            "context_sentence": "Contact with poison ivy results in severe dermatitis.",
            "visual_url": "https://upload.wikimedia.org/wikipedia/commons/9/90/Dermatitis_rash.jpg",
            "intensity": 0.5,
            "theme_slug": "general",
            "synonyms": ["rash", "skin irritation"],
            "antonyms": [],
            "mnemonic_text": "Derm (skin) + itis (inflammation) -> inflamed skin rash."
        },
        {
            "word": "gratitude",
            "definition": "The quality of being thankful; readiness to show appreciation.",
            "prefix": None,
            "root": "grat",
            "suffix": "ity",
            "family": "Emotion & Feeling",
            "difficulty": 1,
            "context_sentence": "She expressed her deep gratitude for their support.",
            "visual_url": "https://upload.wikimedia.org/wikipedia/commons/8/82/Thankful_hands.jpg",
            "intensity": 0.7,
            "theme_slug": "emotions",
            "synonyms": ["thankfulness", "appreciation", "gratefulness"],
            "antonyms": ["ingratitude", "unthankfulness"],
            "mnemonic_text": "Grat (pleasure/thankfulness) + tude -> state of thankfulness. Think of grateful."
        }
    ]

    seeded_nodes_count = 0
    node_obj_map = {}
    for node in nodes_data:
        res = await db.execute(select(VocabularyNode).where(VocabularyNode.word == node["word"]))
        existing = res.scalar_one_or_none()
        
        prefix_id = morpheme_map.get((PartType.prefix, node["prefix"])) if node["prefix"] else None
        root_id = morpheme_map.get((PartType.root, node["root"])) if node["root"] else None
        suffix_id = morpheme_map.get((PartType.suffix, node["suffix"])) if node["suffix"] else None
        family_id = family_map.get(node["family"]) if node["family"] else None
        theme_id = theme_map.get(node["theme_slug"])

        syn_json = json.dumps(node.get("synonyms", []))
        ant_json = json.dumps(node.get("antonyms", []))

        if not existing:
            existing = VocabularyNode(
                word=node["word"],
                definition=node["definition"],
                prefix_link=prefix_id,
                root_link=root_id,
                suffix_link=suffix_id,
                word_family_id=family_id,
                difficulty=node["difficulty"],
                context_sentence=node["context_sentence"],
                visual_url=node["visual_url"],
                
                # New fields
                intensity=node["intensity"],
                theme_id=theme_id,
                mnemonic_text=node["mnemonic_text"],
                mnemonic_image_url=node["visual_url"], # match visual_url as fallback
                synonyms=syn_json,
                antonyms=ant_json
            )
            db.add(existing)
            seeded_nodes_count += 1
        else:
            # Update fields
            existing.prefix_link = prefix_id
            existing.root_link = root_id
            existing.suffix_link = suffix_id
            existing.word_family_id = family_id
            existing.intensity = node["intensity"]
            existing.theme_id = theme_id
            existing.mnemonic_text = node["mnemonic_text"]
            existing.mnemonic_image_url = node["visual_url"]
            existing.synonyms = syn_json
            existing.antonyms = ant_json
            db.add(existing)
            
        await db.flush()
        node_obj_map[node["word"]] = existing
        
    print(f"    Seeded/Updated {seeded_nodes_count} vocabulary nodes.")

    # 5. Seed Library Books
    books_data = [
        {
            "title": "Word Power Made Easy",
            "author": "Norman Lewis",
            "track": BookTrack.mastery,
            "cover_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
            "content_url": "The vocabulary in this book is structured into etymological modules. Tapping on words like benevolent, incredible, restructure, or chronological will reveal their Latin and Greek components. Start reading to see how a benevolent perspective changes your understanding of word families. Is it incredible to think that all these roots connect? We restructure our minds one root at a time, keeping it audible for constant practice.",
            "is_public_domain": False,
            "accent_color": "#2C3E50",
            "sort_order": 1,
            "description": "The simple, step-by-step method for increasing the strength and atmosphere of your vocabulary.",
            "chapter_count": 47
        },
        {
            "title": "The Elements of Style",
            "author": "Strunk & White",
            "track": BookTrack.mastery,
            "cover_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
            "content_url": "Clear writing requires transparent structure. Do not contradict yourself. Write in chronological order when explaining a process. Make sure your message remains audible and clear. Restructure sentences that sound weak or too complex.",
            "is_public_domain": False,
            "accent_color": "#1A1A2E",
            "sort_order": 2,
            "description": "The classic style guide for writing clear, concise, and beautiful English.",
            "chapter_count": 5
        },
        {
            "title": "Alice's Adventures in Wonderland",
            "author": "Lewis Carroll",
            "track": BookTrack.storytelling,
            "cover_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
            "content_url": "https://www.gutenberg.org/cache/epub/11/pg11.txt",
            "is_public_domain": True,
            "accent_color": "#8E44AD",
            "sort_order": 3,
            "description": "Alice's Adventures in Wonderland is an 1865 novel by English author Lewis Carroll.",
            "chapter_count": 12
        },
        {
            "title": "The Wonderful Wizard of Oz",
            "author": "L. Frank Baum",
            "track": BookTrack.storytelling,
            "cover_url": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
            "content_url": "https://www.gutenberg.org/cache/epub/55/pg55.txt",
            "is_public_domain": True,
            "accent_color": "#27AE60",
            "sort_order": 4,
            "description": "An American children's novel written by author L. Frank Baum.",
            "chapter_count": 24
        },
        {
            "title": "The Tale of Peter Rabbit",
            "author": "Beatrix Potter",
            "track": BookTrack.storytelling,
            "cover_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
            "content_url": "https://www.gutenberg.org/cache/epub/14838/pg14838.txt",
            "is_public_domain": True,
            "accent_color": "#2980B9",
            "sort_order": 5,
            "description": "A British children's book written and illustrated by Beatrix Potter.",
            "chapter_count": 1
        },
        {
            "title": "Aesop's Fables",
            "author": "Aesop",
            "track": BookTrack.storytelling,
            "cover_url": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400",
            "content_url": "https://www.gutenberg.org/cache/epub/19994/pg19994.txt",
            "is_public_domain": True,
            "accent_color": "#D35400",
            "sort_order": 6,
            "description": "A collection of fables credited to Aesop, believed to have lived in ancient Greece.",
            "chapter_count": 10
        }
    ]

    seeded_books_count = 0
    for book in books_data:
        res = await db.execute(select(LibraryBook).where(LibraryBook.title == book["title"]))
        existing = res.scalar_one_or_none()
        if not existing:
            lb = LibraryBook(
                title=book["title"],
                author=book["author"],
                track=book["track"],
                cover_url=book["cover_url"],
                content_url=book["content_url"],
                is_public_domain=book["is_public_domain"],
                accent_color=book["accent_color"],
                sort_order=book["sort_order"],
                description=book["description"],
                chapter_count=book["chapter_count"]
            )
            db.add(lb)
            seeded_books_count += 1
        else:
            existing.author = book["author"]
            existing.track = book["track"]
            existing.cover_url = book["cover_url"]
            existing.content_url = book["content_url"]
            existing.is_public_domain = book["is_public_domain"]
            existing.accent_color = book["accent_color"]
            existing.sort_order = book["sort_order"]
            existing.description = book["description"]
            existing.chapter_count = book["chapter_count"]
            db.add(existing)
            
    await db.flush()
    print(f"    Seeded/Updated {len(books_data)} library books.")

    # 6. Seed Curated Illustrated Stories (fables)
    stories_data = [
        {
            "title": "The Boy Who Cried Wolf",
            "body": "A shepherd boy tended his sheep near a dark forest. He found it lonely and decided to play a trick. He ran toward the village calling 'Wolf! Wolf!'. The villagers came running, only to find the boy laughing. They returned, annoyed. The next day, a real wolf came. The boy cried 'Wolf! Wolf!', but the villagers, thinking it was another trick, ignored his audible cries. The wolf killed many sheep. The boy learned that a liar will not be believed (incredible), even when he speaks transparent truth.",
            "is_system": True,
            "links": [
                {"word": "audible", "phrase": "audible cries"},
                {"word": "incredible", "phrase": "believed (incredible)"},
                {"word": "transparent", "phrase": "transparent truth"}
            ]
        },
        {
            "title": "The Tale of Peter Rabbit",
            "body": "Once upon a time there were four little Rabbits named Flopsy, Mopsy, Cottontail, and Peter. They lived with their Mother underneath the root of a very big tree. One morning Mrs. Rabbit warned them not to go into Mr. McGregor's garden. But Peter, who was very naughty, ran straight there and squeezed under the gate! He ate some radishes. Mr. McGregor chased him. Peter lost his shoes and ran into a restructure of old flowerpots. It was an incredible adventure, full of panic, but Peter was eventually safe, though his behavior was far from benevolent.",
            "is_system": True,
            "links": [
                {"word": "restructure", "phrase": "restructure of old flowerpots"},
                {"word": "incredible", "phrase": "incredible adventure"},
                {"word": "benevolent", "phrase": "far from benevolent"}
            ]
        }
    ]

    seeded_stories_count = 0
    for story in stories_data:
        res = await db.execute(select(StoryMnemonic).where(StoryMnemonic.title == story["title"]))
        existing_story = res.scalar_one_or_none()
        if not existing_story:
            existing_story = StoryMnemonic(
                title=story["title"],
                body=story["body"],
                is_system=story["is_system"]
            )
            db.add(existing_story)
            await db.flush()
            seeded_stories_count += 1

            for link in story["links"]:
                node = node_obj_map.get(link["word"])
                if node:
                    s_link = StoryWordLink(
                        story_id=existing_story.id,
                        node_id=node.id,
                        highlighted_phrase=link["phrase"]
                    )
                    db.add(s_link)
            await db.flush()
    print(f"    Seeded {seeded_stories_count} illustrated stories/fables.")

    # 7. Seed Challenges
    challenges_data = [
        {
            "title": "30-Day Root Mastery Challenge",
            "subtitle": "Learn 5 roots daily, construct words, and master English etymology.",
            "total_days": 30,
            "daily_minutes": 25,
            "theme_slug": "general",
            "days": [
                {"day_number": 1, "roots": ["bene", "mal", "dict", "aud", "vis"]},
                {"day_number": 2, "roots": ["scrib", "port", "ject", "rupt", "struct"]},
                {"day_number": 3, "roots": ["tract", "cred", "path", "morph", "chron"]},
                {"day_number": 4, "roots": ["graph", "phon", "luc", "lum", "voc"]},
                {"day_number": 5, "roots": ["vok", "cogn", "vol", "gyn", "derm"]},
            ]
        },
        {
            "title": "30-Day Emotions Challenge",
            "subtitle": "Expand your feelings vocabulary using root word families.",
            "total_days": 30,
            "daily_minutes": 20,
            "theme_slug": "emotions",
            "days": [
                {"day_number": 1, "roots": ["amor", "phil"]},
                {"day_number": 2, "roots": ["path", "grat"]},
                {"day_number": 3, "roots": ["ben", "mal"]},
                {"day_number": 4, "roots": ["vol", "soph"]},
            ]
        }
    ]

    seeded_challenges_count = 0
    for chal in challenges_data:
        res = await db.execute(select(Challenge).where(Challenge.title == chal["title"]))
        existing_chal = res.scalar_one_or_none()
        theme_id = theme_map.get(chal["theme_slug"])
        if not existing_chal:
            existing_chal = Challenge(
                title=chal["title"],
                subtitle=chal["subtitle"],
                total_days=chal["total_days"],
                daily_minutes=chal["daily_minutes"],
                theme_id=theme_id
            )
            db.add(existing_chal)
            await db.flush()
            seeded_challenges_count += 1

            for day_data in chal["days"]:
                c_day = ChallengeDay(
                    challenge_id=existing_chal.id,
                    day_number=day_data["day_number"],
                    root_part_ids=json.dumps(day_data["roots"])
                )
                db.add(c_day)
            await db.flush()
    print(f"    Seeded {seeded_challenges_count} challenge programs.")
    print("  [SUCCESS] Cognitive Pattern Engine seeded successfully!")
