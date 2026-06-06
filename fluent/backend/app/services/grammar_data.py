from typing import Any

_GRAMMAR: dict[str, dict[str, Any]] = {
    # ── Category 1: Tenses & Time ─────────────────────────────────────────
    "present_simple_vs_continuous": {
        "id": "present_simple_vs_continuous",
        "topic": "Present Simple vs Continuous",
        "level": 1,
        "levelLabel": "Foundation",
        "category": "tenses",
        "categoryLabel": "Tenses & Time",
        "categoryEmoji": "⏳",
        "prerequisites": [],
        "rule": "Use Present Simple for habitual actions, facts, and permanent states. Use Present Continuous for temporary situations, ongoing trends, or actions happening at the moment of speaking.",
        "explanation": "The Present Simple describes general truths or habits that are true over time. In contrast, the Present Continuous describes an action in progress right now or a temporary state that is not a permanent routine.",
        "formula": "Simple: Subject + Verb (adds -s/-es for 3rd person) | Continuous: Subject + am/is/are + Verb-ing",
        "timeline": {"label_left": "Past", "label_right": "Future", "marker": "Habitual state vs. Temporary action in progress"},
        "examples": [
            {
                "sentence": "She works in London.",
                "tokens": [
                    {"text": "She", "role": "subject"},
                    {"text": "works", "role": "verb"},
                    {"text": "in", "role": "preposition"},
                    {"text": "London", "role": "object"}
                ],
                "translation_hint": "वह लंदन में काम करती है। / ఆమె లండన్‌లో పనిచేస్తుంది.",
                "note": "Present Simple shows her permanent place of work."
            },
            {
                "sentence": "She is working in London today.",
                "tokens": [
                    {"text": "She", "role": "subject"},
                    {"text": "is", "role": "auxiliary"},
                    {"text": "working", "role": "verb"},
                    {"text": "in", "role": "preposition"},
                    {"text": "London", "role": "object"},
                    {"text": "today", "role": "adverb"}
                ],
                "translation_hint": "वह आज लंदन में काम कर रही है। / ఆమె ఈరోజు లండన్‌లో పనిచేస్తోంది.",
                "note": "Present Continuous emphasizes a temporary situation for today only."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "I am knowing the answer.",
                "right": "I know the answer.",
                "explanation": "Stative verbs like 'know' cannot be used in continuous tenses because they express states, not active physical processes."
            },
            {
                "wrong": "He play tennis every Sunday.",
                "right": "He plays tennis every Sunday.",
                "explanation": "In Present Simple, third-person singular subjects (he, she, it) require the verb to end in -s or -es."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Stative Verbs",
                "body": "Verbs representing thoughts, feelings, senses, and possession (e.g. like, want, believe, own) are almost never used in the continuous form."
            }
        ],
        "quiz": [
            {
                "q": "Water ___ at 100 degrees Celsius.",
                "options": ["boil", "boils", "is boiling", "boiling"],
                "answer": 1,
                "explanation": "Scientific facts and general truths are always written in the Present Simple."
            },
            {
                "q": "Look! It ___ outside.",
                "options": ["snows", "snow", "is snowing", "was snowing"],
                "answer": 2,
                "explanation": "'Look!' signals that the action is happening at the exact moment of speaking, requiring Present Continuous."
            },
            {
                "q": "He usually ___ to bed at 10 PM.",
                "options": ["go", "goes", "is going", "went"],
                "answer": 1,
                "explanation": "The word 'usually' indicates a habit or routine, which requires Present Simple."
            },
            {
                "q": "I ___ a book at the moment.",
                "options": ["read", "am reading", "reads", "reading"],
                "answer": 1,
                "explanation": "'At the moment' indicates an action currently in progress, requiring Present Continuous."
            },
            {
                "q": "They ___ a car right now.",
                "options": ["don't own", "are not owning", "doesn't own", "not owning"],
                "answer": 0,
                "explanation": "'Own' is a stative verb and cannot be used in the continuous form even with 'right now'."
            }
        ]
    },
    "past_simple_vs_continuous": {
        "id": "past_simple_vs_continuous",
        "topic": "Past Simple vs Continuous",
        "level": 1,
        "levelLabel": "Foundation",
        "category": "tenses",
        "categoryLabel": "Tenses & Time",
        "categoryEmoji": "⏳",
        "prerequisites": [],
        "rule": "Use Past Simple for completed actions in the past. Use Past Continuous to describe a background state or an action in progress at a specific time in the past.",
        "explanation": "The Past Simple lists events in sequence (e.g. 'I woke up, ate, and left'). The Past Continuous sets the scene or describes a longer background action that was interrupted by a shorter Past Simple event.",
        "formula": "Simple: Subject + Past Verb (V2) | Continuous: Subject + was/were + Verb-ing",
        "timeline": {"label_left": "Past Action in progress", "label_right": "Now", "marker": "Interrupted action in the past"},
        "examples": [
            {
                "sentence": "I cooked dinner last night.",
                "tokens": [
                    {"text": "I", "role": "subject"},
                    {"text": "cooked", "role": "verb"},
                    {"text": "dinner", "role": "object"},
                    {"text": "last", "role": "adjective"},
                    {"text": "night", "role": "noun"}
                ],
                "translation_hint": "मैंने कल रात खाना पकाया। / నేను నిన్న రాత్రి వంట చేశాను.",
                "note": "Past Simple represents a completed past action."
            },
            {
                "sentence": "I was cooking dinner when she arrived.",
                "tokens": [
                    {"text": "I", "role": "subject"},
                    {"text": "was", "role": "auxiliary"},
                    {"text": "cooking", "role": "verb"},
                    {"text": "dinner", "role": "object"},
                    {"text": "when", "role": "conjunction"},
                    {"text": "she", "role": "subject"},
                    {"text": "arrived", "role": "verb"}
                ],
                "translation_hint": "जब वह आई तब मैं खाना पका रहा था। / ఆమె వచ్చేసరికి నేను వంట చేస్తున్నాను.",
                "note": "Past Continuous shows an action that was in progress when a shorter action interrupted it."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "While I walked in the rain, my phone rang.",
                "right": "While I was walking in the rain, my phone rang.",
                "explanation": "Use Past Continuous for the longer background action that was taking place when the interruption occurred."
            },
            {
                "wrong": "I was seeing him at the store yesterday.",
                "right": "I saw him at the store yesterday.",
                "explanation": "Use Past Simple for a brief, completed action at a specific time in the past."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "When vs While",
                "body": "Use 'while' before a continuous background action (while I was sleeping), and 'when' before a short completed action (when the phone rang)."
            }
        ],
        "quiz": [
            {
                "q": "They ___ football when it started to rain.",
                "options": ["played", "were playing", "was playing", "are playing"],
                "answer": 1,
                "explanation": "An ongoing past action (were playing) is interrupted by a sudden event (started to rain)."
            },
            {
                "q": "She ___ from university in 2018.",
                "options": ["graduated", "was graduating", "graduates", "has graduated"],
                "answer": 0,
                "explanation": "A specific, completed time marker like 'in 2018' requires Past Simple."
            },
            {
                "q": "What ___ at 9 PM last night?",
                "options": ["did you do", "were you doing", "was you doing", "have you done"],
                "answer": 1,
                "explanation": "Asking about an action in progress at a specific past point in time requires Past Continuous."
            },
            {
                "q": "I ___ my keys while I was running.",
                "options": ["lose", "was losing", "lost", "had lost"],
                "answer": 2,
                "explanation": "Losing keys is a sudden, completed action, which uses Past Simple."
            },
            {
                "q": "The birds ___ when I woke up.",
                "options": ["sang", "sing", "were singing", "are singing"],
                "answer": 2,
                "explanation": "Continuous background action in the past requires Past Continuous."
            }
        ]
    },
    "present_perfect_vs_past_simple": {
        "id": "present_perfect_vs_past_simple",
        "topic": "Present Perfect vs Past Simple",
        "level": 2,
        "levelLabel": "Intermediate",
        "category": "tenses",
        "categoryLabel": "Tenses & Time",
        "categoryEmoji": "⏳",
        "prerequisites": ["present_simple_vs_continuous", "past_simple_vs_continuous"],
        "rule": "Use Present Perfect for experiences, achievements, or actions connected to the present with unspecified time. Use Past Simple for completed actions at a definite time in the past.",
        "explanation": "Present Perfect connects the past with the present (e.g. 'I have lost my keys' implies I still don't have them now). Past Simple refers to an action that is completely over, located in a specific past time frame.",
        "formula": "Present Perfect: Subject + have/has + Past Participle (V3) | Past Simple: Subject + Past Verb (V2)",
        "timeline": {"label_left": "Past", "label_right": "Now", "marker": "Action connecting past to present"},
        "examples": [
            {
                "sentence": "I have visited Paris.",
                "tokens": [
                    {"text": "I", "role": "subject"},
                    {"text": "have", "role": "auxiliary"},
                    {"text": "visited", "role": "verb"},
                    {"text": "Paris", "role": "object"}
                ],
                "translation_hint": "मैंने पेरिस की यात्रा की है। / నేను ప్యారిస్ సందర్శించాను.",
                "note": "Life experience without specifying the exact time."
            },
            {
                "sentence": "I visited Paris last year.",
                "tokens": [
                    {"text": "I", "role": "subject"},
                    {"text": "visited", "role": "verb"},
                    {"text": "Paris", "role": "object"},
                    {"text": "last", "role": "adjective"},
                    {"text": "year", "role": "noun"}
                ],
                "translation_hint": "मैंने पिछले साल पेरिस की यात्रा की थी। / నేను గత సంవత్సరం ప్యారిస్ సందర్శించాను.",
                "note": "Completed action at a specific past time (last year)."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "I have seen that movie yesterday.",
                "right": "I saw that movie yesterday.",
                "explanation": "Do not use Present Perfect with specific past time markers like yesterday, ago, or in 2012."
            },
            {
                "wrong": "I am working here since 2019.",
                "right": "I have been working here since 2019.",
                "explanation": "To describe an action that started in the past and continues to the present, use Present Perfect (or Present Perfect Continuous), not Present Simple."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Signal Words",
                "body": "Present Perfect uses: already, yet, ever, never, since, for, so far. Past Simple uses: yesterday, ago, in 1999, last week."
            }
        ],
        "quiz": [
            {
                "q": "She ___ to London last year.",
                "options": ["has gone", "have gone", "went", "is going"],
                "answer": 2,
                "explanation": "'Last year' is a specific past time marker, which requires Past Simple."
            },
            {
                "q": "They ___ here since 2010.",
                "options": ["lived", "have lived", "are living", "live"],
                "answer": 1,
                "explanation": "'Since 2010' indicates a connection from past to present, requiring Present Perfect."
            },
            {
                "q": "___ you ever eaten sushi?",
                "options": ["Did", "Do", "Have", "Had"],
                "answer": 2,
                "explanation": "'Ever' with life experience questions requires Present Perfect (Have/Has)."
            },
            {
                "q": "I ___ my keys. I can't find them anywhere.",
                "options": ["lost", "have lost", "lose", "am losing"],
                "answer": 1,
                "explanation": "The action of losing keys has direct present consequences (I can't find them), requiring Present Perfect."
            },
            {
                "q": "He ___ in Chicago for five years, but now he lives in Boston.",
                "options": ["has lived", "lived", "lives", "is living"],
                "answer": 1,
                "explanation": "The living in Chicago is fully completed and does not continue to the present, so Past Simple is correct."
            }
        ]
    },
    "past_perfect": {
        "id": "past_perfect",
        "topic": "Past Perfect",
        "level": 2,
        "levelLabel": "Intermediate",
        "category": "tenses",
        "categoryLabel": "Tenses & Time",
        "categoryEmoji": "⏳",
        "prerequisites": ["past_simple_vs_continuous"],
        "rule": "Use the Past Perfect (had + past participle) to describe an action that was completed before another past action occurred.",
        "explanation": "Past Perfect is the 'past of the past'. It makes the order of two past events clear, showing that the older action happened first. The newer past action is described in the Past Simple.",
        "formula": "Subject + had + Past Participle (V3)",
        "timeline": {"label_left": "Past Perfect (1st Action)", "label_right": "Past Simple (2nd Action)", "marker": "Order of past events"},
        "examples": [
            {
                "sentence": "The train had left when I arrived.",
                "tokens": [
                    {"text": "The", "role": "article"},
                    {"text": "train", "role": "subject"},
                    {"text": "had", "role": "auxiliary"},
                    {"text": "left", "role": "verb"},
                    {"text": "when", "role": "conjunction"},
                    {"text": "I", "role": "subject"},
                    {"text": "arrived", "role": "verb"}
                ],
                "translation_hint": "जब मैं पहुँचा तो ट्रेन जा चुकी थी। / నేను చేరుకునే సరికి రైలు వెళ్లిపోయింది.",
                "note": "The train left first (Past Perfect), and then I arrived (Past Simple)."
            },
            {
                "sentence": "She realised she had forgotten her key.",
                "tokens": [
                    {"text": "She", "role": "subject"},
                    {"text": "realised", "role": "verb"},
                    {"text": "she", "role": "subject"},
                    {"text": "had", "role": "auxiliary"},
                    {"text": "forgotten", "role": "verb"},
                    {"text": "her", "role": "pronoun"},
                    {"text": "key", "role": "object"}
                ],
                "translation_hint": "उसे अहसास हुआ कि वह अपनी चाबी भूल गई थी। / తన తాళం చెవి మరచిపోయిందని ఆమె గ్రహించింది.",
                "note": "She forgot the key first, and then she realised it."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "When we got to the cinema, the movie already started.",
                "right": "When we got to the cinema, the movie had already started.",
                "explanation": "Use Past Perfect to show that the movie's starting happened prior to our arrival at the cinema."
            },
            {
                "wrong": "I had visited him yesterday.",
                "right": "I visited him yesterday.",
                "explanation": "Do not use Past Perfect if there is only one past event mentioned. Simply use Past Simple."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Sequence Check",
                "body": "Always use Past Perfect for the earlier of the two past actions, and Past Simple for the later action."
            }
        ],
        "quiz": [
            {
                "q": "By the time the police arrived, the thief ___.",
                "options": ["escaped", "escapes", "had escaped", "was escaping"],
                "answer": 2,
                "explanation": "The thief escaped before the police arrived, so Past Perfect is required."
            },
            {
                "q": "He failed the test because he ___.",
                "options": ["didn't study", "hadn't studied", "hasn't studied", "wasn't studying"],
                "answer": 1,
                "explanation": "The lack of study occurred before the test failure in the past."
            },
            {
                "q": "I was hungry because I ___ anything all day.",
                "options": ["didn't eat", "hadn't eaten", "haven't eaten", "wasn't eating"],
                "answer": 1,
                "explanation": "The period of not eating preceded being hungry in the past."
            },
            {
                "q": "As soon as he ___ his homework, he went to bed.",
                "options": ["finished", "finishes", "had finished", "has finished"],
                "answer": 2,
                "explanation": "Finishing homework happened first, before going to bed."
            },
            {
                "q": "The grass was wet because it ___ all night.",
                "options": ["rained", "has rained", "had rained", "was raining"],
                "answer": 2,
                "explanation": "The rain occurred and ended before the speaker saw the wet grass in the morning."
            }
        ]
    },
    "future_perfect": {
        "id": "future_perfect",
        "topic": "Future Perfect",
        "level": 3,
        "levelLabel": "Advanced",
        "category": "tenses",
        "categoryLabel": "Tenses & Time",
        "categoryEmoji": "⏳",
        "prerequisites": ["present_perfect_vs_past_simple"],
        "rule": "Use the Future Perfect (will have + past participle) to describe an action that will be completed before a specific point of time in the future.",
        "explanation": "The Future Perfect projects us into the future and looks back at an action that will be complete by a certain deadline. It is often accompanied by time markers starting with 'by'.",
        "formula": "Subject + will have + Past Participle (V3)",
        "timeline": {"label_left": "Now", "label_right": "Future Deadline", "marker": "Action completed prior to future point"},
        "examples": [
            {
                "sentence": "I will have finished the report by Friday.",
                "tokens": [
                    {"text": "I", "role": "subject"},
                    {"text": "will", "role": "auxiliary"},
                    {"text": "have", "role": "auxiliary"},
                    {"text": "finished", "role": "verb"},
                    {"text": "the", "role": "article"},
                    {"text": "report", "role": "object"},
                    {"text": "by", "role": "preposition"},
                    {"text": "Friday", "role": "noun"}
                ],
                "translation_hint": "मैं शुक्रवार तक रिपोर्ट पूरी कर चुका हूँगा। / నేను శుక్రవారం నాటికి నివేదికను పూర్తి చేస్తాను.",
                "note": "The finishing of the report happens before Friday."
            },
            {
                "sentence": "They will have lived here for five years next month.",
                "tokens": [
                    {"text": "They", "role": "subject"},
                    {"text": "will", "role": "auxiliary"},
                    {"text": "have", "role": "auxiliary"},
                    {"text": "lived", "role": "verb"},
                    {"text": "here", "role": "adverb"},
                    {"text": "for", "role": "preposition"},
                    {"text": "five", "role": "adjective"},
                    {"text": "years", "role": "noun"},
                    {"text": "next", "role": "adjective"},
                    {"text": "month", "role": "noun"}
                ],
                "translation_hint": "अगले महीने उन्हें यहाँ रहते हुए पाँच साल हो जाएँगे। / వచ్చే నెలకు వారు ఇక్కడ నివసించడం ప్రారంభించి ఐదేళ్లు అవుతుంది.",
                "note": "The five-year mark is completed when next month arrives."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "By the time you will arrive, I will have left.",
                "right": "By the time you arrive, I will have left.",
                "explanation": "Do not use 'will' in time clauses following 'by the time' or 'when'. Use the Present Simple instead."
            },
            {
                "wrong": "I will have finish my work tomorrow.",
                "right": "I will have finished my work tomorrow.",
                "explanation": "Always use the past participle (finished) after 'will have', not the base form."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "The 'By' Clause",
                "body": "Look for phrases like 'by tomorrow', 'by the time', or 'by next year'. They are strong indicators that you need Future Perfect."
            }
        ],
        "quiz": [
            {
                "q": "By next year, she ___ from college.",
                "options": ["will graduate", "will have graduated", "graduated", "is graduating"],
                "answer": 1,
                "explanation": "Graduation will be a completed action before next year, requiring Future Perfect."
            },
            {
                "q": "I ___ the report by the time my boss asks for it.",
                "options": ["will finish", "will have finished", "finished", "have finished"],
                "answer": 1,
                "explanation": "Completion of the report is expected before the boss's future action."
            },
            {
                "q": "By 2030, technology ___ significantly.",
                "options": ["will change", "changes", "will have changed", "is changing"],
                "answer": 2,
                "explanation": "A completed future change by a specific year requires Future Perfect."
            },
            {
                "q": "___ you ___ your homework by 8 PM?",
                "options": ["Will / write", "Will / have written", "Do / write", "Have / written"],
                "answer": 1,
                "explanation": "Asking about completion of a task before a future time point (8 PM)."
            },
            {
                "q": "At this rate, we ___ our destination by sunset.",
                "options": ["won't reach", "won't have reached", "don't reach", "haven't reached"],
                "answer": 1,
                "explanation": "Focuses on the state of completion before sunset in the future."
            }
        ]
    },
    "mixed_tenses": {
        "id": "mixed_tenses",
        "topic": "Mixed Tenses in Context",
        "level": 3,
        "levelLabel": "Advanced",
        "category": "tenses",
        "categoryLabel": "Tenses & Time",
        "categoryEmoji": "⏳",
        "prerequisites": ["present_perfect_vs_past_simple", "past_perfect"],
        "rule": "Mixed tenses involve shifting between past, present, and future forms in a single context to establish logical sequences, conditions, or temporal relationships.",
        "explanation": "Fluent English speakers naturally combine different tenses in speech to show contrast or cause-and-effect. This requires understanding how time markers dictate the correct verb forms.",
        "formula": "Varied syntax depending on logic (e.g. Present Perfect + since + Past Simple)",
        "timeline": {"label_left": "Past", "label_right": "Future", "marker": "Linking multiple timeframes logically"},
        "examples": [
            {
                "sentence": "Although he had worked hard, he is still struggling now.",
                "tokens": [
                    {"text": "Although", "role": "conjunction"},
                    {"text": "he", "role": "subject"},
                    {"text": "had", "role": "auxiliary"},
                    {"text": "worked", "role": "verb"},
                    {"text": "hard", "role": "adverb"},
                    {"text": "he", "role": "subject"},
                    {"text": "is", "role": "auxiliary"},
                    {"text": "still", "role": "adverb"},
                    {"text": "struggling", "role": "verb"},
                    {"text": "now", "role": "adverb"}
                ],
                "translation_hint": "हालांकि उसने कड़ी मेहनत की थी, फिर भी वह अब संघर्ष कर रहा है। / అతను కష్టపడి పనిచేసినప్పటికీ, అతను ఇప్పటికీ ఇబ్బంది పడుతున్నాడు.",
                "note": "Contrasts a past perfect background action with a present continuous state."
            },
            {
                "sentence": "By the time she arrives, I will have finished what I started.",
                "tokens": [
                    {"text": "By the time", "role": "conjunction"},
                    {"text": "she", "role": "subject"},
                    {"text": "arrives", "role": "verb"},
                    {"text": "I", "role": "subject"},
                    {"text": "will", "role": "auxiliary"},
                    {"text": "have", "role": "auxiliary"},
                    {"text": "finished", "role": "verb"},
                    {"text": "what", "role": "pronoun"},
                    {"text": "I", "role": "subject"},
                    {"text": "started", "role": "verb"}
                ],
                "translation_hint": "जब तक वह आएगी, मैं वह पूरा कर चुका हूँगा जो मैंने शुरू किया था। / ఆమె వచ్చేసరికి, నేను ప్రారంభించిన దానిని పూర్తి చేస్తాను.",
                "note": "A complex sentence using present simple, future perfect, and past simple."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "I have been working here since I have graduated.",
                "right": "I have been working here since I graduated.",
                "explanation": "Use Past Simple after 'since' when referencing a specific starting point in the past."
            },
            {
                "wrong": "If I will see him, I tell him.",
                "right": "If I see him, I will tell him.",
                "explanation": "In conditional clauses, use the present tense for future meaning, not 'will'."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Anchor Time",
                "body": "Identify the main time frame of your sentence (past, present, or future) and verify that all other tenses fit logically around that anchor."
            }
        ],
        "quiz": [
            {
                "q": "Since he ___ his job, he has been much happier.",
                "options": ["quitted", "quit", "has quit", "quits"],
                "answer": 1,
                "explanation": "'Since' followed by a starting point in the past requires Past Simple (quit is the past form of quit)."
            },
            {
                "q": "I ___ English for five years before I moved to London.",
                "options": ["have studied", "had studied", "had been studying", "studied"],
                "answer": 2,
                "explanation": "Ongoing past action completed before another past action uses Past Perfect Continuous."
            },
            {
                "q": "By this time tomorrow, they ___ to Paris.",
                "options": ["will fly", "will be flying", "will have flown", "fly"],
                "answer": 2,
                "explanation": "Future Perfect expresses completion of travel by a certain future time."
            },
            {
                "q": "I'll call you when I ___.",
                "options": ["will arrive", "arrive", "am arriving", "have arrived"],
                "answer": 1,
                "explanation": "Time clauses referring to the future use the Present Simple."
            },
            {
                "q": "He ___ here for ten years, and he has no plans to leave.",
                "options": ["worked", "has been working", "had worked", "works"],
                "answer": 1,
                "explanation": "Present Perfect Continuous is used for an action that started in the past and continues in the present."
            }
        ]
    },
    "future_perfect_continuous": {
        "id": "future_perfect_continuous",
        "topic": "Future Perfect Continuous",
        "level": 4,
        "levelLabel": "Pro",
        "category": "tenses",
        "categoryLabel": "Tenses & Time",
        "categoryEmoji": "⏳",
        "prerequisites": ["future_perfect"],
        "rule": "Use the Future Perfect Continuous (will have been + verb-ing) to project into the future and look back at the duration of an ongoing action.",
        "explanation": "This tense emphasizes the duration of an activity leading up to a specific deadline in the future. It is usually combined with 'for' to specify the length of time.",
        "formula": "Subject + will have been + Verb-ing",
        "timeline": {"label_left": "Ongoing Action Start", "label_right": "Future Time Point", "marker": "Duration of ongoing action up to future point"},
        "examples": [
            {
                "sentence": "By next year, I will have been working here for a decade.",
                "tokens": [
                    {"text": "By", "role": "preposition"},
                    {"text": "next", "role": "adjective"},
                    {"text": "year", "role": "noun"},
                    {"text": "I", "role": "subject"},
                    {"text": "will", "role": "auxiliary"},
                    {"text": "have", "role": "auxiliary"},
                    {"text": "been", "role": "auxiliary"},
                    {"text": "working", "role": "verb"},
                    {"text": "here", "role": "adverb"},
                    {"text": "for", "role": "preposition"},
                    {"text": "a", "role": "article"},
                    {"text": "decade", "role": "noun"}
                ],
                "translation_hint": "अगले साल तक, मुझे यहाँ काम करते हुए एक दशक हो जाएगा। / వచ్చే సంవత్సరానికి, నేను ఇక్కడ పనిచేయడం ప్రారంభించి పదేళ్లు అవుతుంది.",
                "note": "Emphasizes the continuous duration of employment up to next year."
            },
            {
                "sentence": "They will have been travelling for hours by the time they arrive.",
                "tokens": [
                    {"text": "They", "role": "subject"},
                    {"text": "will", "role": "auxiliary"},
                    {"text": "have", "role": "auxiliary"},
                    {"text": "been", "role": "auxiliary"},
                    {"text": "travelling", "role": "verb"},
                    {"text": "for", "role": "preposition"},
                    {"text": "hours", "role": "noun"},
                    {"text": "by the time", "role": "conjunction"},
                    {"text": "they", "role": "subject"},
                    {"text": "arrive", "role": "verb"}
                ],
                "translation_hint": "जब तक वे पहुँचेंगे, वे घंटों से यात्रा कर रहे होंगे। / వారు చేరుకునే సరికి వారు గంటల తరబడి ప్రయాణిస్తూనే ఉంటారు.",
                "note": "Represents travel that will be ongoing and continuous prior to their arrival."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "Next month I will have been knowing her for five years.",
                "right": "Next month I will have known her for five years.",
                "explanation": "'Know' is a stative verb and cannot be used in continuous tenses. Use Future Perfect instead."
            },
            {
                "wrong": "By noon, he will have working for six hours.",
                "right": "By noon, he will have been working for six hours.",
                "explanation": "Do not omit 'been' in the Future Perfect Continuous structure."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Continuous vs. Simple",
                "body": "Use the continuous form to emphasize duration (will have been studying), but use the simple form when describing a state or quantity (will have read three books)."
            }
        ],
        "quiz": [
            {
                "q": "By 5 PM, we ___ for three hours.",
                "options": ["will wait", "will have waited", "will have been waiting", "are waiting"],
                "answer": 2,
                "explanation": "Emphasizes the duration of the waiting action up to a future point."
            },
            {
                "q": "In December, they ___ in this city for twenty years.",
                "options": ["will have been living", "will live", "will have lived", "live"],
                "answer": 0,
                "explanation": "Future Perfect Continuous is preferred here to emphasize ongoing residence."
            },
            {
                "q": "By the time he retires, he ___ for forty years.",
                "options": ["will have been teaching", "will teach", "has been teaching", "will have taught"],
                "answer": 0,
                "explanation": "Focuses on the continuous activity of teaching leading up to retirement."
            },
            {
                "q": "By tomorrow, she ___ on this project for a month.",
                "options": ["will have been working", "will have worked", "works", "is working"],
                "answer": 0,
                "explanation": "Highlights the duration of a task up to a specific deadline."
            },
            {
                "q": "At midnight, I ___ for five hours.",
                "options": ["will have been sleeping", "will sleep", "will have slept", "am sleeping"],
                "answer": 0,
                "explanation": "Duration of sleep up to a future time point (midnight)."
            }
        ]
    },
    "narrative_tenses": {
        "id": "narrative_tenses",
        "topic": "Narrative Tenses",
        "level": 4,
        "levelLabel": "Pro",
        "category": "tenses",
        "categoryLabel": "Tenses & Time",
        "categoryEmoji": "⏳",
        "prerequisites": ["mixed_tenses"],
        "rule": "Narrative tenses combine Past Simple (main events), Past Continuous (background/states), and Past Perfect (earlier past events) to tell stories.",
        "explanation": "Using narrative tenses allows the speaker to set the scene, outline consecutive actions, and reference events that occurred prior to the main narrative timeline.",
        "formula": "Sequence: Past Continuous (setting) + Past Simple (interruption) + Past Perfect (pre-event)",
        "timeline": {"label_left": "Past Perfect (earliest)", "label_right": "Past Simple (main action)", "marker": "Layered past timeline"},
        "examples": [
            {
                "sentence": "The rain was falling when they left the house they had bought.",
                "tokens": [
                    {"text": "The", "role": "article"},
                    {"text": "rain", "role": "subject"},
                    {"text": "was", "role": "auxiliary"},
                    {"text": "falling", "role": "verb"},
                    {"text": "when", "role": "conjunction"},
                    {"text": "they", "role": "subject"},
                    {"text": "left", "role": "verb"},
                    {"text": "the", "role": "article"},
                    {"text": "house", "role": "object"},
                    {"text": "they", "role": "subject"},
                    {"text": "had", "role": "auxiliary"},
                    {"text": "bought", "role": "verb"}
                ],
                "translation_hint": "जब वे उस घर से निकले जिसे उन्होंने खरीदा था, तब बारिश हो रही थी। / వారు కొనుగోలు చేసిన ఇల్లు వదిలి వెళ్ళినప్పుడు వర్షం పడుతోంది.",
                "note": "Combines Past Continuous (was falling), Past Simple (left), and Past Perfect (had bought)."
            },
            {
                "sentence": "He walked into the office and realised he had lost the file.",
                "tokens": [
                    {"text": "He", "role": "subject"},
                    {"text": "walked", "role": "verb"},
                    {"text": "into", "role": "preposition"},
                    {"text": "the", "role": "article"},
                    {"text": "office", "role": "noun"},
                    {"text": "and", "role": "conjunction"},
                    {"text": "realised", "role": "verb"},
                    {"text": "he", "role": "subject"},
                    {"text": "had", "role": "auxiliary"},
                    {"text": "lost", "role": "verb"},
                    {"text": "the", "role": "article"},
                    {"text": "file", "role": "object"}
                ],
                "translation_hint": "उसने कार्यालय में कदम रखा और महसूस किया कि उसने फ़ाइल खो दी थी। / అతను కార్యాలయంలోకి నడిచి వెళ్లి తన ఫైల్ పోగొట్టుకున్నాడని గ్రహించాడు.",
                "note": "Past Simple actions are interrupted by realizing something that had happened earlier (Past Perfect)."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "Yesterday I walked home. I was cooking dinner and went to bed.",
                "right": "Yesterday I walked home, cooked dinner, and went to bed.",
                "explanation": "Use Past Simple for consecutive actions in a story. Past Continuous makes them sound like background details."
            },
            {
                "wrong": "She was sad because she lost her purse.",
                "right": "She was sad because she had lost her purse.",
                "explanation": "Use Past Perfect to explain the cause of a past emotional state if the cause occurred before it."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Storytelling Flow",
                "body": "Use Past Simple to push the story forward. Use Past Continuous to pause and describe the surroundings or ongoing activities."
            }
        ],
        "quiz": [
            {
                "q": "He ___ in a cafe when he saw the accident.",
                "options": ["sat", "was sitting", "had sat", "is sitting"],
                "answer": 1,
                "explanation": "Past Continuous describes the background action in progress when a sudden event occurred."
            },
            {
                "q": "We couldn't open the door because we ___ our keys.",
                "options": ["forgot", "were forgetting", "had forgotten", "have forgotten"],
                "answer": 2,
                "explanation": "Forgetting keys happened prior to not being able to open the door, requiring Past Perfect."
            },
            {
                "q": "She walked into the room, ___ at me, and sat down.",
                "options": ["smiled", "was smiling", "had smiled", "smiles"],
                "answer": 0,
                "explanation": "Part of a sequence of completed past actions in a narrative, using Past Simple."
            },
            {
                "q": "While the crowd ___ , the runner crossed the finish line.",
                "options": ["cheered", "was cheering", "had cheered", "cheers"],
                "answer": 1,
                "explanation": "Ongoing background action in progress while a main action occurred."
            },
            {
                "q": "The ground was wet because it ___ all night.",
                "options": ["rained", "had rained", "was raining", "has rained"],
                "answer": 1,
                "explanation": "The rain occurred and ended before the morning time frame of the story."
            }
        ]
    },
    # ── Category 2: Sentence Structure ────────────────────────────────────
    "svo_order": {
        "id": "svo_order",
        "topic": "Subject-Verb-Object Order",
        "level": 1,
        "levelLabel": "Foundation",
        "category": "structure",
        "categoryLabel": "Sentence Structure",
        "categoryEmoji": "🧩",
        "prerequisites": [],
        "rule": "English sentences generally follow a strict Subject-Verb-Object (SVO) order. Place modifying elements like adjectives before nouns, and place adverbs based on their type.",
        "explanation": "Understanding SVO word order is crucial for building grammatically sound English sentences. Any deviation from this pattern can confuse native speakers and disrupt the logical flow of information.",
        "formula": "Subject + Verb + Object",
        "timeline": {"label_left": "Agent", "label_right": "Recipient", "marker": "Action flows from Subject to Object"},
        "examples": [
            {
                "sentence": "The manager approved the request.",
                "tokens": [
                    {"text": "The", "role": "article"},
                    {"text": "manager", "role": "subject"},
                    {"text": "approved", "role": "verb"},
                    {"text": "the", "role": "article"},
                    {"text": "request", "role": "object"}
                ],
                "translation_hint": "प्रबंधक ने अनुरोध को मंजूरी दे दी। / మేనేజర్ అభ్యర్థనను ఆమోదించారు.",
                "note": "A clear SVO structure with simple articles."
            },
            {
                "sentence": "They built a new office.",
                "tokens": [
                    {"text": "They", "role": "subject"},
                    {"text": "built", "role": "verb"},
                    {"text": "a", "role": "article"},
                    {"text": "new", "role": "adjective"},
                    {"text": "office", "role": "object"}
                ],
                "translation_hint": "उन्होंने एक नया कार्यालय बनाया। / వారు ఒక కొత్త కార్యాలయాన్ని నిర్మించారు.",
                "note": "Adjective (new) goes before the noun (office)."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "The request approved the manager.",
                "right": "The manager approved the request.",
                "explanation": "Subject and Object positions cannot be swapped without changing the meaning of the active verb."
            },
            {
                "wrong": "She bought a table wooden.",
                "right": "She bought a wooden table.",
                "explanation": "Adjectives must be placed before the noun they modify in English."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Adverb Placement",
                "body": "Adverbs of frequency (always, often) typically go before the main verb, but after the verb 'to be'."
            }
        ],
        "quiz": [
            {
                "q": "Identify the correct word order:",
                "options": ["A cake baked she.", "She baked a cake.", "Baked she a cake.", "A cake she baked."],
                "answer": 1,
                "explanation": "SVO order requires: Subject (She) + Verb (baked) + Object (a cake)."
            },
            {
                "q": "Choose the correct sentence:",
                "options": ["I read usually books.", "I usually read books.", "Usually I books read.", "I read books usually."],
                "answer": 1,
                "explanation": "Adverbs of frequency are placed directly before the main verb."
            },
            {
                "q": "Complete: 'They ___ .'",
                "options": ["bought a car new", "bought a new car", "a new car bought", "new car bought"],
                "answer": 1,
                "explanation": "The adjective 'new' must precede the object noun 'car'."
            },
            {
                "q": "Which sentence follows SVO rules?",
                "options": ["The dog chased the cat.", "Chased the dog the cat.", "The cat the dog chased.", "The dog the cat chased."],
                "answer": 0,
                "explanation": "SVO order: Subject (The dog) + Verb (chased) + Object (the cat)."
            },
            {
                "q": "Correct: 'She loves very much music.'",
                "options": ["She music loves very much.", "She loves music very much.", "Very much she loves music.", "She very much music loves."],
                "answer": 1,
                "explanation": "Do not separate the verb (loves) from its direct object (music) with an adverb phrase (very much)."
            }
        ]
    },
    "there_is_are": {
        "id": "there_is_are",
        "topic": "There is / There are",
        "level": 1,
        "levelLabel": "Foundation",
        "category": "structure",
        "categoryLabel": "Sentence Structure",
        "categoryEmoji": "🧩",
        "prerequisites": [],
        "rule": "Use 'There is' for singular nouns and uncountable nouns. Use 'There are' for plural nouns.",
        "explanation": "We use 'there is/are' to state that something exists. In these constructions, 'there' acts as a dummy subject, and the real subject is the noun that follows the verb.",
        "formula": "There is + Singular/Uncountable Noun | There are + Plural Noun",
        "timeline": {"label_left": "Non-existence", "label_right": "Existence", "marker": "Stating existence of items"},
        "examples": [
            {
                "sentence": "There is a meeting at noon.",
                "tokens": [
                    {"text": "There", "role": "pronoun"},
                    {"text": "is", "role": "verb"},
                    {"text": "a", "role": "article"},
                    {"text": "meeting", "role": "subject"},
                    {"text": "at", "role": "preposition"},
                    {"text": "noon", "role": "noun"}
                ],
                "translation_hint": "दोपहर में एक बैठक है। / మధ్యాహ్నం ఒక సమావేశం ఉంది.",
                "note": "Singular noun (meeting) uses 'There is'."
            },
            {
                "sentence": "There are many options available.",
                "tokens": [
                    {"text": "There", "role": "pronoun"},
                    {"text": "are", "role": "verb"},
                    {"text": "many", "role": "adjective"},
                    {"text": "options", "role": "subject"},
                    {"text": "available", "role": "adjective"}
                ],
                "translation_hint": "कई विकल्प उपलब्ध हैं। / అనేక ఎంపికలు అందుబాటులో ఉన్నాయి.",
                "note": "Plural noun (options) uses 'There are'."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "There is many people in the hall.",
                "right": "There are many people in the hall.",
                "explanation": "Use 'there are' with plural subjects like 'people'."
            },
            {
                "wrong": "There are some water in the glass.",
                "right": "There is some water in the glass.",
                "explanation": "'Water' is uncountable and requires a singular verb."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Contracted Forms",
                "body": "In informal English, 'There's' is common for singular nouns, but avoid using 'There're' in formal writing."
            }
        ],
        "quiz": [
            {
                "q": "___ a computer on the desk.",
                "options": ["There are", "There is", "They are", "There was been"],
                "answer": 1,
                "explanation": "'a computer' is a singular noun, so 'There is' is correct."
            },
            {
                "q": "___ some milk left in the fridge.",
                "options": ["There are", "There is", "Their is", "They are"],
                "answer": 1,
                "explanation": "'Milk' is an uncountable noun and takes the singular 'There is'."
            },
            {
                "q": "___ ten students in the classroom.",
                "options": ["There is", "There are", "Their is", "They are"],
                "answer": 1,
                "explanation": "'ten students' is plural, requiring 'There are'."
            },
            {
                "q": "___ any questions?",
                "options": ["Is there", "Are there", "There are", "There is"],
                "answer": 1,
                "explanation": "In a question with plural noun 'questions', use the inverted plural form 'Are there'."
            },
            {
                "q": "___ a lot of noise outside.",
                "options": ["There is", "There are", "They are", "Is there"],
                "answer": 0,
                "explanation": "'Noise' is uncountable, so 'There is' is correct."
            }
        ]
    },
    "passive_voice": {
        "id": "passive_voice",
        "topic": "Passive Voice",
        "level": 2,
        "levelLabel": "Intermediate",
        "category": "structure",
        "categoryLabel": "Sentence Structure",
        "categoryEmoji": "🧩",
        "prerequisites": ["svo_order"],
        "rule": "Use the passive voice (be + past participle) to focus on the action or the receiver of the action, especially when the doer is unknown or unimportant.",
        "explanation": "In active voice, the subject performs the action. In passive voice, the subject receives the action. This is common in news reporting, scientific writing, and formal business communication.",
        "formula": "Object (as Subject) + auxiliary verb 'to be' + Past Participle (V3)",
        "timeline": {"label_left": "Agent performs action", "label_right": "Receiver gets action", "marker": "Shift focus to the object"},
        "examples": [
            {
                "sentence": "The contract was signed by the CEO.",
                "tokens": [
                    {"text": "The", "role": "article"},
                    {"text": "contract", "role": "subject"},
                    {"text": "was", "role": "auxiliary"},
                    {"text": "signed", "role": "verb"},
                    {"text": "by", "role": "preposition"},
                    {"text": "the", "role": "article"},
                    {"text": "CEO", "role": "complement"}
                ],
                "translation_hint": "अनुबंध पर सीईओ द्वारा हस्ताक्षर किए गए थे। / ఒప్పందంపై సీఈఓ సంతకం చేశారు.",
                "note": "Past passive shows that the contract received the action of signing."
            },
            {
                "sentence": "The email has been sent.",
                "tokens": [
                    {"text": "The", "role": "article"},
                    {"text": "email", "role": "subject"},
                    {"text": "has", "role": "auxiliary"},
                    {"text": "been", "role": "auxiliary"},
                    {"text": "sent", "role": "verb"}
                ],
                "translation_hint": "ईमेल भेज दिया गया है। / ఈమెయిల్ పంపబడింది.",
                "note": "Present Perfect Passive; the doer is not mentioned because they are irrelevant."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "The report was wrote yesterday.",
                "right": "The report was written yesterday.",
                "explanation": "Always use the past participle (written) in passive constructions, not the past simple (wrote)."
            },
            {
                "wrong": "The accident was happened last night.",
                "right": "The accident happened last night.",
                "explanation": "Intransitive verbs like 'happen', 'arrive', and 'die' cannot be used in the passive voice."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Use of 'By'",
                "body": "Only include 'by + agent' at the end of a passive sentence if the person who did the action is important to know."
            }
        ],
        "quiz": [
            {
                "q": "Convert to passive: 'The chef prepared the meal.'",
                "options": ["The meal is prepared by the chef.", "The meal was prepared by the chef.", "The meal preparing by the chef.", "The meal has prepared by the chef."],
                "answer": 1,
                "explanation": "The active sentence is in Past Simple, so the passive needs 'was/were + past participle'."
            },
            {
                "q": "Which sentence is in the passive voice?",
                "options": ["She writes the report.", "The report is written by her.", "She has written the report.", "She is writing the report."],
                "answer": 1,
                "explanation": "Uses 'is' (form of to be) + 'written' (past participle), focusing on the report."
            },
            {
                "q": "English ___ in many countries.",
                "options": ["speaks", "is speaking", "is spoken", "has spoken"],
                "answer": 2,
                "explanation": "The subject 'English' receives the action, requiring present passive 'is spoken'."
            },
            {
                "q": "The house ___ next month.",
                "options": ["will be built", "is building", "will build", "will have built"],
                "answer": 0,
                "explanation": "Future action in passive voice requires 'will be + past participle'."
            },
            {
                "q": "A decision ___ yet.",
                "options": ["hasn't made", "wasn't made", "hasn't been made", "doesn't make"],
                "answer": 2,
                "explanation": "Present Perfect Passive is used with 'yet' for an incomplete action."
            }
        ]
    },
    "question_tags": {
        "id": "question_tags",
        "topic": "Question Tags",
        "level": 2,
        "levelLabel": "Intermediate",
        "category": "structure",
        "categoryLabel": "Sentence Structure",
        "categoryEmoji": "🧩",
        "prerequisites": ["svo_order"],
        "rule": "Question tags are short questions added to the end of sentences. Use a negative tag for a positive statement, and a positive tag for a negative statement.",
        "explanation": "We use question tags to ask for confirmation or agreement. They use the auxiliary verb from the main statement and matching pronoun. If there is no auxiliary, use 'do/does/did'.",
        "formula": "Statement + , + opposite auxiliary + pronoun?",
        "timeline": {"label_left": "Assertion", "label_right": "Confirmation", "marker": "Checking agreement at the end"},
        "examples": [
            {
                "sentence": "You speak English, don't you?",
                "tokens": [
                    {"text": "You", "role": "subject"},
                    {"text": "speak", "role": "verb"},
                    {"text": "English", "role": "object"},
                    {"text": ",", "role": "preposition"},
                    {"text": "don't", "role": "auxiliary"},
                    {"text": "you", "role": "pronoun"}
                ],
                "translation_hint": "आप अंग्रेजी बोलते हैं, है ना? / మీరు ఇంగ్లీష్ మాట్లాడతారు, అవునా?",
                "note": "Positive statement in present simple uses a negative 'don't' tag."
            },
            {
                "sentence": "She isn't coming, is she?",
                "tokens": [
                    {"text": "She", "role": "subject"},
                    {"text": "isn't", "role": "auxiliary"},
                    {"text": "coming", "role": "verb"},
                    {"text": ",", "role": "preposition"},
                    {"text": "is", "role": "auxiliary"},
                    {"text": "she", "role": "pronoun"}
                ],
                "translation_hint": "वह नहीं आ रही है, है ना? / ఆమె రావడం లేదు, అవునా?",
                "note": "Negative statement uses a positive question tag."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "He is a doctor, isn't he is?",
                "right": "He is a doctor, isn't he?",
                "explanation": "A question tag must consist only of the auxiliary verb (or form of 'do') and the subject pronoun."
            },
            {
                "wrong": "She likes tea, doesn't she like?",
                "right": "She likes tea, doesn't she?",
                "explanation": "Do not repeat the main verb in the question tag."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Special Cases",
                "body": "For statements with 'I am', the tag is 'aren't I?' (e.g. I am late, aren't I?). For imperatives, 'will you?' is used."
            }
        ],
        "quiz": [
            {
                "q": "You will help me, ___?",
                "options": ["will you", "won't you", "don't you", "aren't you"],
                "answer": 1,
                "explanation": "A positive statement with 'will' requires the negative tag 'won't you'."
            },
            {
                "q": "They haven't arrived yet, ___?",
                "options": ["have they", "haven't they", "did they", "do they"],
                "answer": 0,
                "explanation": "A negative statement with 'haven't' requires the positive tag 'have they'."
            },
            {
                "q": "He went to the party, ___?",
                "options": ["didn't he", "did he", "wasn't he", "doesn't he"],
                "answer": 0,
                "explanation": "The statement is in Past Simple with no auxiliary, so we use 'didn't' for the negative tag."
            },
            {
                "q": "I am right, ___?",
                "options": ["am not I", "aren't I", "don't I", "isn't I"],
                "answer": 1,
                "explanation": "The standard question tag for 'I am' is 'aren't I'."
            },
            {
                "q": "Let's go for a walk, ___?",
                "options": ["will we", "shall we", "won't we", "do we"],
                "answer": 1,
                "explanation": "Suggestions starting with 'Let's' take the question tag 'shall we'."
            }
        ]
    },
    "relative_clauses": {
        "id": "relative_clauses",
        "topic": "Relative Clauses",
        "level": 3,
        "levelLabel": "Advanced",
        "category": "structure",
        "categoryLabel": "Sentence Structure",
        "categoryEmoji": "🧩",
        "prerequisites": ["passive_voice"],
        "rule": "Relative clauses give extra information about a noun using relative pronouns (who, which, that, whose). Defining clauses are essential for identifying the noun; non-defining clauses add extra, non-essential detail.",
        "explanation": "Relative clauses connect sentences. Defining clauses do not use commas (e.g., 'The man who called...'). Non-defining clauses are separated by commas and cannot use 'that' (e.g., 'My car, which was expensive, broke down').",
        "formula": "Noun + relative pronoun (who/which/that/whose) + clause",
        "timeline": {"label_left": "Noun", "label_right": "Clarification", "marker": "Adding descriptive details to noun"},
        "examples": [
            {
                "sentence": "The designer who created the logo won an award.",
                "tokens": [
                    {"text": "The", "role": "article"},
                    {"text": "designer", "role": "subject"},
                    {"text": "who", "role": "pronoun"},
                    {"text": "created", "role": "verb"},
                    {"text": "the", "role": "article"},
                    {"text": "logo", "role": "object"},
                    {"text": "won", "role": "verb"},
                    {"text": "an", "role": "article"},
                    {"text": "award", "role": "object"}
                ],
                "translation_hint": "जिस डिजाइनर ने लोगो बनाया उसने एक पुरस्कार जीता। / లోగోను సృష్టించిన డిజైనర్ అవార్డును గెలుచుకున్నారు.",
                "note": "Defining relative clause (who created the logo) identifies the specific designer."
            },
            {
                "sentence": "My laptop, which is new, is very slow.",
                "tokens": [
                    {"text": "My", "role": "pronoun"},
                    {"text": "laptop", "role": "subject"},
                    {"text": ",", "role": "preposition"},
                    {"text": "which", "role": "pronoun"},
                    {"text": "is", "role": "verb"},
                    {"text": "new", "role": "adjective"},
                    {"text": ",", "role": "preposition"},
                    {"text": "is", "role": "verb"},
                    {"text": "very", "role": "adverb"},
                    {"text": "slow", "role": "adjective"}
                ],
                "translation_hint": "मेरा लैपटॉप, जो नया है, बहुत धीमा है। / నా ల్యాప్‌టాప్, ఇది కొత్తది, చాలా నెమ్మదిగా ఉంది.",
                "note": "Non-defining relative clause enclosed in commas adds non-essential information."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "The car that I bought it is red.",
                "right": "The car that I bought is red.",
                "explanation": "Do not repeat the object pronoun (it) inside the relative clause when it is already represented by 'that' or 'which'."
            },
            {
                "wrong": "My brother, that lives in Rome, is coming to visit.",
                "right": "My brother, who lives in Rome, is coming to visit.",
                "explanation": "You cannot use the relative pronoun 'that' in non-defining relative clauses. Use 'who' for people and 'which' for things."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Omitting Pronouns",
                "body": "In defining relative clauses, you can omit the pronoun (who/which/that) if it is the object of the clause (e.g. The book [that] I read)."
            }
        ],
        "quiz": [
            {
                "q": "The book ___ I borrowed yesterday is fascinating.",
                "options": ["who", "which", "whose", "whom"],
                "answer": 1,
                "explanation": "'Which' (or 'that') is used to refer to inanimate objects (the book)."
            },
            {
                "q": "That is the teacher ___ daughter won the competition.",
                "options": ["who", "whom", "whose", "which"],
                "answer": 2,
                "explanation": "'Whose' is the possessive relative pronoun used for both people and objects."
            },
            {
                "q": "My uncle, ___ lives in Canada, is a lawyer.",
                "options": ["which", "who", "that", "whom"],
                "answer": 1,
                "explanation": "Non-defining relative clauses describing a person require 'who' and commas."
            },
            {
                "q": "The restaurant ___ we had dinner was wonderful.",
                "options": ["where", "which", "that", "whose"],
                "answer": 0,
                "explanation": "We use 'where' to refer to a place in a relative clause."
            },
            {
                "q": "Which sentence is incorrect?",
                "options": [
                    "The man I spoke to was helpful.",
                    "The man to who I spoke was helpful.",
                    "The man to whom I spoke was helpful.",
                    "The man who I spoke to was helpful."
                ],
                "answer": 1,
                "explanation": "'Who' cannot immediately follow a preposition; it must be 'whom'."
            }
        ]
    },
    "cleft_sentences": {
        "id": "cleft_sentences",
        "topic": "Cleft Sentences",
        "level": 3,
        "levelLabel": "Advanced",
        "category": "structure",
        "categoryLabel": "Sentence Structure",
        "categoryEmoji": "🧩",
        "prerequisites": ["relative_clauses"],
        "rule": "Cleft sentences divide a simple sentence into two parts to highlight a specific element. 'It-clefts' use 'It is/was... that/who'. 'Wh-clefts' use 'What... is/was...'.",
        "explanation": "Clefting acts like verbal bolding. It isolates the most important part of the message to draw the listener's focus. For example, 'It was John who ate the cake' emphasizes that John (and not someone else) did it.",
        "formula": "It + is/was + [Emphasised Element] + that/who + [Rest of Clause]",
        "timeline": {"label_left": "Standard structure", "label_right": "Divided structure", "marker": "Splitting the sentence for focus"},
        "examples": [
            {
                "sentence": "It was John who broke the window.",
                "tokens": [
                    {"text": "It", "role": "pronoun"},
                    {"text": "was", "role": "verb"},
                    {"text": "John", "role": "noun"},
                    {"text": "who", "role": "pronoun"},
                    {"text": "broke", "role": "verb"},
                    {"text": "the", "role": "article"},
                    {"text": "window", "role": "object"}
                ],
                "translation_hint": "वह जॉन ही था जिसने खिड़की तोड़ी। / కిటికీ పగలగొట్టింది జాన్.",
                "note": "It-cleft structures emphasize the subject 'John'."
            },
            {
                "sentence": "What we need is more time.",
                "tokens": [
                    {"text": "What", "role": "pronoun"},
                    {"text": "we", "role": "subject"},
                    {"text": "need", "role": "verb"},
                    {"text": "is", "role": "verb"},
                    {"text": "more", "role": "adjective"},
                    {"text": "time", "role": "noun"}
                ],
                "translation_hint": "हमें जिसकी ज़रूरत है वह और समय है। / మనకు కావలసింది మరింత సమయం.",
                "note": "Wh-cleft structures focus on the object 'more time'."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "The cake was it that she liked.",
                "right": "It was the cake that she liked.",
                "explanation": "It-cleft sentences must start with 'It' followed by the verb 'to be'."
            },
            {
                "wrong": "What I want to do is buying a car.",
                "right": "What I want to do is buy a car.",
                "explanation": "In Wh-clefts involving action verbs, the verb in the focus clause should be in the bare infinitive form."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Checking Clefts",
                "body": "If you collapse a cleft sentence back into a single clause (e.g. John broke the window), and it is grammatically correct, your cleft is structured properly."
            }
        ],
        "quiz": [
            {
                "q": "Create a cleft sentence for: 'I love her attitude.'",
                "options": [
                    "What I love is her attitude.",
                    "It is her attitude what I love.",
                    "Her attitude is it that I love.",
                    "It was her attitude that I love."
                ],
                "answer": 0,
                "explanation": "A Wh-cleft uses 'What I love + is + her attitude'."
            },
            {
                "q": "Complete: 'It was yesterday ___ they arrived.'",
                "options": ["when", "who", "that", "which"],
                "answer": 2,
                "explanation": "'It' clefts use 'that' as the linker for temporal modifiers (yesterday)."
            },
            {
                "q": "Which is a correct Wh-cleft?",
                "options": [
                    "What she did was calling the police.",
                    "What she did was call the police.",
                    "It was the police she did call.",
                    "Call the police she did."
                ],
                "answer": 1,
                "explanation": "The action verb after 'What she did was' should be a bare infinitive (call)."
            },
            {
                "q": "Cleft sentences are primarily used to ___.",
                "options": ["make writing shorter", "emphasise a specific part of a sentence", "link multiple paragraphs", "express polite requests"],
                "answer": 1,
                "explanation": "The main pragmatic function of cleft sentences is to introduce contrastive or focus emphasis."
            },
            {
                "q": "___ was their courage that saved the day.",
                "options": ["It", "There", "What", "This"],
                "answer": 0,
                "explanation": "The structure is an It-cleft, beginning with the pronoun 'It'."
            }
        ]
    },
    "inversion": {
        "id": "inversion",
        "topic": "Inversion for Emphasis",
        "level": 4,
        "levelLabel": "Pro",
        "category": "structure",
        "categoryLabel": "Sentence Structure",
        "categoryEmoji": "🧩",
        "prerequisites": ["cleft_sentences"],
        "rule": "Inversion reverses the standard subject-auxiliary order. It occurs after negative or restrictive adverbs (never, rarely, under no circumstances) at the start of a sentence.",
        "explanation": "Inversion is a formal literary technique. By placing a negative adverb at the beginning of the clause, the auxiliary verb is moved before the subject (like in a question), creating a dramatic, emphatic tone.",
        "formula": "Negative/Restrictive Adverb + Auxiliary Verb + Subject + Main Verb",
        "timeline": {"label_left": "Normal: Subject-Verb", "label_right": "Inverted: Verb-Subject", "marker": "Stylistic shift for emphasis"},
        "examples": [
            {
                "sentence": "Never have I seen such a beautiful sunset.",
                "tokens": [
                    {"text": "Never", "role": "adverb"},
                    {"text": "have", "role": "auxiliary"},
                    {"text": "I", "role": "subject"},
                    {"text": "seen", "role": "verb"},
                    {"text": "such", "role": "adjective"},
                    {"text": "a", "role": "article"},
                    {"text": "beautiful", "role": "adjective"},
                    {"text": "sunset", "role": "object"}
                ],
                "translation_hint": "मैंने ऐसा सुंदर सूर्यास्त कभी नहीं देखा है। / నేను ఎన్నడూ ఇంత అందమైన సూర్యాస్తమయాన్ని చూడలేదు.",
                "note": "The negative adverb 'Never' triggers the auxiliary 'have' to precede the subject 'I'."
            },
            {
                "sentence": "Rarely does he travel abroad.",
                "tokens": [
                    {"text": "Rarely", "role": "adverb"},
                    {"text": "does", "role": "auxiliary"},
                    {"text": "he", "role": "subject"},
                    {"text": "travel", "role": "verb"},
                    {"text": "abroad", "role": "adverb"}
                ],
                "translation_hint": "वह शायद ही कभी विदेश यात्रा करता है। / అతను విదేశాలకు ప్రయాణించడం చాలా అరుదు.",
                "note": "Since the active verb is present simple, the auxiliary 'does' is introduced and placed before the subject."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "Rarely we see such talent.",
                "right": "Rarely do we see such talent.",
                "explanation": "When starting a sentence with 'Rarely', you must invert the subject and introduce the auxiliary 'do/does/did'."
            },
            {
                "wrong": "Under no circumstances you should press this button.",
                "right": "Under no circumstances should you press this button.",
                "explanation": "The restrictive phrase 'Under no circumstances' requires inversion of the modal auxiliary 'should' and the subject 'you'."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Use of Auxiliaries",
                "body": "If the original sentence has no auxiliary verb (e.g. He went -> Seldom did he go), add do/does/did to perform the inversion."
            }
        ],
        "quiz": [
            {
                "q": "___ such a display of courage.",
                "options": ["Seldom I saw", "Seldom did I see", "Seldom I did see", "Seldom saw I"],
                "answer": 1,
                "explanation": "The negative adverb 'Seldom' requires inversion using the past auxiliary 'did'."
            },
            {
                "q": "Which sentence is inverted correctly?",
                "options": [
                    "Not only she is smart, but she is also hard-working.",
                    "Not only is she smart, but she is also hard-working.",
                    "Not only she smart is, but she is also hard-working.",
                    "Not only is she smart, but also hard-working she is."
                ],
                "answer": 1,
                "explanation": "'Not only' triggers inversion of the verb 'to be' ('is she')."
            },
            {
                "q": "Complete: 'Hardly ___ when the phone rang.'",
                "options": ["I had arrived", "had I arrived", "did I arrive", "arrived I"],
                "answer": 1,
                "explanation": "'Hardly' is paired with the Past Perfect in inverted time sequences ('had I arrived')."
            },
            {
                "q": "Under no circumstances ___ the password.",
                "options": ["you must share", "must you share", "should you sharing", "you will share"],
                "answer": 1,
                "explanation": "Requires inversion of subject and modal 'must'."
            },
            {
                "q": "Only after the meeting ___ the truth.",
                "options": ["we found out", "did we find out", "we did find out", "found we out"],
                "answer": 1,
                "explanation": "Phrases starting with 'Only' trigger inversion in the main clause ('did we find out')."
            }
        ]
    },
    # ── Category 3: Word Classes ──────────────────────────────────────────
    "articles": {
        "id": "articles",
        "topic": "Articles (a / an / the)",
        "level": 1,
        "levelLabel": "Foundation",
        "category": "word_classes",
        "categoryLabel": "Word Classes",
        "categoryEmoji": "📦",
        "prerequisites": [],
        "rule": "Use 'a' or 'an' for singular, non-specific nouns. Use 'the' when referencing a specific or unique noun that is known to both the speaker and listener.",
        "explanation": "Indefinite articles (a/an) introduce new, generic items (e.g. 'I bought a laptop'). Once the item is introduced or is already unique, use the definite article 'the' (e.g. 'The laptop is great').",
        "formula": "a/an + general noun | the + specific/previously mentioned noun",
        "timeline": {"label_left": "New/General (a/an)", "label_right": "Shared/Specific (the)", "marker": "Progression from general to specific"},
        "examples": [
            {
                "sentence": "I bought a phone, but the phone is broken.",
                "tokens": [
                    {"text": "I", "role": "subject"},
                    {"text": "bought", "role": "verb"},
                    {"text": "a", "role": "article"},
                    {"text": "phone", "role": "object"},
                    {"text": ",", "role": "preposition"},
                    {"text": "but", "role": "conjunction"},
                    {"text": "the", "role": "article"},
                    {"text": "phone", "role": "subject"},
                    {"text": "is", "role": "verb"},
                    {"text": "broken", "role": "adjective"}
                ],
                "translation_hint": "मैंने एक फोन खरीदा, लेकिन फोन खराब है। / నేను ఒక ఫోన్ కొన్నాను, కానీ ఆ ఫోన్ పాడైపోయింది.",
                "note": "We introduce the phone with 'a', then refer back to it with 'the'."
            },
            {
                "sentence": "She works as an engineer.",
                "tokens": [
                    {"text": "She", "role": "subject"},
                    {"text": "works", "role": "verb"},
                    {"text": "as", "role": "preposition"},
                    {"text": "an", "role": "article"},
                    {"text": "engineer", "role": "noun"}
                ],
                "translation_hint": "वह एक इंजीनियर के रूप में काम करती है। / ఆమె ఇంజనీర్‌గా పనిచేస్తుంది.",
                "note": "Use 'an' before nouns starting with a vowel sound."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "He is a honest person.",
                "right": "He is an honest person.",
                "explanation": "The choice between 'a' and 'an' depends on the pronunciation, not the spelling. 'Honest' starts with a silent 'h', hence a vowel sound."
            },
            {
                "wrong": "I love the nature.",
                "right": "I love nature.",
                "explanation": "Do not use 'the' with general abstract nouns like nature, society, or space unless they are modified specifically."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Pronunciation Rule",
                "body": "Use 'an' with words starting with a silent 'h' (an hour) and 'a' with vowel letters that sound like consonants (a university, a one-way street)."
            }
        ],
        "quiz": [
            {
                "q": "We stayed at ___ hotel in the city centre.",
                "options": ["a", "an", "the", "no article"],
                "answer": 0,
                "explanation": "Non-specific singular noun starting with a consonant sound requires 'a'."
            },
            {
                "q": "___ sun is hot today.",
                "options": ["A", "An", "The", "No article"],
                "answer": 2,
                "explanation": "For unique physical bodies like the sun or moon, always use the definite article 'the'."
            },
            {
                "q": "She is studying at ___ university in Europe.",
                "options": ["a", "an", "the", "no article"],
                "answer": 0,
                "explanation": "'University' starts with a 'y' consonant sound (/juː/), so we use 'a'."
            },
            {
                "q": "I have to leave in ___ hour.",
                "options": ["a", "an", "the", "no article"],
                "answer": 1,
                "explanation": "'Hour' starts with a silent 'h', resulting in a vowel sound requiring 'an'."
            },
            {
                "q": "He is interested in ___ ancient history.",
                "options": ["a", "an", "the", "no article"],
                "answer": 3,
                "explanation": "No article is used before general fields of study or historical periods."
            }
        ]
    },
    "prepositions_time_place": {
        "id": "prepositions_time_place",
        "topic": "Prepositions of Time & Place",
        "level": 1,
        "levelLabel": "Foundation",
        "category": "word_classes",
        "categoryLabel": "Word Classes",
        "categoryEmoji": "📦",
        "prerequisites": [],
        "rule": "Use 'at' for specific times or exact coordinates. Use 'in' for months, years, or enclosed spaces. Use 'on' for days, dates, or surfaces.",
        "explanation": "Prepositions structure spatial and temporal references. 'In' is general (large areas, long times), 'On' is intermediate (days, surfaces), and 'At' is highly specific (precise locations, exact times).",
        "formula": "at + point | on + surface/day | in + container/period",
        "timeline": {"label_left": "In (months/years)", "label_right": "At (hours/points)", "marker": "Broad to highly specific"},
        "examples": [
            {
                "sentence": "The meeting is at noon on Monday.",
                "tokens": [
                    {"text": "The", "role": "article"},
                    {"text": "meeting", "role": "subject"},
                    {"text": "is", "role": "verb"},
                    {"text": "at", "role": "preposition"},
                    {"text": "noon", "role": "noun"},
                    {"text": "on", "role": "preposition"},
                    {"text": "Monday", "role": "noun"}
                ],
                "translation_hint": "बैठक सोमवार को दोपहर में है। / సోమవారం మధ్యాహ్నం సమావేశం ఉంది.",
                "note": "Uses 'at' for a specific time of day (noon) and 'on' for a day of the week (Monday)."
            },
            {
                "sentence": "I live in Berlin on the third floor.",
                "tokens": [
                    {"text": "I", "role": "subject"},
                    {"text": "live", "role": "verb"},
                    {"text": "in", "role": "preposition"},
                    {"text": "Berlin", "role": "object"},
                    {"text": "on", "role": "preposition"},
                    {"text": "the", "role": "article"},
                    {"text": "third", "role": "adjective"},
                    {"text": "floor", "role": "noun"}
                ],
                "translation_hint": "मैं बर्लिन में तीसरी मंजिल पर रहता हूँ। / నేను బెర్లిన్‌లో మూడవ అంతస్తులో నివసిస్తున్నాను.",
                "note": "Uses 'in' for a city (enclosed region) and 'on' for a building floor (flat surface)."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "I will meet you in Monday.",
                "right": "I will meet you on Monday.",
                "explanation": "Always use 'on' with days of the week."
            },
            {
                "wrong": "He is in the school right now.",
                "right": "He is at school right now.",
                "explanation": "Use 'at' without articles when referring to institutional locations where one performs their regular duties (at school, at work)."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Pyramid Rule",
                "body": "In (Broadest) -> On (Specific days/surfaces) -> At (Most specific times/spots)."
            }
        ],
        "quiz": [
            {
                "q": "She was born ___ October.",
                "options": ["at", "on", "in", "by"],
                "answer": 2,
                "explanation": "Use 'in' for months of the year."
            },
            {
                "q": "Let's meet ___ 6 PM.",
                "options": ["on", "in", "at", "during"],
                "answer": 2,
                "explanation": "Use 'at' for exact times of the day."
            },
            {
                "q": "The keys are ___ the table.",
                "options": ["in", "on", "at", "inside"],
                "answer": 1,
                "explanation": "Use 'on' for objects sitting on a physical surface."
            },
            {
                "q": "He is traveling to Paris ___ the summer.",
                "options": ["in", "on", "at", "to"],
                "answer": 0,
                "explanation": "Use 'in' for seasons (in the summer, in winter)."
            },
            {
                "q": "The office is located ___ 100 Main Street.",
                "options": ["in", "on", "at", "by"],
                "answer": 2,
                "explanation": "Use 'at' for specific, complete street addresses."
            }
        ]
    },
    "modal_verbs": {
        "id": "modal_verbs",
        "topic": "Modal Verbs",
        "level": 2,
        "levelLabel": "Intermediate",
        "category": "word_classes",
        "categoryLabel": "Word Classes",
        "categoryEmoji": "📦",
        "prerequisites": ["articles"],
        "rule": "Modal verbs (can, could, must, should, may, might) express ability, permission, obligation, or possibility. They are followed by a bare infinitive (verb without 'to').",
        "explanation": "Modal verbs are auxiliary verbs that modify the meaning of the main verb. They do not change form for person (no '-s' for third person) and do not use 'do/does' for questions or negatives.",
        "formula": "Subject + Modal Verb + Base Verb",
        "timeline": {"label_left": "Ability / Permission", "label_right": "Possibility / Obligation", "marker": "Expression of necessity or capability"},
        "examples": [
            {
                "sentence": "You must submit the report.",
                "tokens": [
                    {"text": "You", "role": "subject"},
                    {"text": "must", "role": "modal"},
                    {"text": "submit", "role": "verb"},
                    {"text": "the", "role": "article"},
                    {"text": "report", "role": "object"}
                ],
                "translation_hint": "आपको रिपोर्ट जमा करनी होगी। / మీరు నివేదికను తప్పనిసరిగా సమర్పించాలి.",
                "note": "'Must' indicates strong, mandatory obligation."
            },
            {
                "sentence": "She should call her manager.",
                "tokens": [
                    {"text": "She", "role": "subject"},
                    {"text": "should", "role": "modal"},
                    {"text": "call", "role": "verb"},
                    {"text": "her", "role": "pronoun"},
                    {"text": "manager", "role": "object"}
                ],
                "translation_hint": "उसे अपने मैनेजर को फोन करना चाहिए। / ఆమె తన మేనేజర్‌కు ఫోన్ చేయాలి.",
                "note": "'Should' is used to offer advice or recommendations."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "He can to swim.",
                "right": "He can swim.",
                "explanation": "Do not follow modal verbs with a 'to'-infinitive. Use the base form of the verb."
            },
            {
                "wrong": "She musts work tomorrow.",
                "right": "She must work tomorrow.",
                "explanation": "Modal verbs do not take an '-s' ending in the third-person singular."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Negatives",
                "body": "To form a negative statement, simply place 'not' directly after the modal verb (should not, must not, cannot)."
            }
        ],
        "quiz": [
            {
                "q": "You ___ park here. It is forbidden.",
                "options": ["must not", "should not", "don't have to", "might not"],
                "answer": 0,
                "explanation": "'Must not' indicates that an action is strictly prohibited."
            },
            {
                "q": "He ___ speak three languages fluently.",
                "options": ["must", "can", "should", "may"],
                "answer": 1,
                "explanation": "'Can' is used to express general physical or intellectual ability."
            },
            {
                "q": "It is cloudy; it ___ rain later.",
                "options": ["must", "should", "might", "can"],
                "answer": 2,
                "explanation": "'Might' is used to express weak future possibility."
            },
            {
                "q": "We ___ leave early to avoid traffic.",
                "options": ["ought", "should", "must to", "would to"],
                "answer": 1,
                "explanation": "'Should' is the correct advice modal here. 'Ought' would require 'to'."
            },
            {
                "q": "You ___ wash the dishes; I've already done them.",
                "options": ["must not", "don't have to", "cannot", "might not"],
                "answer": 1,
                "explanation": "'Don't have to' indicates a lack of obligation (unnecessary, but not prohibited)."
            }
        ]
    },
    "adjective_order": {
        "id": "adjective_order",
        "topic": "Adjective Order",
        "level": 2,
        "levelLabel": "Intermediate",
        "category": "word_classes",
        "categoryLabel": "Word Classes",
        "categoryEmoji": "📦",
        "prerequisites": ["articles"],
        "rule": "When using multiple adjectives before a noun, they must follow a specific sequence: Opinion, Size, Physical Quality, Shape, Age, Colour, Origin, Material, Type, Purpose.",
        "explanation": "Native English speakers have an intuitive sense of adjective order. Violating this hierarchy sounds unnatural. For example, we say 'a beautiful small round wooden table', not 'a wooden round small beautiful table'.",
        "formula": "Opinion + Size + Age + Colour + Origin + Material + Noun",
        "timeline": {"label_left": "Subjective (Opinion)", "label_right": "Objective (Material)", "marker": "Subjective opinion to physical fact"},
        "examples": [
            {
                "sentence": "She bought a beautiful, antique, wooden table.",
                "tokens": [
                    {"text": "She", "role": "subject"},
                    {"text": "bought", "role": "verb"},
                    {"text": "a", "role": "article"},
                    {"text": "beautiful", "role": "adjective"},
                    {"text": ",", "role": "preposition"},
                    {"text": "antique", "role": "adjective"},
                    {"text": ",", "role": "preposition"},
                    {"text": "wooden", "role": "adjective"},
                    {"text": "table", "role": "object"}
                ],
                "translation_hint": "उसने एक सुंदर, प्राचीन, लकड़ी की मेज खरीदी। / ఆమె ఒక అందమైన, పురాతనమైన, చెక్క టేబుల్‌ను కొనుగోలు చేసింది.",
                "note": "Ordered: Opinion (beautiful) -> Age (antique) -> Material (wooden)."
            },
            {
                "sentence": "I found a large, black, leather bag.",
                "tokens": [
                    {"text": "I", "role": "subject"},
                    {"text": "found", "role": "verb"},
                    {"text": "a", "role": "article"},
                    {"text": "large", "role": "adjective"},
                    {"text": ",", "role": "preposition"},
                    {"text": "black", "role": "adjective"},
                    {"text": ",", "role": "preposition"},
                    {"text": "leather", "role": "adjective"},
                    {"text": "bag", "role": "object"}
                ],
                "translation_hint": "मुझे एक बड़ा, काला, चमड़े का बैग मिला। / నాకు ఒక పెద్ద, నల్లటి, తోలు బ్యాగ్ దొరికింది.",
                "note": "Ordered: Size (large) -> Colour (black) -> Material (leather)."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "He lives in a wooden old cabin.",
                "right": "He lives in an old wooden cabin.",
                "explanation": "Age (old) must precede material (wooden)."
            },
            {
                "wrong": "She wore a red beautiful dress.",
                "right": "She wore a beautiful red dress.",
                "explanation": "Opinion (beautiful) must always precede colour (red)."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Rule of Thumb",
                "body": "Adjectives representing opinions or feelings (lovely, cool) always go first, while objective material descriptors (metal, cotton) go closest to the noun."
            }
        ],
        "quiz": [
            {
                "q": "Choose the correct order:",
                "options": [
                    "a leather brown smart jacket",
                    "a smart brown leather jacket",
                    "a brown smart leather jacket",
                    "a smart leather brown jacket"
                ],
                "answer": 1,
                "explanation": "Correct order: Opinion (smart) -> Colour (brown) -> Material (leather)."
            },
            {
                "q": "Choose the correct sentence:",
                "options": [
                    "They bought a large round metal table.",
                    "They bought a metal round large table.",
                    "They bought a round large metal table.",
                    "They bought a large metal round table."
                ],
                "answer": 0,
                "explanation": "Correct order: Size (large) -> Shape (round) -> Material (metal)."
            },
            {
                "q": "Identify the correct phrase:",
                "options": [
                    "an interesting old Chinese vase",
                    "a Chinese old interesting vase",
                    "an old interesting Chinese vase",
                    "an interesting Chinese old vase"
                ],
                "answer": 0,
                "explanation": "Correct order: Opinion (interesting) -> Age (old) -> Origin (Chinese)."
            },
            {
                "q": "Which of these is natural English?",
                "options": [
                    "a blue tiny cotton shirt",
                    "a cotton tiny blue shirt",
                    "a tiny blue cotton shirt",
                    "a tiny cotton blue shirt"
                ],
                "answer": 2,
                "explanation": "Correct order: Size (tiny) -> Colour (blue) -> Material (cotton)."
            },
            {
                "q": "Adjectives of opinion (e.g. ugly, cute) are placed ___ adjectives of fact.",
                "options": ["after", "before", "in the middle of", "next to"],
                "answer": 1,
                "explanation": "Opinion adjectives always precede fact adjectives."
            }
        ]
    },
    "gerunds_vs_infinitives": {
        "id": "gerunds_vs_infinitives",
        "topic": "Gerunds vs Infinitives",
        "level": 3,
        "levelLabel": "Advanced",
        "category": "word_classes",
        "categoryLabel": "Word Classes",
        "categoryEmoji": "📦",
        "prerequisites": ["modal_verbs"],
        "rule": "Some verbs are followed by a gerund (verb-ing) while others require an infinitive (to + verb). A few verbs accept both, sometimes changing the meaning.",
        "explanation": "Verbs like 'enjoy', 'avoid', and 'admit' take a gerund. Verbs like 'decide', 'hope', and 'refuse' take an infinitive. Verbs like 'stop', 'remember', and 'forget' change meaning based on the structure chosen.",
        "formula": "Verb + Gerund (-ing) | Verb + Infinitive (to + Verb)",
        "timeline": {"label_left": "Completed/Real (Gerund)", "label_right": "Hypothetical/Future (Infinitive)", "marker": "Verb determining secondary verb format"},
        "examples": [
            {
                "sentence": "She enjoys reading but wants to write a novel.",
                "tokens": [
                    {"text": "She", "role": "subject"},
                    {"text": "enjoys", "role": "verb"},
                    {"text": "reading", "role": "gerund"},
                    {"text": "but", "role": "conjunction"},
                    {"text": "wants", "role": "verb"},
                    {"text": "to write", "role": "infinitive"},
                    {"text": "a", "role": "article"},
                    {"text": "novel", "role": "object"}
                ],
                "translation_hint": "वह पढ़ने का आनंद लेती है लेकिन एक उपन्यास लिखना चाहती है। / ఆమె చదవడం ఆనందిస్తుంది కానీ నవల రాయాలనుకుంటోంది.",
                "note": "'Enjoy' is followed by a gerund; 'want' is followed by an infinitive."
            },
            {
                "sentence": "I stopped working to eat lunch.",
                "tokens": [
                    {"text": "I", "role": "subject"},
                    {"text": "stopped", "role": "verb"},
                    {"text": "working", "role": "gerund"},
                    {"text": "to eat", "role": "infinitive"},
                    {"text": "lunch", "role": "object"}
                ],
                "translation_hint": "मैंने दोपहर का भोजन करने के लिए काम करना बंद कर दिया। / నేను మధ్యాహ్నం భోజనం చేయడానికి పని చేయడం ఆపాను.",
                "note": "Stopping an activity (working) in order to do something else (to eat)."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "I decided going to the gym.",
                "right": "I decided to go to the gym.",
                "explanation": "The verb 'decide' must be followed by an infinitive."
            },
            {
                "wrong": "He avoids to speak in public.",
                "right": "He avoids speaking in public.",
                "explanation": "The verb 'avoid' must be followed by a gerund."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Meaning Shift",
                "body": "'Forget/Remember + gerund' refers to a past memory. 'Forget/Remember + infinitive' refers to a duty or task (e.g. Remember to lock the door)."
            }
        ],
        "quiz": [
            {
                "q": "I look forward to ___ you.",
                "options": ["see", "seeing", "to see", "seen"],
                "answer": 1,
                "explanation": "'Look forward to' is a phrasal verb where 'to' is a preposition, requiring the gerund form (seeing)."
            },
            {
                "q": "They managed ___ the problem quickly.",
                "options": ["solving", "to solve", "solve", "solved"],
                "answer": 1,
                "explanation": "'Manage' requires a to-infinitive (to solve)."
            },
            {
                "q": "She suggested ___ to a different restaurant.",
                "options": ["go", "to go", "going", "gone"],
                "answer": 2,
                "explanation": "'Suggest' is followed by a gerund (going) in direct constructions."
            },
            {
                "q": "I will never forget ___ Paris for the first time.",
                "options": ["visiting", "to visit", "visit", "visited"],
                "answer": 0,
                "explanation": "'Forget + gerund' refers to looking back on a past memory/experience."
            },
            {
                "q": "The doctor advised him ___ smoking.",
                "options": ["quitting", "to quit", "quit", "to quitting"],
                "answer": 1,
                "explanation": "'Advise + object' requires a to-infinitive (advised him to quit)."
            }
        ]
    },
    "comparative_superlative": {
        "id": "comparative_superlative",
        "topic": "Comparative & Superlative",
        "level": 3,
        "levelLabel": "Advanced",
        "category": "word_classes",
        "categoryLabel": "Word Classes",
        "categoryEmoji": "📦",
        "prerequisites": ["adjective_order"],
        "rule": "Use comparative adjectives to compare two items (e.g. bigger, more useful). Use superlative adjectives to compare three or more items (e.g. biggest, most useful).",
        "explanation": "Short adjectives add '-er' or '-est'. Longer adjectives of two or more syllables use 'more' or 'most'. Beware of irregular forms like good/better/best and bad/worse/worst.",
        "formula": "Comp: adj-er / more + adj + than | Super: the + adj-est / the most + adj",
        "timeline": {"label_left": "Base level", "label_right": "Extreme level (Superlative)", "marker": "Progression of degree"},
        "examples": [
            {
                "sentence": "This project is more complex than the last one.",
                "tokens": [
                    {"text": "This", "role": "adjective"},
                    {"text": "project", "role": "subject"},
                    {"text": "is", "role": "verb"},
                    {"text": "more", "role": "adverb"},
                    {"text": "complex", "role": "adjective"},
                    {"text": "than", "role": "conjunction"},
                    {"text": "the", "role": "article"},
                    {"text": "last", "role": "adjective"},
                    {"text": "one", "role": "pronoun"}
                ],
                "translation_hint": "यह परियोजना पिछली वाली से अधिक जटिल है। / ఈ ప్రాజెక్ట్ మునుపటి కంటే చాలా క్లిష్టమైనది.",
                "note": "Uses comparative structure for a multi-syllable adjective."
            },
            {
                "sentence": "He is the oldest employee in our department.",
                "tokens": [
                    {"text": "He", "role": "subject"},
                    {"text": "is", "role": "verb"},
                    {"text": "the", "role": "article"},
                    {"text": "oldest", "role": "adjective"},
                    {"text": "employee", "role": "complement"},
                    {"text": "in", "role": "preposition"},
                    {"text": "our", "role": "pronoun"},
                    {"text": "department", "role": "noun"}
                ],
                "translation_hint": "वह हमारे विभाग के सबसे पुराने कर्मचारी हैं। / అతను మా విభాగంలో అత్యంత పాత ఉద్యోగి.",
                "note": "Superlative structure for a single-syllable adjective (oldest)."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "This is the most cheapest phone.",
                "right": "This is the cheapest phone.",
                "explanation": "Do not double-mark superlatives. Since 'cheap' is a short adjective ending in '-est', do not use 'most'."
            },
            {
                "wrong": "My English is more better now.",
                "right": "My English is better now.",
                "explanation": "'Better' is already the comparative form of 'good'. Using 'more' before it is redundant."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Double Comparatives",
                "body": "Use 'the... the...' to show how two changes occur together (e.g. The older I get, the wiser I become)."
            }
        ],
        "quiz": [
            {
                "q": "The weather today is even ___ than yesterday.",
                "options": ["badder", "worse", "worst", "more bad"],
                "answer": 1,
                "explanation": "'Worse' is the irregular comparative form of 'bad'."
            },
            {
                "q": "This is ___ book I have ever read.",
                "options": ["the most interesting", "most interesting", "the interestingest", "more interesting"],
                "answer": 0,
                "explanation": "Superlatives for long adjectives require 'the most' + adjective."
            },
            {
                "q": "He is ___ than his brother.",
                "options": ["taller", "tallest", "more tall", "the taller"],
                "answer": 0,
                "explanation": "Comparing two people with a short adjective requires adding '-er' and 'than'."
            },
            {
                "q": "Of all the designs, this one is ___.",
                "options": ["creative", "more creative", "the most creative", "most creative"],
                "answer": 2,
                "explanation": "Comparing a group of multiple designs requires the definite superlative 'the most creative'."
            },
            {
                "q": "The ___ you practice, the easier it gets.",
                "options": ["more", "most", "much", "many"],
                "answer": 0,
                "explanation": "Uses the double comparative structure 'the more... the easier'."
            }
        ]
    },
    "advanced_determiners": {
        "id": "advanced_determiners",
        "topic": "Advanced Determiners",
        "level": 4,
        "levelLabel": "Pro",
        "category": "word_classes",
        "categoryLabel": "Word Classes",
        "categoryEmoji": "📦",
        "prerequisites": ["gerunds_vs_infinitives"],
        "rule": "Use advanced determiners (either, neither, each, every, all, both, none) to precisely specify distribution, reference, and quantity in relation to nouns.",
        "explanation": "Mastering advanced determiners helps clarify quantities and connections. For example, 'each' views items individually, 'every' views them as a group, and 'either/neither' refers to choices between two items.",
        "formula": "Determiner + Noun Phrase (+ Singular/Plural Verb agreement)",
        "timeline": {"label_left": "None", "label_right": "All", "marker": "Distribution scale"},
        "examples": [
            {
                "sentence": "Neither candidate was suitable for the job.",
                "tokens": [
                    {"text": "Neither", "role": "adjective"},
                    {"text": "candidate", "role": "subject"},
                    {"text": "was", "role": "verb"},
                    {"text": "suitable", "role": "adjective"},
                    {"text": "for", "role": "preposition"},
                    {"text": "the", "role": "article"},
                    {"text": "job", "role": "object"}
                ],
                "translation_hint": "दोनों में से कोई भी उम्मीदवार नौकरी के लिए उपयुक्त नहीं था। / ఇద్దరు అభ్యర్థులలో ఎవరూ ఉద్యోగానికి తగినవారు కారు.",
                "note": "'Neither' refers to two candidates, taking a singular verb (was)."
            },
            {
                "sentence": "Each member has a task.",
                "tokens": [
                    {"text": "Each", "role": "adjective"},
                    {"text": "member", "role": "subject"},
                    {"text": "has", "role": "verb"},
                    {"text": "a", "role": "article"},
                    {"text": "task", "role": "object"}
                ],
                "translation_hint": "प्रत्येक सदस्य के पास एक कार्य है। / ప్రతి సభ్యునికి ఒక పని ఉంది.",
                "note": "'Each' emphasizes individual units and takes a singular verb (has)."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "Neither of the cars are working.",
                "right": "Neither of the cars is working.",
                "explanation": "Strictly speaking, 'neither' is singular and requires a singular verb in formal English."
            },
            {
                "wrong": "Every employees must attend the meeting.",
                "right": "Every employee must attend the meeting.",
                "explanation": "'Every' is always followed by a singular countable noun, not a plural."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Either vs. Neither",
                "body": "'Either' indicates a positive choice between two options (any one). 'Neither' indicates a negative choice excluding both options."
            }
        ],
        "quiz": [
            {
                "q": "___ of the twin sisters attended the party.",
                "options": ["Both", "Either", "Neither", "None"],
                "answer": 2,
                "explanation": "If we want to state that zero out of two sisters attended, we use 'Neither'."
            },
            {
                "q": "___ student was given a dictionary.",
                "options": ["Each", "All", "Every of", "Both of"],
                "answer": 0,
                "explanation": "'Each' directly precedes a singular countable noun and is correct here."
            },
            {
                "q": "We have two computers, but ___ of them works.",
                "options": ["none", "neither", "no one", "either"],
                "answer": 1,
                "explanation": "For a negative statement about two items, use 'neither'."
            },
            {
                "q": "___ parent must sign the permission form.",
                "options": ["Both", "All", "Each", "Every of"],
                "answer": 2,
                "explanation": "Requires a singular determiner for the singular noun 'parent'."
            },
            {
                "q": "___ employees were satisfied with the new policy.",
                "options": ["Every", "None of", "All of the", "Each of"],
                "answer": 2,
                "explanation": "'Employees' is plural, so we use 'All of the'."
            }
        ]
    },
    # ── Category 4: Complex Constructions ─────────────────────────────────
    "conditionals_0_1": {
        "id": "conditionals_0_1",
        "topic": "Basic Conditionals (Zero & First)",
        "level": 1,
        "levelLabel": "Foundation",
        "category": "complex",
        "categoryLabel": "Complex Constructions",
        "categoryEmoji": "🏗️",
        "prerequisites": [],
        "rule": "Use the Zero Conditional for general facts or scientific truths (if + present, present). Use the First Conditional for realistic, possible future events (if + present, will + verb).",
        "explanation": "Zero Conditional describes things that are always true under certain conditions. First Conditional predicts likely results of a specific future condition.",
        "formula": "Zero: If + Present Simple, Present Simple | First: If + Present Simple, will + Base Verb",
        "timeline": {"label_left": "Condition", "label_right": "Certain Fact / Future Result", "marker": "If condition is met -> result occurs"},
        "examples": [
            {
                "sentence": "If you heat ice, it melts.",
                "tokens": [
                    {"text": "If", "role": "conjunction"},
                    {"text": "you", "role": "subject"},
                    {"text": "heat", "role": "verb"},
                    {"text": "ice", "role": "object"},
                    {"text": ",", "role": "preposition"},
                    {"text": "it", "role": "subject"},
                    {"text": "melts", "role": "verb"}
                ],
                "translation_hint": "यदि आप बर्फ गर्म करते हैं, तो वह पिघल जाती है। / మీరు మంచును వేడి చేస్తే, అది కరుగుతుంది.",
                "note": "Zero conditional expresses a scientific fact."
            },
            {
                "sentence": "If it rains tomorrow, we will stay home.",
                "tokens": [
                    {"text": "If", "role": "conjunction"},
                    {"text": "it", "role": "subject"},
                    {"text": "rains", "role": "verb"},
                    {"text": "tomorrow", "role": "adverb"},
                    {"text": ",", "role": "preposition"},
                    {"text": "we", "role": "subject"},
                    {"text": "will", "role": "auxiliary"},
                    {"text": "stay", "role": "verb"},
                    {"text": "home", "role": "adverb"}
                ],
                "translation_hint": "यदि कल बारिश होती है, तो हम घर पर रहेंगे। / రేపు వర్షం పడితే, మేము ఇంట్లోనే ఉంటాము.",
                "note": "First conditional predicts a likely future outcome."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "If it will rain tomorrow, we will stay home.",
                "right": "If it rains tomorrow, we will stay home.",
                "explanation": "Do not use 'will' in the 'if'-clause of first conditionals. Use the Present Simple instead."
            },
            {
                "wrong": "If you heat water to 100 degrees, it will boil.",
                "right": "If you heat water to 100 degrees, it boils.",
                "explanation": "For automatic scientific facts, Zero Conditional (boils) is preferred over First Conditional (will boil)."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "When vs. If",
                "body": "In Zero Conditionals, 'if' and 'when' can be used interchangeably (e.g. When you heat ice, it melts) because the result is always guaranteed."
            }
        ],
        "quiz": [
            {
                "q": "If you freeze water, it ___ into ice.",
                "options": ["turn", "turns", "will turn", "turned"],
                "answer": 1,
                "explanation": "A general scientific fact requires the Zero Conditional (turns)."
            },
            {
                "q": "If she ___ hard, she will pass the exam.",
                "options": ["study", "studies", "will study", "studied"],
                "answer": 1,
                "explanation": "The 'if'-clause in the First Conditional takes the Present Simple (studies)."
            },
            {
                "q": "We will go to the park if the weather ___ good.",
                "options": ["is", "will be", "be", "was"],
                "answer": 0,
                "explanation": "Present Simple 'is' is required in the condition clause of the First Conditional."
            },
            {
                "q": "If I ___ free tonight, I will call you.",
                "options": ["am", "will be", "be", "was"],
                "answer": 0,
                "explanation": "Use Present Simple 'am' in the 'if' clause of this First Conditional statement."
            },
            {
                "q": "Plants die if they ___ water.",
                "options": ["don't get", "won't get", "didn't get", "not get"],
                "answer": 0,
                "explanation": "General rule of nature: Zero conditional uses Present Simple negative 'don't get'."
            }
        ]
    },
    "imperative_mood": {
        "id": "imperative_mood",
        "topic": "Imperative Mood",
        "level": 1,
        "levelLabel": "Foundation",
        "category": "complex",
        "categoryLabel": "Complex Constructions",
        "categoryEmoji": "🏗️",
        "prerequisites": [],
        "rule": "Use the imperative mood to give direct commands, instructions, advice, or warnings. It uses the base form of the verb with no subject pronoun.",
        "explanation": "Imperatives are addressed to the second person ('you'), which is omitted. Negatives are formed by adding 'Do not' or 'Don't' before the base verb.",
        "formula": "Base Verb + Object/Complement | Don't + Base Verb + Object/Complement",
        "timeline": {"label_left": "Command given", "label_right": "Action expected", "marker": "Direct demand for immediate response"},
        "examples": [
            {
                "sentence": "Please shut the door.",
                "tokens": [
                    {"text": "Please", "role": "adverb"},
                    {"text": "shut", "role": "verb"},
                    {"text": "the", "role": "article"},
                    {"text": "door", "role": "object"}
                ],
                "translation_hint": "कृपया दरवाजा बंद करें। / దయచేసి తలుపు మూయండి.",
                "note": "A polite command using 'please' and the base verb 'shut'."
            },
            {
                "sentence": "Don't touch the wire.",
                "tokens": [
                    {"text": "Don't", "role": "auxiliary"},
                    {"text": "touch", "role": "verb"},
                    {"text": "the", "role": "article"},
                    {"text": "wire", "role": "object"}
                ],
                "translation_hint": "तार को मत छुओ। / తీగను తాకవద్దు.",
                "note": "A negative imperative warning against a dangerous action."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "You shut the window.",
                "right": "Shut the window.",
                "explanation": "Do not include the subject pronoun 'you' in standard imperative sentences."
            },
            {
                "wrong": "Not talk in the library.",
                "right": "Don't talk in the library.",
                "explanation": "Form negative imperatives with 'Don't' or 'Do not', never with 'Not' alone."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Adding Politeness",
                "body": "To make imperatives softer or more polite, add 'please' at the beginning or end, or rephrase as a request (e.g. Could you shut the window?)."
            }
        ],
        "quiz": [
            {
                "q": "___ left at the next junction.",
                "options": ["To turn", "Turn", "Turning", "You turn"],
                "answer": 1,
                "explanation": "Imperative instructions use the bare base form of the verb."
            },
            {
                "q": "___ make any noise; the baby is sleeping.",
                "options": ["Not", "No", "Don't", "Doesn't"],
                "answer": 2,
                "explanation": "Negative imperatives require 'Don't' before the base verb."
            },
            {
                "q": "Choose the correct imperative statement:",
                "options": [
                    "Be careful!",
                    "You be careful!",
                    "To be careful!",
                    "Being careful!"
                ],
                "answer": 0,
                "explanation": "Uses 'Be' (base form of to be) as the direct verb without a subject."
            },
            {
                "q": "___ your books to page 20.",
                "options": ["Opening", "Open", "To open", "You open"],
                "answer": 1,
                "explanation": "The base verb 'Open' starts the instructional imperative sentence."
            },
            {
                "q": "___ feed the animals at the zoo.",
                "options": ["Don't", "No", "Not to", "Doesn't"],
                "answer": 0,
                "explanation": "Negative command prohibiting an action uses 'Don't'."
            }
        ]
    },
    "conditional_type_2": {
        "id": "conditional_type_2",
        "topic": "Conditional Type 2",
        "level": 2,
        "levelLabel": "Intermediate",
        "category": "complex",
        "categoryLabel": "Complex Constructions",
        "categoryEmoji": "🏗️",
        "prerequisites": ["conditionals_0_1"],
        "rule": "Use the Second Conditional to describe hypothetical, imaginary, or highly improbable situations in the present or future (if + past, would + verb).",
        "explanation": "Second Conditional presents a scenario that is contrary to current facts. For example, 'If I were rich...' implies I am not rich, but I am imagining what would happen if I were.",
        "formula": "If + Subject + Past Simple, Subject + would + Base Verb",
        "timeline": {"label_left": "Imaginary Present State", "label_right": "Hypothetical Outcome", "marker": "Unreal/Hypothetical scenario"},
        "examples": [
            {
                "sentence": "If I won the lottery, I would travel the world.",
                "tokens": [
                    {"text": "If", "role": "conjunction"},
                    {"text": "I", "role": "subject"},
                    {"text": "won", "role": "verb"},
                    {"text": "the", "role": "article"},
                    {"text": "lottery", "role": "object"},
                    {"text": ",", "role": "preposition"},
                    {"text": "I", "role": "subject"},
                    {"text": "would", "role": "modal"},
                    {"text": "travel", "role": "verb"},
                    {"text": "the", "role": "article"},
                    {"text": "world", "role": "object"}
                ],
                "translation_hint": "यदि मैं लॉटरी जीतता, तो मैं दुनिया की यात्रा करता। / నేను లాటరీ గెలిస్తే, నేను ప్రపంచాన్ని చుట్టివస్తాను.",
                "note": "Winning the lottery is a highly unlikely hypothetical condition."
            },
            {
                "sentence": "She would help you if she had time.",
                "tokens": [
                    {"text": "She", "role": "subject"},
                    {"text": "would", "role": "modal"},
                    {"text": "help", "role": "verb"},
                    {"text": "you", "role": "object"},
                    {"text": "if", "role": "conjunction"},
                    {"text": "she", "role": "subject"},
                    {"text": "had", "role": "verb"},
                    {"text": "time", "role": "object"}
                ],
                "translation_hint": "यदि उसके पास समय होता तो वह आपकी मदद करती। / ఆమెకు సమయం ఉంటే ఆమె మీకు సహాయం చేస్తుంది.",
                "note": "Implies she does not have time now, so she cannot help."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "If I would have more money, I would buy a car.",
                "right": "If I had more money, I would buy a car.",
                "explanation": "Do not put 'would' in the 'if'-clause. Use Past Simple (had) instead."
            },
            {
                "wrong": "If he was here, he would agree.",
                "right": "If he were here, he would agree.",
                "explanation": "In formal English, use 'were' instead of 'was' for all subjects (I, he, she, it) in the hypothetical clause."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Giving Advice",
                "body": "The phrase 'If I were you, I would...' is the standard English formula for offering advice to someone."
            }
        ],
        "quiz": [
            {
                "q": "If I ___ a bird, I would fly to Rome.",
                "options": ["am", "was", "were", "would be"],
                "answer": 2,
                "explanation": "'Were' is the correct subjunctive form for unreal conditions across all grammatical persons."
            },
            {
                "q": "What ___ you do if you lost your keys?",
                "options": ["will", "would", "did", "do"],
                "answer": 1,
                "explanation": "Second Conditional result clauses use the auxiliary 'would'."
            },
            {
                "q": "If they ___ more, they would pass the exams.",
                "options": ["studied", "study", "would study", "had studied"],
                "answer": 0,
                "explanation": "The condition clause requires the Past Simple form 'studied'."
            },
            {
                "q": "I ___ buy that house if I were you.",
                "options": ["will not", "would not", "don't", "didn't"],
                "answer": 1,
                "explanation": "Giving advice with 'If I were you' uses 'would/would not'."
            },
            {
                "q": "If she ___ the answer, she would tell us.",
                "options": ["knows", "knew", "would know", "had known"],
                "answer": 1,
                "explanation": "Requires the Past Simple 'knew' for a hypothetical present condition."
            }
        ]
    },
    "reported_speech_basics": {
        "id": "reported_speech_basics",
        "topic": "Reported Speech Basics",
        "level": 2,
        "levelLabel": "Intermediate",
        "category": "complex",
        "categoryLabel": "Complex Constructions",
        "categoryEmoji": "🏗️",
        "prerequisites": ["svo_order"],
        "rule": "Report statements by shifting the original speaker's tenses backward (present to past, past to past perfect) and updating pronouns, determiners, and time references.",
        "explanation": "When we report what someone said, we usually introduce it with a past tense verb like 'said' or 'told'. Because the statement was in the past, we backshift the tenses of the verbs to maintain temporal logic.",
        "formula": "Reporting Clause (e.g. He said that) + Backshifted Sentence",
        "timeline": {"label_left": "Direct Speech", "label_right": "Reported Speech (Later)", "marker": "Tense shift backward in time"},
        "examples": [
            {
                "sentence": "He said that he was working late.",
                "tokens": [
                    {"text": "He", "role": "subject"},
                    {"text": "said", "role": "verb"},
                    {"text": "that", "role": "conjunction"},
                    {"text": "he", "role": "subject"},
                    {"text": "was", "role": "auxiliary"},
                    {"text": "working", "role": "verb"},
                    {"text": "late", "role": "adverb"}
                ],
                "translation_hint": "उसने कहा कि वह देर से काम कर रहा था। / అతను ఆలస్యంగా పని చేస్తున్నానని చెప్పాడు.",
                "note": "Direct speech 'I am working late' (present continuous) backshifts to 'was working' (past continuous)."
            },
            {
                "sentence": "She told me she had already eaten.",
                "tokens": [
                    {"text": "She", "role": "subject"},
                    {"text": "told", "role": "verb"},
                    {"text": "me", "role": "object"},
                    {"text": "she", "role": "subject"},
                    {"text": "had", "role": "auxiliary"},
                    {"text": "already", "role": "adverb"},
                    {"text": "eaten", "role": "verb"}
                ],
                "translation_hint": "उसने मुझसे कहा कि उसने पहले ही खा लिया था। / ఆమె ఇప్పటికే తిన్నానని నాకు చెప్పింది.",
                "note": "Direct speech 'I have already eaten' (present perfect) backshifts to 'had eaten' (past perfect)."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "She said me that she was tired.",
                "right": "She told me that she was tired.",
                "explanation": "'Say' cannot be followed directly by a personal object without 'to'. Use 'tell + object' (told me) or 'say + that' (said that)."
            },
            {
                "wrong": "He said he is coming tomorrow.",
                "right": "He said he was coming the next day.",
                "explanation": "Shift tenses (is -> was) and update time markers (tomorrow -> the next day/following day) in reported speech."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Tense Backshifts",
                "body": "Present Simple -> Past Simple | Present Continuous -> Past Continuous | Present Perfect -> Past Perfect | Will -> Would | Can -> Could."
            }
        ],
        "quiz": [
            {
                "q": "Direct: 'I love pizza.' -> Reported: 'He said he ___ pizza.'",
                "options": ["love", "loved", "has loved", "is loving"],
                "answer": 1,
                "explanation": "Present Simple shifts to Past Simple in reported speech."
            },
            {
                "q": "Direct: 'I will call you.' -> Reported: 'She said she ___ call me.'",
                "options": ["will", "would", "calls", "called"],
                "answer": 1,
                "explanation": "'Will' backshifts to the modal 'would'."
            },
            {
                "q": "He ___ me that he had finished the report.",
                "options": ["said", "told", "said to", "spoke"],
                "answer": 1,
                "explanation": "'Told' is followed directly by an indirect personal object (me)."
            },
            {
                "q": "Direct: 'I bought a car.' -> Reported: 'He said he ___ a car.'",
                "options": ["bought", "had bought", "has bought", "buys"],
                "answer": 1,
                "explanation": "Past Simple ('bought') shifts backward to Past Perfect ('had bought')."
            },
            {
                "q": "Which time marker is updated correctly in reported speech?",
                "options": [
                    "yesterday -> yesterday",
                    "tomorrow -> the next day",
                    "now -> then next",
                    "last week -> next week"
                ],
                "answer": 1,
                "explanation": "'Tomorrow' shifts to 'the next day' or 'the following day' to preserve meaning."
            }
        ]
    },
    "mixed_conditionals": {
        "id": "mixed_conditionals",
        "topic": "Mixed Conditionals",
        "level": 3,
        "levelLabel": "Advanced",
        "category": "complex",
        "categoryLabel": "Complex Constructions",
        "categoryEmoji": "🏗️",
        "prerequisites": ["conditional_type_2"],
        "rule": "Mixed conditionals combine different times in the condition and the result. Most commonly, they connect a past hypothetical condition with a present outcome, or a present state with a past outcome.",
        "explanation": "Standard conditionals keep the condition and result in matching timelines. Mixed conditionals break this rule to reflect real-life cause-and-effect across time: e.g. 'If I had studied (past), I would be a doctor now (present).'",
        "formula": "Type A: If + Past Perfect, would + Base Verb | Type B: If + Past Simple, would have + Past Participle",
        "timeline": {"label_left": "Past Unreal Condition", "label_right": "Present Unreal Result", "marker": "Linking past events to present states"},
        "examples": [
            {
                "sentence": "If I had studied harder in school, I would have a better job now.",
                "tokens": [
                    {"text": "If", "role": "conjunction"},
                    {"text": "I", "role": "subject"},
                    {"text": "had", "role": "auxiliary"},
                    {"text": "studied", "role": "verb"},
                    {"text": "harder", "role": "adverb"},
                    {"text": "in", "role": "preposition"},
                    {"text": "school", "role": "noun"},
                    {"text": ",", "role": "preposition"},
                    {"text": "I", "role": "subject"},
                    {"text": "would", "role": "modal"},
                    {"text": "have", "role": "verb"},
                    {"text": "a", "role": "article"},
                    {"text": "better", "role": "adjective"},
                    {"text": "job", "role": "object"},
                    {"text": "now", "role": "adverb"}
                ],
                "translation_hint": "यदि मैंने स्कूल में अधिक पढ़ाई की होती, तो आज मेरे पास एक बेहतर नौकरी होती। / నేను స్కూల్లో బాగా చదివి ఉంటే, ఇప్పుడు నాకు మంచి ఉద్యోగం ఉండేది.",
                "note": "Past condition (had studied) is linked to a present result (would have now)."
            },
            {
                "sentence": "If she weren't so lazy, she would have finished the task yesterday.",
                "tokens": [
                    {"text": "If", "role": "conjunction"},
                    {"text": "she", "role": "subject"},
                    {"text": "weren't", "role": "verb"},
                    {"text": "so", "role": "adverb"},
                    {"text": "lazy", "role": "adjective"},
                    {"text": ",", "role": "preposition"},
                    {"text": "she", "role": "subject"},
                    {"text": "would", "role": "modal"},
                    {"text": "have", "role": "auxiliary"},
                    {"text": "finished", "role": "verb"},
                    {"text": "the", "role": "article"},
                    {"text": "task", "role": "object"},
                    {"text": "yesterday", "role": "adverb"}
                ],
                "translation_hint": "यदि वह इतनी आलसी न होती, तो उसने कल काम पूरा कर लिया होता। / ఆమె అంత బద్ధకస్తురాలు కాకపోతే, నిన్ననే పని పూర్తి చేసేది.",
                "note": "General present character state (weren't lazy) affects a past event (would have finished yesterday)."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "If I had passed the test, I would have been happy now.",
                "right": "If I had passed the test, I would be happy now.",
                "explanation": "If the result is in the present ('now'), do not use 'would have been' (past result). Use 'would be' instead."
            },
            {
                "wrong": "If I didn't spend all my money yesterday, I would buy this today.",
                "right": "If I hadn't spent all my money yesterday, I could buy this today.",
                "explanation": "The condition is in the past (yesterday), so it requires Past Perfect (hadn't spent), not Past Simple (didn't spend)."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Time Anchors",
                "body": "Look closely at time words like 'now', 'today', 'yesterday', or 'last year'. They dictate which tense block to use in each part of the sentence."
            }
        ],
        "quiz": [
            {
                "q": "If I ___ French at school, I would speak it fluently now.",
                "options": ["studied", "had studied", "would study", "study"],
                "answer": 1,
                "explanation": "Past unreal condition (had studied) with present outcome (would speak now)."
            },
            {
                "q": "If she were more organized, she ___ the file yesterday.",
                "options": ["would find", "will find", "would have found", "had found"],
                "answer": 2,
                "explanation": "Present state condition (were) affecting a past outcome (would have found)."
            },
            {
                "q": "I ___ in London today if I hadn't missed my flight.",
                "options": ["would be", "would have been", "will be", "had been"],
                "answer": 0,
                "explanation": "Present result of a past event requires 'would be' + 'today'."
            },
            {
                "q": "If you ___ me, I wouldn't have known what to do.",
                "options": ["didn't help", "hadn't helped", "haven't helped", "don't help"],
                "answer": 1,
                "explanation": "Hypothetical condition in the past requires Past Perfect ('hadn't helped')."
            },
            {
                "q": "If he ___ so rich, he wouldn't have bought that expensive car last week.",
                "options": ["isn't", "wasn't", "weren't", "hadn't been"],
                "answer": 2,
                "explanation": "A permanent present state uses 'weren't' to affect a past action."
            }
        ]
    },
    "subjunctive_mood": {
        "id": "subjunctive_mood",
        "topic": "Subjunctive Mood",
        "level": 3,
        "levelLabel": "Advanced",
        "category": "complex",
        "categoryLabel": "Complex Constructions",
        "categoryEmoji": "🏗️",
        "prerequisites": ["conditional_type_2"],
        "rule": "Use the subjunctive mood to express demands, recommendations, suggestions, or hypothetical situations. It uses the base form of the verb after specific main verbs.",
        "explanation": "The subjunctive mood strips verbs of their standard third-person singular conjugation (no '-s' ending) and represents the verb 'to be' as 'be' for present demands or 'were' for past hypotheticals.",
        "formula": "Subject + Verb (demand/suggest) + that + Subject + Base Verb",
        "timeline": {"label_left": "Demand / Suggestion", "label_right": "Expected action", "marker": "Non-factual or desired state"},
        "examples": [
            {
                "sentence": "The doctor recommended that he rest for a week.",
                "tokens": [
                    {"text": "The", "role": "article"},
                    {"text": "doctor", "role": "subject"},
                    {"text": "recommended", "role": "verb"},
                    {"text": "that", "role": "conjunction"},
                    {"text": "he", "role": "subject"},
                    {"text": "rest", "role": "verb"},
                    {"text": "for", "role": "preposition"},
                    {"text": "a", "role": "article"},
                    {"text": "week", "role": "noun"}
                ],
                "translation_hint": "डॉक्टर ने सिफारिश की कि वह एक सप्ताह के लिए आराम करे। / వైద్యుడు అతను ఒక వారం పాటు విశ్రాంతి తీసుకోవాలని సిఫార్సు చేశాడు.",
                "note": "Subjunctive form 'rest' is used instead of the indicative 'rests' because of 'recommended'."
            },
            {
                "sentence": "I wish I were taller.",
                "tokens": [
                    {"text": "I", "role": "subject"},
                    {"text": "wish", "role": "verb"},
                    {"text": "I", "role": "subject"},
                    {"text": "were", "role": "verb"},
                    {"text": "taller", "role": "adjective"}
                ],
                "translation_hint": "काश मैं और लंबा होता। / నేను ఇంకా పొడవుగా ఉంటే బాగుండు అని కోరుకుంటున్నాను.",
                "note": "Hypothetical 'were' is used instead of 'was' to show a counterfactual wish."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "She insisted that he goes to the meeting.",
                "right": "She insisted that he go to the meeting.",
                "explanation": "Verbs of insistence require the base subjunctive verb form (go), not the third-person indicative (goes)."
            },
            {
                "wrong": "It is essential that they are present.",
                "right": "It is essential that they be present.",
                "explanation": "Adjectives of high importance like 'essential' and 'crucial' require the subjunctive 'be'."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Trigger Verbs",
                "body": "Common subjunctive triggers: insist, demand, recommend, suggest, propose, ask, advise, wish, and adjectives like essential, crucial, vital."
            }
        ],
        "quiz": [
            {
                "q": "The manager demanded that the project ___ finished immediately.",
                "options": ["is", "was", "be", "were"],
                "answer": 2,
                "explanation": "'Demand' triggers the subjunctive, requiring the base verb form 'be'."
            },
            {
                "q": "I suggest that he ___ the truth.",
                "options": ["tells", "tell", "should tell", "told"],
                "answer": 1,
                "explanation": "'Suggest that' requires the subjunctive base verb 'tell'."
            },
            {
                "q": "It is vital that she ___ about this.",
                "options": ["knows", "know", "will know", "is knowing"],
                "answer": 1,
                "explanation": "The adjective phrase 'It is vital that' triggers the subjunctive 'know'."
            },
            {
                "q": "If I ___ you, I would take the job offer.",
                "options": ["was", "were", "am", "would be"],
                "answer": 1,
                "explanation": "Subjunctive 'were' is used for imaginary or advice-giving conditions."
            },
            {
                "q": "The board proposed that the policy ___ changed.",
                "options": ["is", "was", "be", "will be"],
                "answer": 2,
                "explanation": "'Propose' is a trigger for the subjunctive 'be'."
            }
        ]
    },
    "advanced_reported_speech": {
        "id": "advanced_reported_speech",
        "topic": "Advanced Reported Speech",
        "level": 4,
        "levelLabel": "Pro",
        "category": "complex",
        "categoryLabel": "Complex Constructions",
        "categoryEmoji": "🏗️",
        "prerequisites": ["reported_speech_basics", "mixed_conditionals"],
        "rule": "Advanced reported speech utilizes specific reporting verbs (insist, suggest, refuse, deny, admit, complain) followed by gerunds, infinitives, or that-clauses, rather than just using 'say' and 'tell'.",
        "explanation": "Using a variety of reporting verbs adds detail and nuance. For example, instead of saying 'He said he won't go', use 'He refused to go' to show tone and intent directly.",
        "formula": "Subject + Reporting Verb + Infinitive / Gerund / That-clause",
        "timeline": {"label_left": "Action/Dialogue", "label_right": "Nuanced reporting (Later)", "marker": "Expressing speaker attitude in reporting"},
        "examples": [
            {
                "sentence": "He refused to sign the contract.",
                "tokens": [
                    {"text": "He", "role": "subject"},
                    {"text": "refused", "role": "verb"},
                    {"text": "to sign", "role": "infinitive"},
                    {"text": "the", "role": "article"},
                    {"text": "contract", "role": "object"}
                ],
                "translation_hint": "उसने अनुबंध पर हस्ताक्षर करने से इनकार कर दिया। / అతను ఒప్పందంపై సంతకం చేయడానికి నిరాకరించాడు.",
                "note": "Replaces the direct quote 'I will not sign' with a concise infinitive report."
            },
            {
                "sentence": "She suggested postponing the meeting.",
                "tokens": [
                    {"text": "She", "role": "subject"},
                    {"text": "suggested", "role": "verb"},
                    {"text": "postponing", "role": "gerund"},
                    {"text": "the", "role": "article"},
                    {"text": "meeting", "role": "object"}
                ],
                "translation_hint": "उसने बैठक स्थगित करने का सुझाव दिया। / ఆమె సమావేశాన్ని వాయిదా వేయాలని సూచించింది.",
                "note": "Replaces 'Let's postpone the meeting' with 'suggest + gerund'."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "He refused signing the contract.",
                "right": "He refused to sign the contract.",
                "explanation": "The verb 'refuse' must be followed by a to-infinitive, not a gerund."
            },
            {
                "wrong": "She suggested to postpone the meeting.",
                "right": "She suggested postponing the meeting.",
                "explanation": "The verb 'suggest' cannot be followed directly by a to-infinitive. Use a gerund or a that-clause."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Verb Patterns",
                "body": "+ To-Infinitive: refuse, agree, offer, promise, threaten. + Gerund: suggest, deny, admit, recommend."
            }
        ],
        "quiz": [
            {
                "q": "She denied ___ the document.",
                "options": ["to steal", "stealing", "stole", "steal"],
                "answer": 1,
                "explanation": "'Deny' is followed by a gerund (stealing)."
            },
            {
                "q": "They offered ___ us a lift to the airport.",
                "options": ["giving", "to give", "give", "given"],
                "answer": 1,
                "explanation": "'Offer' takes a to-infinitive (to give)."
            },
            {
                "q": "He threatened ___ the police if we didn't leave.",
                "options": ["to call", "calling", "call", "would call"],
                "answer": 0,
                "explanation": "'Threaten' takes a to-infinitive (to call)."
            },
            {
                "q": "She suggested ___ the manager directly.",
                "options": ["to contact", "contacting", "contact", "contacts"],
                "answer": 1,
                "explanation": "'Suggest' is followed by a gerund (contacting)."
            },
            {
                "q": "He insisted ___ for the meal.",
                "options": ["to pay", "on paying", "paying", "for paying"],
                "answer": 1,
                "explanation": "'Insist' is followed by the preposition 'on' and a gerund."
            }
        ]
    },
    # ── Category 5: Connectors & Flow ─────────────────────────────────────
    "basic_conjunctions": {
        "id": "basic_conjunctions",
        "topic": "Basic Conjunctions (and, but, or, so)",
        "level": 1,
        "levelLabel": "Foundation",
        "category": "connectors",
        "categoryLabel": "Connectors & Flow",
        "categoryEmoji": "🔗",
        "prerequisites": [],
        "rule": "Use basic coordinating conjunctions (and, but, or, so) to join words, phrases, or independent clauses of equal importance.",
        "explanation": "These conjunctions show how clauses relate: 'and' adds information, 'but' shows contrast, 'or' presents an alternative, and 'so' shows a result.",
        "formula": "Clause 1 + , + coordinating conjunction + Clause 2",
        "timeline": {"label_left": "Clause A", "label_right": "Clause B", "marker": "Linking independent ideas simply"},
        "examples": [
            {
                "sentence": "I wanted to go, but it was too cold.",
                "tokens": [
                    {"text": "I", "role": "subject"},
                    {"text": "wanted", "role": "verb"},
                    {"text": "to go", "role": "infinitive"},
                    {"text": ",", "role": "preposition"},
                    {"text": "but", "role": "conjunction"},
                    {"text": "it", "role": "subject"},
                    {"text": "was", "role": "verb"},
                    {"text": "too", "role": "adverb"},
                    {"text": "cold", "role": "adjective"}
                ],
                "translation_hint": "मैं जाना चाहता था, लेकिन बहुत ठंड थी। / నేను వెళ్ళాలనుకున్నాను, కానీ చాలా చలిగా ఉంది.",
                "note": "Connects two opposing ideas with 'but'."
            },
            {
                "sentence": "He studied hard, so he passed the exam.",
                "tokens": [
                    {"text": "He", "role": "subject"},
                    {"text": "studied", "role": "verb"},
                    {"text": "hard", "role": "adverb"},
                    {"text": ",", "role": "preposition"},
                    {"text": "so", "role": "conjunction"},
                    {"text": "he", "role": "subject"},
                    {"text": "passed", "role": "verb"},
                    {"text": "the", "role": "article"},
                    {"text": "exam", "role": "object"}
                ],
                "translation_hint": "उसने कड़ी मेहनत की, इसलिए उसने परीक्षा पास कर ली। / అతను కష్టపడి చదివాడు, అందువల్ల అతను పరీక్షలో ఉత్తీర్ణుడయ్యాడు.",
                "note": "Connects cause (studying hard) to effect (passing exam) with 'so'."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "He woke up early, but he ate breakfast.",
                "right": "He woke up early, and he ate breakfast.",
                "explanation": "Use 'and' to connect sequential or non-contrasting actions. 'But' is only for contrasting ideas."
            },
            {
                "wrong": "I was tired, because of I went to bed.",
                "right": "I was tired, so I went to bed.",
                "explanation": "Use 'so' to indicate the logical result of being tired."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "FANBOYS",
                "body": "Remember coordinating conjunctions using FANBOYS: For, And, Nor, But, Or, Yet, So."
            }
        ],
        "quiz": [
            {
                "q": "She wants to buy a car, ___ she doesn't have enough money.",
                "options": ["and", "but", "or", "so"],
                "answer": 1,
                "explanation": "The two clauses express contrast, requiring 'but'."
            },
            {
                "q": "We can eat at home, ___ we can order take-out.",
                "options": ["but", "so", "or", "and"],
                "answer": 2,
                "explanation": "'Or' is used to present alternative options."
            },
            {
                "q": "The train was delayed, ___ I arrived late.",
                "options": ["but", "so", "or", "and"],
                "answer": 1,
                "explanation": "'So' is used to connect a cause to its logical result."
            },
            {
                "q": "I need to buy milk, bread, ___ eggs.",
                "options": ["but", "so", "or", "and"],
                "answer": 3,
                "explanation": "Use 'and' to add items to a final list."
            },
            {
                "q": "He didn't study, ___ he failed the quiz.",
                "options": ["but", "so", "and", "or"],
                "answer": 1,
                "explanation": "'So' links the lack of studying to the result of failing."
            }
        ]
    },
    "subordinating_conjunctions": {
        "id": "subordinating_conjunctions",
        "topic": "Subordinating Conjunctions",
        "level": 2,
        "levelLabel": "Intermediate",
        "category": "connectors",
        "categoryLabel": "Connectors & Flow",
        "categoryEmoji": "🔗",
        "prerequisites": ["basic_conjunctions"],
        "rule": "Use subordinating conjunctions (because, although, if, unless, while, since) to link a dependent clause to an independent clause, showing cause, contrast, time, or condition.",
        "explanation": "A dependent clause cannot stand alone as a sentence. If placed at the beginning of a sentence, follow the dependent clause with a comma (e.g. 'Although it was late, we worked').",
        "formula": "Subordinating Conjunction + Dependent Clause + , + Main Clause",
        "timeline": {"label_left": "Dependent Condition", "label_right": "Independent Outcome", "marker": "Subordination hierarchy"},
        "examples": [
            {
                "sentence": "Although it was raining, they went for a walk.",
                "tokens": [
                    {"text": "Although", "role": "conjunction"},
                    {"text": "it", "role": "subject"},
                    {"text": "was", "role": "verb"},
                    {"text": "raining", "role": "participle"},
                    {"text": ",", "role": "preposition"},
                    {"text": "they", "role": "subject"},
                    {"text": "went", "role": "verb"},
                    {"text": "for", "role": "preposition"},
                    {"text": "a", "role": "article"},
                    {"text": "walk", "role": "object"}
                ],
                "translation_hint": "हालांकि बारिश हो रही थी, वे टहलने गए। / వర్షం పడుతున్నప్పటికీ, వారు నడవడానికి వెళ్ళారు.",
                "note": "Starts with the concession marker 'Although', requiring a comma after the clause."
            },
            {
                "sentence": "We will go unless it rains.",
                "tokens": [
                    {"text": "We", "role": "subject"},
                    {"text": "will", "role": "auxiliary"},
                    {"text": "go", "role": "verb"},
                    {"text": "unless", "role": "conjunction"},
                    {"text": "it", "role": "subject"},
                    {"text": "rains", "role": "verb"}
                ],
                "translation_hint": "हम जाएँगे जब तक कि बारिश न हो। / వర్షం పడకపోతేనే మేము వెళ్తాము.",
                "note": "'Unless' means 'if not'. No comma is needed when the dependent clause is at the end."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "Although he was tired, but he kept working.",
                "right": "Although he was tired, he kept working.",
                "explanation": "Do not combine 'although' and 'but' in the same sentence. Use one or the other."
            },
            {
                "wrong": "We will go to the park unless it doesn't rain.",
                "right": "We will go to the park unless it rains.",
                "explanation": "'Unless' already contains a negative meaning (if it does not). Adding another negative creates a double negative error."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Comma Rule",
                "body": "If the subordinating conjunction starts the sentence, use a comma at the end of the clause. If it is in the middle, no comma is needed."
            }
        ],
        "quiz": [
            {
                "q": "___ we played well, we lost the match.",
                "options": ["Because", "Although", "Unless", "Since"],
                "answer": 1,
                "explanation": "The clause expresses a concession or contrast, requiring 'Although'."
            },
            {
                "q": "We won't go out ___ you finish your homework.",
                "options": ["because", "unless", "although", "while"],
                "answer": 1,
                "explanation": "'Unless' is correct, meaning 'except if' or 'if you don't'."
            },
            {
                "q": "I went to bed early ___ I was exhausted.",
                "options": ["because", "although", "unless", "while"],
                "answer": 0,
                "explanation": "Introduces the direct cause of going to bed early."
            },
            {
                "q": "___ I was walking home, I saw an old friend.",
                "options": ["Unless", "While", "Because", "Although"],
                "answer": 1,
                "explanation": "Use 'While' to indicate an action in progress during which another event happened."
            },
            {
                "q": "You should write down the password ___ you forget it.",
                "options": ["unless", "in case", "although", "until"],
                "answer": 1,
                "explanation": "'In case' is used to describe precautions against possible future situations."
            }
        ]
    },
    "purpose_reason": {
        "id": "purpose_reason",
        "topic": "Purpose & Reason Clauses",
        "level": 2,
        "levelLabel": "Intermediate",
        "category": "connectors",
        "categoryLabel": "Connectors & Flow",
        "categoryEmoji": "🔗",
        "prerequisites": ["basic_conjunctions"],
        "rule": "Use purpose clauses (to, in order to, so that) to explain why an action is done. Use reason clauses (because of, due to, since) to explain the cause.",
        "explanation": "Purpose clauses state goals and intentions. Reason clauses state underlying causes. Pay attention to grammar: 'in order to' is followed by a base verb, while 'due to' is followed by a noun phrase.",
        "formula": "Clause + in order to + Verb | Clause + because of + Noun Phrase",
        "timeline": {"label_left": "Underlying Cause (Reason)", "label_right": "Target Goal (Purpose)", "marker": "Explaining rationale and cause"},
        "examples": [
            {
                "sentence": "He woke up early in order to catch the train.",
                "tokens": [
                    {"text": "He", "role": "subject"},
                    {"text": "woke", "role": "verb"},
                    {"text": "up", "role": "adverb"},
                    {"text": "early", "role": "adverb"},
                    {"text": "in order to", "role": "conjunction"},
                    {"text": "catch", "role": "verb"},
                    {"text": "the", "role": "article"},
                    {"text": "train", "role": "object"}
                ],
                "translation_hint": "ट्रेन पकड़ने के लिए वह जल्दी उठा। / రైలు అందుకోవడానికి అతను త్వరగా నిద్రలేచాడు.",
                "note": "'In order to' states the purpose of waking up early."
            },
            {
                "sentence": "The flight was delayed due to heavy fog.",
                "tokens": [
                    {"text": "The", "role": "article"},
                    {"text": "flight", "role": "subject"},
                    {"text": "was", "role": "auxiliary"},
                    {"text": "delayed", "role": "verb"},
                    {"text": "due to", "role": "preposition"},
                    {"text": "heavy", "role": "adjective"},
                    {"text": "fog", "role": "object"}
                ],
                "translation_hint": "घने कोहरे के कारण उड़ान में देरी हुई। / దట్టమైన పొగమంచు వల్ల విమానం ఆలస్యమైంది.",
                "note": "'Due to' is followed by a noun phrase explaining the cause."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "He went to the shop for buying milk.",
                "right": "He went to the shop to buy milk.",
                "explanation": "Use 'to + infinitive' (or 'in order to') to express the purpose of an action, not 'for + gerund'."
            },
            {
                "wrong": "We cancelled the picnic because of it rained.",
                "right": "We cancelled the picnic because it rained.",
                "explanation": "'Because of' must be followed by a noun phrase. 'Because' must be followed by a full subject-verb clause."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "So that",
                "body": "Use 'so that' before a subject-verb clause, usually containing modal verbs like 'can', 'could', or 'would' (e.g. He left early so that he could buy lunch)."
            }
        ],
        "quiz": [
            {
                "q": "She saved money ___ buy a new laptop.",
                "options": ["for", "to", "because", "so that"],
                "answer": 1,
                "explanation": "Use 'to + infinitive' to express the direct purpose of saving money."
            },
            {
                "q": "The game was postponed ___ the rain.",
                "options": ["because", "due to", "since", "so that"],
                "answer": 1,
                "explanation": "'Due to' is a preposition followed by a noun phrase (the rain) representing a reason."
            },
            {
                "q": "He wore a coat ___ he wouldn't freeze.",
                "options": ["in order to", "because of", "so that", "to"],
                "answer": 2,
                "explanation": "'So that' is followed by a full clause representing the purpose of the action."
            },
            {
                "q": "___ we had no maps, we got lost.",
                "options": ["Since", "Because of", "Due to", "In order to"],
                "answer": 0,
                "explanation": "'Since' acts as a subordinating conjunction introducing a clause of reason."
            },
            {
                "q": "We didn't go out ___ the cold weather.",
                "options": ["because", "since", "because of", "so that"],
                "answer": 2,
                "explanation": "'Because of' is followed by a noun phrase ('the cold weather') rather than a clause."
            }
        ]
    },
    "discourse_markers": {
        "id": "discourse_markers",
        "topic": "Discourse Markers",
        "level": 3,
        "levelLabel": "Advanced",
        "category": "connectors",
        "categoryLabel": "Connectors & Flow",
        "categoryEmoji": "🔗",
        "prerequisites": ["subordinating_conjunctions"],
        "rule": "Use discourse markers (however, furthermore, consequently, nevertheless, on the other hand) to signal relationships between sentences or paragraphs, structuring writing and speech.",
        "explanation": "Discourse markers guide the reader through an argument. They are transition words that are usually followed by a comma when beginning a sentence, or enclosed in semicolons and commas in compound sentences.",
        "formula": "Discourse Marker + , + Clause",
        "timeline": {"label_left": "Argument A", "label_right": "Argument B / Conclusion", "marker": "Signaling logical transition"},
        "examples": [
            {
                "sentence": "Furthermore, the cost of production has decreased.",
                "tokens": [
                    {"text": "Furthermore", "role": "adverb"},
                    {"text": ",", "role": "preposition"},
                    {"text": "the", "role": "article"},
                    {"text": "cost", "role": "subject"},
                    {"text": "of", "role": "preposition"},
                    {"text": "production", "role": "noun"},
                    {"text": "has", "role": "auxiliary"},
                    {"text": "decreased", "role": "verb"}
                ],
                "translation_hint": "इसके अलावा, उत्पादन की लागत कम हो गई है। / అంతేకాకుండా, ఉత్పత్తి వ్యయం తగ్గింది.",
                "note": "'Furthermore' adds new supporting evidence to the argument."
            },
            {
                "sentence": "Consequently, we decided to change our strategy.",
                "tokens": [
                    {"text": "Consequently", "role": "adverb"},
                    {"text": ",", "role": "preposition"},
                    {"text": "we", "role": "subject"},
                    {"text": "decided", "role": "verb"},
                    {"text": "to change", "role": "infinitive"},
                    {"text": "our", "role": "pronoun"},
                    {"text": "strategy", "role": "object"}
                ],
                "translation_hint": "नतीजतन, हमने अपनी रणनीति बदलने का फैसला किया। / ఫలితంగా, మేము మా వ్యూహాన్ని మార్చాలని నిర్ణయించుకున్నాము.",
                "note": "'Consequently' connects a previous event directly to this decision as a result."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "We wanted to leave however the weather was bad.",
                "right": "We wanted to leave; however, the weather was bad.",
                "explanation": "Do not use 'however' as a simple coordinating conjunction with just a comma. It must follow a semicolon or period, and be followed by a comma."
            },
            {
                "wrong": "Furthermore of his explanation, he showed us some slides.",
                "right": "Furthermore, he showed us some slides.",
                "explanation": "'Furthermore' is an adverb and cannot be followed by an 'of' phrase. Use it as a standalone sentence connector."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Adding vs. Contrasting",
                "body": "Addition: furthermore, in addition, moreover. Contrast: however, nevertheless, on the other hand. Result: consequently, therefore, as a result."
            }
        ],
        "quiz": [
            {
                "q": "The product is popular; ___, its profits are low.",
                "options": ["furthermore", "however", "consequently", "therefore"],
                "answer": 1,
                "explanation": "Introduces a contrasting point, making 'however' the correct choice."
            },
            {
                "q": "We didn't meet our target. ___, the budget will be cut.",
                "options": ["However", "Nevertheless", "Consequently", "On the other hand"],
                "answer": 2,
                "explanation": "The second statement is a direct result of the first, requiring 'Consequently'."
            },
            {
                "q": "The software is fast. ___, it is highly secure.",
                "options": ["Therefore", "Furthermore", "On the contrary", "Nevertheless"],
                "answer": 1,
                "explanation": "Adds another positive point to support the software, requiring 'Furthermore'."
            },
            {
                "q": "Which discourse marker signals a contrast?",
                "options": ["Moreover", "Therefore", "Nevertheless", "As a result"],
                "answer": 2,
                "explanation": "'Nevertheless' means 'in spite of that', signaling a contrast."
            },
            {
                "q": "I was very tired; ___, I finished the work.",
                "options": ["therefore", "nevertheless", "consequently", "moreover"],
                "answer": 1,
                "explanation": "Signals that the action occurred despite being tired (contrast/concession)."
            }
        ]
    },
    "concession_contrast": {
        "id": "concession_contrast",
        "topic": "Concession & Contrast",
        "level": 3,
        "levelLabel": "Advanced",
        "category": "connectors",
        "categoryLabel": "Connectors & Flow",
        "categoryEmoji": "🔗",
        "prerequisites": ["subordinating_conjunctions"],
        "rule": "Express concession and contrast using subordinating conjunctions (while, whereas, although) or prepositions (despite, in spite of) followed by noun phrases or gerunds.",
        "explanation": "Prepositions like 'despite' and 'in spite of' cannot be followed by a subject-verb clause. Instead, they require a noun phrase or gerund. Conjunctions like 'whereas' connect two contrasting clauses directly.",
        "formula": "Despite + Noun/Gerund + , + Main Clause | Clause + whereas + Clause",
        "timeline": {"label_left": "Opposing circumstance", "label_right": "Fact/Result", "marker": "Contrasting facts or concessions"},
        "examples": [
            {
                "sentence": "Despite the cold weather, she went for a swim.",
                "tokens": [
                    {"text": "Despite", "role": "preposition"},
                    {"text": "the", "role": "article"},
                    {"text": "cold", "role": "adjective"},
                    {"text": "weather", "role": "object"},
                    {"text": ",", "role": "preposition"},
                    {"text": "she", "role": "subject"},
                    {"text": "went", "role": "verb"},
                    {"text": "for", "role": "preposition"},
                    {"text": "a", "role": "article"},
                    {"text": "swim", "role": "noun"}
                ],
                "translation_hint": "ठंड के मौसम के बावजूद, वह तैरने चली गई। / చలి వాతావరణం ఉన్నప్పటికీ, ఆమె ఈత కొట్టడానికి వెళ్లింది.",
                "note": "'Despite' is a preposition followed by the noun phrase 'the cold weather'."
            },
            {
                "sentence": "He loves history, whereas his brother prefers science.",
                "tokens": [
                    {"text": "He", "role": "subject"},
                    {"text": "loves", "role": "verb"},
                    {"text": "history", "role": "object"},
                    {"text": ",", "role": "preposition"},
                    {"text": "whereas", "role": "conjunction"},
                    {"text": "his", "role": "pronoun"},
                    {"text": "brother", "role": "subject"},
                    {"text": "prefers", "role": "verb"},
                    {"text": "science", "role": "object"}
                ],
                "translation_hint": "उन्हें इतिहास पसंद है, जबकि उनके भाई को विज्ञान पसंद है। / అతను చరిత్రను ప్రేమిస్తాడు, అయితే అతని సోదరుడు సైన్స్‌ను ఇష్టపడతాడు.",
                "note": "'Whereas' compares and contrasts two distinct active clauses."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "Despite it was cold, they went hiking.",
                "right": "Although it was cold, they went hiking.",
                "explanation": "Do not follow 'despite' with a subject-verb clause. Use 'although', or change the clause to a noun (e.g. Despite the cold)."
            },
            {
                "wrong": "In spite the delay, we arrived on time.",
                "right": "In spite of the delay, we arrived on time.",
                "explanation": "Always write the preposition as three words: 'in spite of'."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Using Clause Form",
                "body": "To follow 'despite' or 'in spite of' with a clause, use the linking phrase 'the fact that' (e.g. Despite the fact that it was raining, they went out)."
            }
        ],
        "quiz": [
            {
                "q": "___ the traffic, we arrived on time.",
                "options": ["Although", "Despite", "Whereas", "While"],
                "answer": 1,
                "explanation": "Followed by a noun phrase ('the traffic'), requiring the preposition 'Despite'."
            },
            {
                "q": "I prefer tea, ___ my husband prefers coffee.",
                "options": ["despite", "in spite of", "whereas", "although"],
                "answer": 2,
                "explanation": "Compares two contrasting clauses directly, using 'whereas'."
            },
            {
                "q": "___ of having little experience, she got the job.",
                "options": ["Despite", "In spite", "Although", "Whereas"],
                "answer": 1,
                "explanation": "Only 'In spite' takes the preposition 'of' ('In spite of')."
            },
            {
                "q": "___ he was wealthy, he lived in a small apartment.",
                "options": ["Despite", "In spite of", "Although", "Whereas"],
                "answer": 2,
                "explanation": "Followed by a full subject-verb clause, requiring the conjunction 'Although'."
            },
            {
                "q": "She went to work ___ the fact that she was sick.",
                "options": ["despite", "although", "whereas", "while"],
                "answer": 0,
                "explanation": "'Despite' fits perfectly before the phrase 'the fact that'."
            }
        ]
    },
    "advanced_cohesion": {
        "id": "advanced_cohesion",
        "topic": "Advanced Cohesion",
        "level": 4,
        "levelLabel": "Pro",
        "category": "connectors",
        "categoryLabel": "Connectors & Flow",
        "categoryEmoji": "🔗",
        "prerequisites": ["discourse_markers", "concession_contrast"],
        "rule": "Maintain textual cohesion using advanced techniques such as referencing, nominal substitution, ellipsis, and complex linkers (notwithstanding, in light of, given).",
        "explanation": "Cohesion is the glue that binds writing. Advanced writers avoid repetition by using ellipsis (omitting understood words) and substitution, while using formal linking expressions to show logical progression.",
        "formula": "Linking phrase + Noun phrase + , + Main Clause",
        "timeline": {"label_left": "Context / Circumstance", "label_right": "Logical outcome", "marker": "Flowing arguments together seamlessly"},
        "examples": [
            {
                "sentence": "Notwithstanding the high entry cost, the product sold out.",
                "tokens": [
                    {"text": "Notwithstanding", "role": "preposition"},
                    {"text": "the", "role": "article"},
                    {"text": "high", "role": "adjective"},
                    {"text": "entry", "role": "noun"},
                    {"text": "cost", "role": "object"},
                    {"text": ",", "role": "preposition"},
                    {"text": "the", "role": "article"},
                    {"text": "product", "role": "subject"},
                    {"text": "sold", "role": "verb"},
                    {"text": "out", "role": "adverb"}
                ],
                "translation_hint": "प्रवेश की ऊंची कीमत के बावजूद, उत्पाद बिक गया। / అధిక ప్రవేశ ధర ఉన్నప్పటికీ, ఉత్పత్తి అమ్ముడుపోయింది.",
                "note": "'Notwithstanding' is a highly formal preposition meaning 'despite'."
            },
            {
                "sentence": "In light of recent events, we must adjust our plans.",
                "tokens": [
                    {"text": "In light of", "role": "preposition"},
                    {"text": "recent", "role": "adjective"},
                    {"text": "events", "role": "object"},
                    {"text": ",", "role": "preposition"},
                    {"text": "we", "role": "subject"},
                    {"text": "must", "role": "modal"},
                    {"text": "adjust", "role": "verb"},
                    {"text": "our", "role": "pronoun"},
                    {"text": "plans", "role": "object"}
                ],
                "translation_hint": "हाल की घटनाओं के आलोक में, हमें अपनी योजनाओं को समायोजित करना होगा। / ఇటీవలి సంఘటనల వెలుగులో, మేము మా ప్రణాళికలను సర్దుబాటు చేయాలి.",
                "note": "Uses a compound preposition to introduce a contextual reason."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "Notwithstanding that it was expensive, but they bought it.",
                "right": "Notwithstanding that it was expensive, they bought it.",
                "explanation": "Do not add a coordinating conjunction like 'but' after an introductory concessive clause."
            },
            {
                "wrong": "Given to the circumstances, we agreed to help.",
                "right": "Given the circumstances, we agreed to help.",
                "explanation": "The preposition 'Given' does not take 'to'. It is followed directly by the noun phrase."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Ellipsis",
                "body": "Ellipsis means leaving out words that are obvious from context (e.g. He likes tea, and she [likes] coffee) to improve readability."
            }
        ],
        "quiz": [
            {
                "q": "___ the negative feedback, the project went ahead.",
                "options": ["Notwithstanding", "In light of", "Given", "Although"],
                "answer": 0,
                "explanation": "'Notwithstanding' functions as a preposition meaning 'despite', which fits the noun phrase."
            },
            {
                "q": "___ the lack of evidence, the suspect was released.",
                "options": ["Given", "Notwithstanding", "Although", "While"],
                "answer": 0,
                "explanation": "'Given' means 'considering', which fits the context of releasing the suspect due to lack of evidence."
            },
            {
                "q": "The first system failed; the second ___ was successful.",
                "options": ["one", "system", "that", "it"],
                "answer": 0,
                "explanation": "Uses nominal substitution ('one' replacing 'system') to avoid repetition."
            },
            {
                "q": "___ the findings, the board decided to invest.",
                "options": ["In light of", "Notwithstanding", "Although", "Given to"],
                "answer": 0,
                "explanation": "'In light of' means 'considering the facts of', representing the rationale for investing."
            },
            {
                "q": "He ordered chicken, and she ___ fish.",
                "options": ["ordered", "did", "so", "took"],
                "answer": 0,
                "explanation": "A sentence showing ellipsis, where 'ordered' can be omitted: 'and she fish' or replaced with 'ordered'."
            }
        ]
    },
    # ── Category 6: Style & Register ──────────────────────────────────────
    "formal_informal": {
        "id": "formal_informal",
        "topic": "Formal vs Informal Basics",
        "level": 1,
        "levelLabel": "Foundation",
        "category": "style",
        "categoryLabel": "Style & Register",
        "categoryEmoji": "🎭",
        "prerequisites": [],
        "rule": "Adapt your vocabulary and grammar depending on the audience: use active verbs, short sentences, and contractions for informal style; use passive voice, full forms, and precise vocabulary for formal style.",
        "explanation": "Register refers to the level of formality in language. Informal register is common in spoken English, texting, and casual emails. Formal register is expected in business writing, academic papers, and official settings.",
        "formula": "Formal: Subject + Verb (precise) + Object (no contractions) | Informal: contractions + phrasal verbs",
        "timeline": {"label_left": "Informal (Friends)", "label_right": "Formal (Business/Academic)", "marker": "Spectrum of formality"},
        "examples": [
            {
                "sentence": "I am writing to inform you that we have received your request.",
                "tokens": [
                    {"text": "I", "role": "subject"},
                    {"text": "am writing", "role": "verb"},
                    {"text": "to inform", "role": "infinitive"},
                    {"text": "you", "role": "object"},
                    {"text": "that", "role": "conjunction"},
                    {"text": "we", "role": "subject"},
                    {"text": "have received", "role": "verb"},
                    {"text": "your", "role": "pronoun"},
                    {"text": "request", "role": "object"}
                ],
                "translation_hint": "मैं आपको सूचित करने के लिए लिख रहा हूँ कि हमें आपका अनुरोध प्राप्त हो गया है। / మీ అభ్యర్థన మాకు అందిందని మీకు తెలియజేయడానికి నేను వ్రాస్తున్నాను.",
                "note": "Uses formal vocabulary (inform, receive) and full verb forms (I am, we have) instead of contractions."
            },
            {
                "sentence": "Just wanted to let you know we got your email.",
                "tokens": [
                    {"text": "Just", "role": "adverb"},
                    {"text": "wanted", "role": "verb"},
                    {"text": "to let", "role": "infinitive"},
                    {"text": "you", "role": "subject"},
                    {"text": "know", "role": "verb"},
                    {"text": "we", "role": "subject"},
                    {"text": "got", "role": "verb"},
                    {"text": "your", "role": "pronoun"},
                    {"text": "email", "role": "object"}
                ],
                "translation_hint": "बस आपको बताना चाहता था कि हमें आपका ईमेल मिल गया है। / మీ ఈమెయిల్ మాకు అందిందని మీకు తెలియజేయాలనుకుంటున్నాను.",
                "note": "Uses informal vocabulary (let you know, got) and ellipsis (omitting 'I')."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "Dear Sir, I wanna ask for a refund.",
                "right": "Dear Sir or Madam, I am writing to request a refund.",
                "explanation": "Avoid slang and contractions like 'wanna' or 'gonna' in professional emails or official correspondence."
            },
            {
                "wrong": "Thanks for your email, we will send the stuff soon.",
                "right": "Thank you for your email; we will dispatch the materials shortly.",
                "explanation": "Replace informal terms like 'stuff' and 'soon' with precise words like 'materials' and 'shortly' in formal contexts."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Contractions",
                "body": "Avoid using contractions (don't, won't, I'm) in formal academic or professional writing. Write out full forms (do not, will not, I am)."
            }
        ],
        "quiz": [
            {
                "q": "Which of the following is the most formal way to ask for assistance?",
                "options": [
                    "Can you help me?",
                    "Give me a hand, please.",
                    "I would be grateful if you could assist me.",
                    "Could you do me a favor?"
                ],
                "answer": 2,
                "explanation": "Uses conditional structures and formal vocabulary ('grateful', 'assist') to show high respect."
            },
            {
                "q": "Which sentence is appropriate for a casual text message to a friend?",
                "options": [
                    "I regret to inform you that I cannot attend.",
                    "Sorry, can't make it tonight!",
                    "I am writing to apologize for my absence.",
                    "Please accept my apologies for not attending."
                ],
                "answer": 1,
                "explanation": "Uses contractions ('can't') and colloquial language ('make it'), suitable for casual communication."
            },
            {
                "q": "Formal writing generally avoids ___.",
                "options": ["passive voice", "contractions", "long sentences", "complex tenses"],
                "answer": 1,
                "explanation": "Contractions (like won't, can't) are markers of informal speech and are avoided in formal texts."
            },
            {
                "q": "Replace the informal verb 'get' in a formal report: 'We need to get more data.'",
                "options": ["obtain", "grab", "fetch", "buy"],
                "answer": 0,
                "explanation": "'Obtain' is the precise, formal equivalent of the general verb 'get'."
            },
            {
                "q": "Identify the formal sentence:",
                "options": [
                    "The plan went down well.",
                    "The proposal was received favorably.",
                    "They liked the idea a lot.",
                    "The project was super cool."
                ],
                "answer": 1,
                "explanation": "Uses formal passive construction ('was received') and appropriate vocabulary ('favorably')."
            }
        ]
    },
    "phrasal_verbs": {
        "id": "phrasal_verbs",
        "topic": "Phrasal Verbs",
        "level": 2,
        "levelLabel": "Intermediate",
        "category": "style",
        "categoryLabel": "Style & Register",
        "categoryEmoji": "🎭",
        "prerequisites": ["formal_informal"],
        "rule": "A phrasal verb is a combination of a base verb and a particle (preposition or adverb) that creates a meaning different from the original words.",
        "explanation": "Phrasal verbs are highly common in informal English. In formal situations, they are often replaced by a single, more precise verb (e.g. 'find out' becomes 'discover', 'put off' becomes 'postpone').",
        "formula": "Verb + Particle (Preposition/Adverb)",
        "timeline": {"label_left": "Verb (e.g. look)", "label_right": "New Meaning (e.g. look after = care)", "marker": "Particle changing verb meaning"},
        "examples": [
            {
                "sentence": "We had to call off the meeting.",
                "tokens": [
                    {"text": "We", "role": "subject"},
                    {"text": "had", "role": "verb"},
                    {"text": "to call", "role": "infinitive"},
                    {"text": "off", "role": "adverb"},
                    {"text": "the", "role": "article"},
                    {"text": "meeting", "role": "object"}
                ],
                "translation_hint": "हमें बैठक रद्द करनी पड़ी। / మేము సమావేశాన్ని రద్దు చేయాల్సి వచ్చింది.",
                "note": "'Call off' is an informal phrasal verb meaning 'to cancel'."
            },
            {
                "sentence": "I need to look into this problem.",
                "tokens": [
                    {"text": "I", "role": "subject"},
                    {"text": "need", "role": "verb"},
                    {"text": "to look", "role": "infinitive"},
                    {"text": "into", "role": "preposition"},
                    {"text": "this", "role": "adjective"},
                    {"text": "problem", "role": "object"}
                ],
                "translation_hint": "मुझे इस समस्या की जांच करने की आवश्यकता है। / నేను ఈ సమస్యను పరిశీలించాల్సిన అవసరం ఉంది.",
                "note": "'Look into' is a phrasal verb meaning 'to investigate'."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "Please cancel off the meeting.",
                "right": "Please call off the meeting.",
                "explanation": "Do not mix phrasal verbs and their single-verb synonyms. 'Cancel' is a standalone verb and does not need 'off'."
            },
            {
                "wrong": "He looked the word up in dictionary.",
                "right": "He looked the word up in the dictionary.",
                "explanation": "Ensure separable phrasal verbs place pronouns correctly. If using a pronoun, it must go in the middle (e.g. Look it up, not Look up it)."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Separability",
                "body": "Some phrasal verbs can be separated by the object (e.g. Turn the light off / Turn off the light). If the object is a pronoun (it/them), it must go in the middle (e.g. Turn it off)."
            }
        ],
        "quiz": [
            {
                "q": "The business will ___ new staff next month.",
                "options": ["take on", "take off", "take up", "take in"],
                "answer": 0,
                "explanation": "'Take on' means to recruit or employ new workers."
            },
            {
                "q": "We need to ___ a solution to this issue.",
                "options": ["come up with", "come across", "come along", "come round"],
                "answer": 0,
                "explanation": "'Come up with' means to think of or produce an idea/solution."
            },
            {
                "q": "If you don't know the word, ___ in the dictionary.",
                "options": ["look up it", "look it up", "look for it", "look it down"],
                "answer": 1,
                "explanation": "'Look up' is separable; pronouns must go between the verb and the particle ('look it up')."
            },
            {
                "q": "They had to ___ the football match due to rain.",
                "options": ["call off", "put off", "hold up", "go off"],
                "answer": 0,
                "explanation": "'Call off' means to cancel a scheduled event."
            },
            {
                "q": "Could you ___ the volume? I can't hear anything.",
                "options": ["turn down", "turn up", "turn on", "turn off"],
                "answer": 1,
                "explanation": "'Turn up' means to increase the volume or intensity of something."
            }
        ]
    },
    "hedging_softening": {
        "id": "hedging_softening",
        "topic": "Hedging & Softening",
        "level": 2,
        "levelLabel": "Intermediate",
        "category": "style",
        "categoryLabel": "Style & Register",
        "categoryEmoji": "🎭",
        "prerequisites": ["formal_informal"],
        "rule": "Use hedging (cautious language like 'seems', 'tends to', 'perhaps', 'likely') to soften claims and avoid sounding too blunt or dogmatic.",
        "explanation": "Hedging is crucial in both professional negotiations and academic writing. It shows politeness, opens room for discussion, and protects the writer from being proven wrong.",
        "formula": "Subject + modal/verb (seems/tends) + to + Base Verb",
        "timeline": {"label_left": "Direct / Blunt (e.g. You are wrong)", "label_right": "Hedged / Soft (e.g. It appears there is a misunderstanding)", "marker": "Degree of assertiveness"},
        "examples": [
            {
                "sentence": "The data suggests that temperature is rising.",
                "tokens": [
                    {"text": "The", "role": "article"},
                    {"text": "data", "role": "subject"},
                    {"text": "suggests", "role": "verb"},
                    {"text": "that", "role": "conjunction"},
                    {"text": "temperature", "role": "subject"},
                    {"text": "is", "role": "auxiliary"},
                    {"text": "rising", "role": "verb"}
                ],
                "translation_hint": "आंकड़े बताते हैं कि तापमान बढ़ रहा है। / ఉష్ణోగ్రత పెరుగుతోందని డేటా సూచిస్తుంది.",
                "note": "Uses the hedge verb 'suggests' instead of the dogmatic 'proves' or 'shows'."
            },
            {
                "sentence": "It could be that we made a mistake.",
                "tokens": [
                    {"text": "It", "role": "subject"},
                    {"text": "could", "role": "modal"},
                    {"text": "be", "role": "verb"},
                    {"text": "that", "role": "conjunction"},
                    {"text": "we", "role": "subject"},
                    {"text": "made", "role": "verb"},
                    {"text": "a", "role": "article"},
                    {"text": "mistake", "role": "object"}
                ],
                "translation_hint": "ऐसा हो सकता है कि हमने कोई गलती की हो। / బహుశా మేము తప్పు చేసి ఉండవచ్చు.",
                "note": "Uses the modal 'could' to soften the admission of error."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "This is a wrong decision.",
                "right": "This decision appears to be slightly problematic.",
                "explanation": "Avoid blunt declarations in workplace communications. Softening makes criticism constructive and professional."
            },
            {
                "wrong": "The drug will cure the disease.",
                "right": "The drug is likely to alleviate the symptoms.",
                "explanation": "In scientific or medical contexts, make cautious claims to maintain accuracy and avoid false guarantees."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Hedging Tools",
                "body": "Use modal verbs (may, might, could), verbs of appearance (seem, appear), adverbs (likely, perhaps), and tentative verbs (suggest, indicate)."
            }
        ],
        "quiz": [
            {
                "q": "Which sentence shows the best hedging for an academic paper?",
                "options": [
                    "This proves that the policy is a failure.",
                    "The policy is clearly wrong.",
                    "The findings suggest that the policy may not be fully effective.",
                    "It is certain that the policy fails."
                ],
                "answer": 2,
                "explanation": "Uses cautious expressions ('suggest', 'may not be', 'fully') to qualify the statement."
            },
            {
                "q": "How can you soften the request: 'Send me the report now'?",
                "options": [
                    "I demand the report.",
                    "I wonder if you could send me the report when you have a moment.",
                    "Send the report as soon as possible.",
                    "You should send the report."
                ],
                "answer": 1,
                "explanation": "Uses tentative questioning ('I wonder if you could') to sound polite and respectful of the recipient's schedule."
            },
            {
                "q": "Which modal verb is most commonly used for hedging possibility?",
                "options": ["must", "may", "will", "shall"],
                "answer": 1,
                "explanation": "'May' expresses possibility rather than certainty, making it a classic hedging tool."
            },
            {
                "q": "Complete the hedged claim: 'The cost ___ increase next quarter.'",
                "options": ["will definitely", "is bound to", "is likely to", "must"],
                "answer": 2,
                "explanation": "'Is likely to' introduces probability instead of absolute certainty."
            },
            {
                "q": "Which verb is used to hedge observations?",
                "options": ["prove", "seem", "know", "guarantee"],
                "answer": 1,
                "explanation": "'Seem' describes impressions and appearances, softening direct claims."
            }
        ]
    },
    "nominalisation": {
        "id": "nominalisation",
        "topic": "Nominalisation",
        "level": 3,
        "levelLabel": "Advanced",
        "category": "style",
        "categoryLabel": "Style & Register",
        "categoryEmoji": "🎭",
        "prerequisites": ["phrasal_verbs"],
        "rule": "Nominalisation is the process of turning verbs or adjectives into nouns. This structure is heavily used in formal, academic, and business writing to make statements sound objective.",
        "explanation": "Nominalisation changes the focus of the sentence from the person performing the action to the action itself. For example, 'We analyzed the data' (active verb) becomes 'An analysis of the data was conducted' (nominalised noun).",
        "formula": "Active Verb Clause -> Noun Phrase + Passive/Linking Verb",
        "timeline": {"label_left": "Verb-focused (We decided)", "label_right": "Noun-focused (A decision was made)", "marker": "Shifting focus to abstract concepts"},
        "examples": [
            {
                "sentence": "The discovery of the vaccine changed the course of the pandemic.",
                "tokens": [
                    {"text": "The", "role": "article"},
                    {"text": "discovery", "role": "subject"},
                    {"text": "of", "role": "preposition"},
                    {"text": "the", "role": "article"},
                    {"text": "vaccine", "role": "noun"},
                    {"text": "changed", "role": "verb"},
                    {"text": "the", "role": "article"},
                    {"text": "course", "role": "object"},
                    {"text": "of", "role": "preposition"},
                    {"text": "the", "role": "article"},
                    {"text": "pandemic", "role": "noun"}
                ],
                "translation_hint": "टीके की खोज ने महामारी की दिशा बदल दी। / వ్యాక్సిన్ ఆవిష్కరణ మహమ్మారి గమనాన్ని మార్చింది.",
                "note": "Uses the noun 'discovery' instead of the active verb 'They discovered the vaccine'."
            },
            {
                "sentence": "Their refusal to cooperate led to the cancellation of the project.",
                "tokens": [
                    {"text": "Their", "role": "pronoun"},
                    {"text": "refusal", "role": "subject"},
                    {"text": "to cooperate", "role": "infinitive"},
                    {"text": "led", "role": "verb"},
                    {"text": "to", "role": "preposition"},
                    {"text": "the", "role": "article"},
                    {"text": "cancellation", "role": "object"},
                    {"text": "of", "role": "preposition"},
                    {"text": "the", "role": "article"},
                    {"text": "project", "role": "noun"}
                ],
                "translation_hint": "उनके सहयोग करने से इनकार के कारण परियोजना को रद्द करना पड़ा। / వారు సహకరించడానికి నిరాకరించడం వల్ల ప్రాజెక్ట్ రద్దుకు దారితీసింది.",
                "note": "Uses nouns 'refusal' and 'cancellation' instead of active verbs 'refused' and 'cancelled'."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "We need to solve this problem because it is very important.",
                "right": "The solution to this problem is of high importance.",
                "explanation": "In formal reporting, nominalising 'solve' into 'solution' creates a more professional and objective tone."
            },
            {
                "wrong": "The government decided to build a road, which was good.",
                "right": "The decision to build a road was well-received by the public.",
                "explanation": "Nominalising 'decide' into 'decision' helps structure arguments around actions and policies rather than personal actors."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Creating Nouns",
                "body": "Look for common noun suffixes: -tion (produce -> production), -ment (develop -> development), -ance (resist -> resistance), -ity (active -> activity)."
            }
        ],
        "quiz": [
            {
                "q": "Nominalise the verb in: 'We analyzed the results.'",
                "options": [
                    "An analysis of the results was conducted.",
                    "We did an analyzing of results.",
                    "The results were analyzed by us.",
                    "We have results analysis."
                ],
                "answer": 0,
                "explanation": "'Analysis' is the noun form of 'analyze', creating a nominalised sentence."
            },
            {
                "q": "Identify the nominalised noun in: 'The creation of the website took three weeks.'",
                "options": ["website", "creation", "weeks", "took"],
                "answer": 1,
                "explanation": "'Creation' is the nominalised noun formed from the verb 'create'."
            },
            {
                "q": "Which sentence uses nominalisation to achieve a formal tone?",
                "options": [
                    "They reacted angrily to the news.",
                    "Their angry reaction to the news caused concern.",
                    "He was angry about the news.",
                    "They got mad when they heard the news."
                ],
                "answer": 1,
                "explanation": "Uses the noun phrase 'Their angry reaction' as the subject of the sentence."
            },
            {
                "q": "What is the nominalised form of the adjective 'stable'?",
                "options": ["stably", "stabilize", "stability", "stableness"],
                "answer": 2,
                "explanation": "'Stability' is the standard abstract noun form of the adjective 'stable'."
            },
            {
                "q": "Nominalise the verb in: 'They failed to complete the task.'",
                "options": [
                    "The failure to complete the task was problematic.",
                    "They did not complete the task.",
                    "They had a failure of task.",
                    "The task was a complete failure."
                ],
                "answer": 0,
                "explanation": "Turns 'failed' into the noun 'failure', shifting focus to the concept of failure."
            }
        ]
    },
    "emphasis_techniques": {
        "id": "emphasis_techniques",
        "topic": "Emphasis Techniques",
        "level": 3,
        "levelLabel": "Advanced",
        "category": "style",
        "categoryLabel": "Style & Register",
        "categoryEmoji": "🎭",
        "prerequisites": ["hedging_softening"],
        "rule": "Use emphasis techniques such as emphatic auxiliary 'do', fronting, and adverbial intensifiers (utterly, deeply, highly) to highlight critical information.",
        "explanation": "Emphatic structures show strong feeling or certainty. In speech, we stress the words. In writing, we use grammatical adjustments like 'I do agree' (instead of just 'I agree') or fronting a prepositional phrase.",
        "formula": "Subject + emphatic do/does/did + Base Verb | Intensifier + Adjective",
        "timeline": {"label_left": "Neutral (I want to go)", "label_right": "Emphatic (I do want to go)", "marker": "Intensity of assertion"},
        "examples": [
            {
                "sentence": "I do believe that we need to act now.",
                "tokens": [
                    {"text": "I", "role": "subject"},
                    {"text": "do", "role": "auxiliary"},
                    {"text": "believe", "role": "verb"},
                    {"text": "that", "role": "conjunction"},
                    {"text": "we", "role": "subject"},
                    {"text": "need", "role": "verb"},
                    {"text": "to act", "role": "infinitive"},
                    {"text": "now", "role": "adverb"}
                ],
                "translation_hint": "मेरा वास्तव में मानना है कि हमें अब कार्रवाई करने की आवश्यकता है। / మేము ఇప్పుడే చర్య తీసుకోవాలని నేను నిజంగా నమ్ముతున్నాను.",
                "note": "Uses the emphatic auxiliary 'do' to emphasize conviction in a statement."
            },
            {
                "sentence": "We are highly concerned about this decision.",
                "tokens": [
                    {"text": "We", "role": "subject"},
                    {"text": "are", "role": "verb"},
                    {"text": "highly", "role": "adverb"},
                    {"text": "concerned", "role": "adjective"},
                    {"text": "about", "role": "preposition"},
                    {"text": "this", "role": "article"},
                    {"text": "decision", "role": "object"}
                ],
                "translation_hint": "हम इस फैसले को लेकर बेहद चिंतित हैं। / ఈ నిర్ణయం పట్ల మేము చాలా ఆందోళన చెందుతున్నాము.",
                "note": "Uses the adverbial intensifier 'highly' to add weight to 'concerned'."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "She does likes the gift.",
                "right": "She does like the gift.",
                "explanation": "When using emphatic 'do/does/did', follow it with the base form of the verb. Do not add '-s' to 'like'."
            },
            {
                "wrong": "He is very dead.",
                "right": "He is completely dead.",
                "explanation": "Do not use general intensifiers like 'very' with ungradable adjectives. Use absolute intensifiers like 'completely' or 'utterly'."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Gradable vs. Absolute",
                "body": "Gradable adjectives (hot, cold) take 'very' or 'extremely'. Non-gradable/Absolute adjectives (freezing, perfect) take 'completely', 'absolutely', or 'utterly'."
            }
        ],
        "quiz": [
            {
                "q": "Which sentence uses 'do' for emphasis correctly?",
                "options": [
                    "He does wants to come.",
                    "He does want to come.",
                    "He does wanted to come.",
                    "He do want to come."
                ],
                "answer": 1,
                "explanation": "Third person singular emphatic requires 'does' + base verb 'want'."
            },
            {
                "q": "She was ___ devastated by the news.",
                "options": ["very", "extremely", "utterly", "highly"],
                "answer": 2,
                "explanation": "'Devastated' is an absolute adjective, which pairs with absolute intensifiers like 'utterly'."
            },
            {
                "q": "The report was ___ critical of the government's plans.",
                "options": ["utterly", "highly", "absolutely", "completely"],
                "answer": 1,
                "explanation": "'Highly critical' is a standard business and journalistic collocation."
            },
            {
                "q": "I ___ enjoy meeting you today.",
                "options": ["did", "do", "done", "am"],
                "answer": 0,
                "explanation": "Expressing past emphasis requires the past auxiliary 'did' + base verb 'enjoy'."
            },
            {
                "q": "Choose the most intense statement:",
                "options": [
                    "I am very unhappy.",
                    "I am extremely unhappy.",
                    "I am utterly miserable.",
                    "I am unhappy."
                ],
                "answer": 2,
                "explanation": "Combines a strong, non-gradable adjective ('miserable') with an absolute intensifier ('utterly')."
            }
        ]
    },
    "academic_register": {
        "id": "academic_register",
        "topic": "Academic Register",
        "level": 4,
        "levelLabel": "Pro",
        "category": "style",
        "categoryLabel": "Style & Register",
        "categoryEmoji": "🎭",
        "prerequisites": ["nominalisation"],
        "rule": "Academic register requires an objective tone, avoiding personal pronouns (I, we, you), using passive voice, hedging, nominalisation, and precise scholarly vocabulary.",
        "explanation": "Scholarly writing focuses on evidence and theories rather than personal opinions. Instead of writing 'I think this proves that...', write 'These results suggest that...'. Avoid rhetorical questions and emotive adjectives.",
        "formula": "Objective Subject (e.g. The evidence) + tentative verb (e.g. indicates) + that-clause",
        "timeline": {"label_left": "Subjective opinion (I think...)", "label_right": "Objective research (It is hypothesized...)", "marker": "Minimizing personal bias"},
        "examples": [
            {
                "sentence": "It is hypothesized that the variables are correlated.",
                "tokens": [
                    {"text": "It", "role": "subject"},
                    {"text": "is hypothesized", "role": "verb"},
                    {"text": "that", "role": "conjunction"},
                    {"text": "the", "role": "article"},
                    {"text": "variables", "role": "subject"},
                    {"text": "are", "role": "auxiliary"},
                    {"text": "correlated", "role": "adjective"}
                ],
                "translation_hint": "यह परिकल्पना की गई है कि चर सहसंबद्ध हैं। / వేరియబుల్స్ పరస్పర సంబంధం కలిగి ఉన్నాయని ఊహించబడింది.",
                "note": "Uses impersonal passive 'It is hypothesized' instead of 'We think'."
            },
            {
                "sentence": "The experiment demonstrates a significant increase in efficiency.",
                "tokens": [
                    {"text": "The", "role": "article"},
                    {"text": "experiment", "role": "subject"},
                    {"text": "demonstrates", "role": "verb"},
                    {"text": "a", "role": "article"},
                    {"text": "significant", "role": "adjective"},
                    {"text": "increase", "role": "noun"},
                    {"text": "in", "role": "preposition"},
                    {"text": "efficiency", "role": "object"}
                ],
                "translation_hint": "प्रयोग दक्षता में एक महत्वपूर्ण वृद्धि प्रदर्शित करता है। / ప్రయోగం సామర్థ్యంలో గణనీయమైన పెరుగుదలను ప్రదర్శిస్తుంది.",
                "note": "Uses nominalisation ('increase') and objective, third-person presentation."
            }
        ],
        "commonMistakes": [
            {
                "wrong": "I ran the test and saw that it didn't work.",
                "right": "The test was conducted, and no significant reaction was observed.",
                "explanation": "Avoid first-person pronouns (I, we) and informal verbs (saw) in formal scientific reports. Use the passive voice to emphasize the process."
            },
            {
                "wrong": "What will happen if we ignore this? Let's find out.",
                "right": "This study aims to examine the consequences of ignoring this variable.",
                "explanation": "Avoid rhetorical questions, direct appeals to the reader, and phrasal verbs ('find out') in academic publications."
            }
        ],
        "tipCards": [
            {
                "emoji": "💡",
                "title": "Objectivity Rule",
                "body": "Do not write your feelings or guess motivations in research reporting. Use clear data, citations, and cautious hedging to present arguments."
            }
        ],
        "quiz": [
            {
                "q": "Which sentence conforms to the standards of academic register?",
                "options": [
                    "I believe this is a great discovery.",
                    "These findings suggest a potential correlation between the variables.",
                    "We did a test and it was pretty cool.",
                    "You will find that the results are correct."
                ],
                "answer": 1,
                "explanation": "Uses objective phrasing, nominalisation, and hedging ('suggest', 'potential correlation'), avoiding personal pronouns."
            },
            {
                "q": "How should you rewrite 'We think the policy failed' for an academic paper?",
                "options": [
                    "The policy was a massive disaster.",
                    "It is argued that the policy was ineffective.",
                    "We believe the policy didn't succeed.",
                    "The policy was bad, in our opinion."
                ],
                "answer": 1,
                "explanation": "Uses passive reporting ('It is argued') and professional vocabulary ('ineffective') to achieve an objective tone."
            },
            {
                "q": "Which of the following should be avoided in academic register?",
                "options": ["Passive voice", "Hedging", "Phrasal verbs", "Complex nouns"],
                "answer": 2,
                "explanation": "Phrasal verbs (e.g. look into, find out) are considered informal; single-word equivalents are preferred."
            },
            {
                "q": "Select the most objective statement:",
                "options": [
                    "The results were super strange.",
                    "The results was something we did not expect.",
                    "The results deviated significantly from the predicted values.",
                    "We found the results to be weird."
                ],
                "answer": 2,
                "explanation": "Uses precise, non-emotive statistical language ('deviated significantly', 'predicted values')."
            },
            {
                "q": "Replace the first-person clause: 'In this paper, I will discuss...'",
                "options": [
                    "This paper discusses...",
                    "I am writing this paper to discuss...",
                    "You will read in this paper a discussion of...",
                    "We will discuss in this paper..."
                ],
                "answer": 0,
                "explanation": "Making the paper itself the subject ('This paper discusses') is a standard way to avoid first-person pronouns."
            }
        ]
    }
}
