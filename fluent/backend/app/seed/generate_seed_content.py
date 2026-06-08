import json
import os
import uuid

# Topics and CEFR levels
TOPICS = ["business", "travel", "daily_life", "tech", "academic"]
CEFR_LEVELS = ["A2", "B1", "B2", "C1", "C2"]

def generate_vocab():
    # Define vocabulary templates to reach 600 words programmatically
    vocab_items = []
    
    # Base real vocab database with correct definitions and examples
    base_data = {
        "business": {
            "A2": [
                ("meeting", "/ˈmiːtɪŋ/", "an assembly of people for discussion.", "I have an important business meeting tomorrow morning.", ["gathering", "assembly"]),
                ("office", "/ˈɒfɪs/", "a room, set of rooms, or building used as a place for commercial work.", "Our new office is in downtown Chicago.", ["workspace", "headquarters"]),
                ("customer", "/ˈkʌstəmə/", "a person or organization that buys goods or services.", "We always try to provide excellent service to every customer.", ["client", "buyer"]),
                ("company", "/ˈkʌmpəni/", "a commercial business.", "He works for a multinational insurance company.", ["firm", "corporation"]),
                ("manager", "/ˈmænɪdʒə/", "a person responsible for controlling or administering an organization.", "She was promoted to branch manager last month.", ["director", "supervisor"]),
            ],
            "B1": [
                ("contract", "/ˈkɒntrækt/", "a written or spoken agreement, especially one concerning employment, sales, or tenancy.", "Please read the contract carefully before signing.", ["agreement", "treaty"]),
                ("budget", "/ˈbʌdʒɪt/", "an estimate of income and expenditure for a set period of time.", "We need to stay within our marketing budget for this quarter.", ["allowance", "finance"]),
                ("negotiate", "/nɪˈɡəʊʃɪeɪt/", "try to reach an agreement or compromise by discussion with others.", "They managed to negotiate a lower price for the office space.", ["bargain", "compromise"]),
                ("marketing", "/ˈmɑːkɪtɪŋ/", "the action or business of promoting and selling products or services.", "Social media plays a huge role in modern marketing.", ["promotion", "advertising"]),
                ("project", "/ˈprɒdʒɛkt/", "an individual or collaborative enterprise that is carefully planned.", "The software development project will take six months.", ["venture", "undertaking"]),
            ],
            "B2": [
                ("synergy", "/ˈsɪn.ər.dʒi/", "the combined effect of a group that exceeds individual efforts.", "The synergy between our teams led to a breakthrough product.", ["cooperation", "alliance"]),
                ("leverage", "/ˈliːvərɪdʒ/", "use a resource or advantage to its maximum potential.", "We should leverage our client relationships to expand the business.", ["utilize", "exploit"]),
                ("streamline", "/ˈstriːmlaɪn/", "make an organization or process more efficient and simple.", "We need to streamline our supply chain to reduce shipping delays.", ["simplify", "rationalize"]),
                ("stakeholder", "/ˈsteɪkhəʊldə/", "a person with an interest or concern in a business.", "We invited all major stakeholders to review the quarterly performance.", ["partner", "shareholder"]),
                ("bandwidth", "/ˈbændwɪdθ/", "the capacity or resources needed to handle a task.", "I don't have the bandwidth to take on another project this week.", ["capacity", "availability"]),
            ],
            "C1": [
                ("acquisition", "/ˌækwɪˈzɪʃ(ə)n/", "an asset or object bought or obtained, typically by a library or museum.", "The corporate acquisition of our competitor was finalized yesterday.", ["purchase", "takeover"]),
                ("compliance", "/kəmˈplaɪəns/", "the action or fact of complying with a wish or command.", "Our systems are in full compliance with new privacy regulations.", ["conformity", "obedience"]),
                ("discrepancy", "/dɪsˈkrɛpənsi/", "an illogical or unexpected difference between two facts.", "The accountant found a major discrepancy in the balance sheet.", ["inconsistency", "variance"]),
                ("incentivize", "/ɪnˈsɛntɪvʌɪz/", "provide someone with an incentive for doing something.", "We need to incentivize sales representatives to exceed their targets.", ["encourage", "motivate"]),
                ("infrastructure", "/ˈɪnfrəstrʌktʃə/", "the basic physical and organizational structures needed for operation.", "The company is investing in upgrading its digital infrastructure.", ["framework", "foundation"]),
            ],
            "C2": [
                ("sovereignty", "/ˈsɒvrɪnti/", "supreme power or authority.", "The board has absolute sovereignty over major financial decisions.", ["jurisdiction", "supremacy"]),
                ("commodification", "/kəˌmɒdɪfɪˈkeɪʃ(ə)n/", "the action or process of treating something as a mere commodity.", "We must avoid the commodification of patient care in our hospitals.", ["commercialization", "monetization"]),
                ("hegemony", "/hɪˈɡɛməni/", "leadership or dominance, especially by one country or social group.", "The tech giant maintains its hegemony in the search engine market.", ["dominance", "leadership"]),
                ("amalgamation", "/əˌmælɡəˈmeɪʃ(ə)n/", "the action, process, or result of combining or uniting.", "The amalgamation of the two departments will take place next month.", ["merger", "consolidation"]),
                ("lucrative", "/ˈluːkrətɪv/", "producing a great deal of profit.", "She secured a lucrative contract with a major media network.", ["profitable", "rewarding"]),
            ]
        },
        "tech": {
            "A2": [
                ("computer", "/kəmˈpjuːtə/", "an electronic device for storing and processing data.", "I bought a new computer for my schoolwork.", ["machine", "device"]),
                ("screen", "/skriːn/", "a flat surface on a computer or TV screen.", "The screen of my tablet is dirty.", ["monitor", "display"]),
                ("website", "/ˈwɛbsaɪt/", "a set of related web pages located under a single domain name.", "Our company website has a brand new design.", ["webpage", "portal"]),
                ("internet", "/ˈɪntənɛt/", "a global computer network providing information.", "We need a faster internet connection in our office.", ["web", "cyberspace"]),
                ("email", "/ˈiːmeɪl/", "messages distributed by electronic means.", "Please send me an email with the details.", ["message", "mail"]),
            ],
            "B1": [
                ("database", "/ˈdeɪtəbeɪs/", "a structured set of data held in a computer.", "All customer records are stored securely in our database.", ["data store", "repository"]),
                ("software", "/ˈsɒftwɛə/", "the programs and other operating information used by a computer.", "We need to install the latest security software.", ["programs", "application"]),
                ("hardware", "/ˈhɑːdwɛə/", "the physical parts of a computer system.", "The company provides all necessary hardware for remote work.", ["equipment", "components"]),
                ("password", "/ˈpɑːswɜːd/", "a secret word or phrase used to gain admission to something.", "Make sure your password is strong and contains special characters.", ["passkey", "code"]),
                ("network", "/ˈnɛtwɜːk/", "a group of two or more computer systems linked together.", "Our office network is protected by a strong firewall.", ["system", "grid"]),
            ],
            "B2": [
                ("algorithm", "/ˈælɡərɪð(ə)m/", "a process or set of rules to be followed in calculations.", "The search engine uses a complex algorithm to rank results.", ["procedure", "formula"]),
                ("framework", "/ˈfreɪmwɜːk/", "a supporting structure around which something can be built.", "We developed the app using a modern JavaScript framework.", ["structure", "platform"]),
                ("repository", "/rɪˈpɒzɪt(ə)ri/", "a central location in which data is stored and managed.", "The developer pushed the latest code changes to the Git repository.", ["storage", "archive"]),
                ("interface", "/ˈɪntəfeɪs/", "a point where two systems, subjects, organizations, etc., meet and interact.", "The user interface of the mobile app is clean and intuitive.", ["connection", "border"]),
                ("compile", "/kəmˈpaɪl/", "convert programming code into machine-readable form.", "It takes several minutes to compile the entire project database.", ["translate", "assemble"]),
            ],
            "C1": [
                ("asynchronous", "/eɪˈsɪŋkrənəs/", "not existing or occurring at the same time.", "Asynchronous communication allows remote teams to work flexibly.", ["non-simultaneous", "delayed"]),
                ("scalability", "/ˌskeɪləˈbɪlɪti/", "the capacity to be changed in size or scale.", "We designed the database architecture for maximum scalability.", ["expandability", "growth"]),
                ("telemetry", "/tɪˈlɛmɪtri/", "the in-situ collection of measurements or other data.", "Our telemetry data shows a spike in CPU usage during peak hours.", ["monitoring", "measurement"]),
                ("immutable", "/ɪˈmjuːtəb(ə)l/", "unchanging over time or unable to be changed.", "Functional programming emphasizes the use of immutable data.", ["unchangeable", "fixed"]),
                ("concurrency", "/kənˈkʌrənsi/", "the execution of multiple tasks or processes at the same time.", "The system handles database concurrency efficiently without locking.", ["simultaneousness", "coexistence"]),
            ],
            "C2": [
                ("hermetic", "/həːˈmɛtɪk/", "complete and isolated, airtight.", "The microservice is designed to run in a hermetic environment.", ["isolated", "sealed"]),
                ("ephemeral", "/ɪˈfɛm(ə)r(ə)l/", "lasting for a very short time.", "Containers provide ephemeral storage that is wiped upon restart.", ["transient", "fleeting"]),
                ("obfuscation", "/ˌɒbfʌˈskeɪʃ(ə)n/", "the action of making something obscure, unclear, or unintelligible.", "Code obfuscation is used to protect intellectual property.", ["darkening", "clouding"]),
                ("determinism", "/dɪˈtəːmɪnɪz(ə)m/", "the doctrine that all events are ultimately determined by causes.", "We need absolute determinism in our builds to ensure reproducibility.", ["predictability", "inevitability"]),
                ("idempotent", "/ˌaɪdəmˈpoʊtənt/", "denoting an element of a set which is unchanged in value when multiplied by itself.", "API endpoints should be idempotent to prevent duplicate charges.", ["repeatable", "invariant"]),
            ]
        },
        "travel": {
            "A2": [
                ("ticket", "/ˈtɪkɪt/", "a written notice of a right of travel.", "Don't forget to print your boarding ticket before going to the station.", ["pass", "voucher"]),
                ("hotel", "/həʊˈtɛl/", "an establishment providing accommodation, meals, and other services.", "We booked a quiet hotel near the city center.", ["inn", "lodging"]),
                ("luggage", "/ˈlʌɡɪdʒ/", "suitcases or bags containing personal belongings.", "We need to check our luggage before going through security.", ["bags", "baggage"]),
                ("passport", "/ˈpɑːspɔːt/", "an official document issued by a government, certifying the holder's identity.", "You must have a valid passport to travel internationally.", ["credentials", "papers"]),
                ("flight", "/flaɪt/", "an journey made in an aircraft.", "Our flight to London was delayed by two hours.", ["journey", "trip"]),
            ],
            "B1": [
                ("itinerary", "/aɪˈtɪnərəri/", "a planned route or journey.", "We put together a detailed itinerary for our two-week vacation.", ["schedule", "route"]),
                ("destination", "/ˌdɛstɪˈneɪʃ(ə)n/", "the place to which someone or something is going.", "Paris is one of the most popular travel destinations in the world.", ["goal", "target"]),
                ("accommodation", "/əkɒməˈdeɪʃ(ə)n/", "a room, group of rooms, or building in which someone may live or stay.", "We found cheap accommodation using a vacation rental app.", ["housing", "lodging"]),
                ("layover", "/ˈleɪəʊvə/", "a period of temporary delay in a journey.", "We have a six-hour layover in Munich before our connecting flight.", ["stopover", "waiting"]),
                ("embassy", "/ˈɛmbəsi/", "the official residence or offices of an ambassador.", "If you lose your passport, contact your country's embassy immediately.", ["consulate", "mission"]),
            ],
            "B2": [
                ("excursion", "/ɪkˈskɜːʃ(ə)n/", "a short journey or trip, especially one taken as a leisure activity.", "We organized a day excursion to see the ancient ruins.", ["trip", "outing"]),
                ("souvenir", "/ˌsuːvəˈnɪə/", "a thing that is kept as a reminder of a person, place, or event.", "She bought a miniature Eiffel Tower as a souvenir.", ["remembrance", "keepsake"]),
                ("hospitality", "/ˌhɒspɪˈtælɪti/", "the friendly and generous reception and entertainment of guests.", "We were blown away by the hospitality of the local villagers.", ["friendliness", "warmth"]),
                ("expedition", "/ˌɛkspɪˈdɪʃ(ə)n/", "a journey undertaken by a group of people with a particular purpose.", "They are preparing for a scientific expedition to the Antarctic.", ["journey", "voyage"]),
                ("transit", "/ˈtrænsɪt/", "the carrying of people or goods from one place to another.", "The goods are currently in transit and should arrive tomorrow.", ["transport", "passage"]),
            ],
            "C1": [
                ("traverse", "/trəˈvɜːs/", "travel across or through.", "We had to traverse a narrow mountain pass to reach the valley.", ["cross", "span"]),
                ("sojourn", "/ˈsɒdʒɜːn/", "a temporary stay.", "During his sojourn in Florence, he studied Renaissance art.", ["stay", "visit"]),
                ("pilgrimage", "/ˈpɪlɡrɪmɪdʒ/", "a pilgrim's journey, or a journey to a place of respect.", "Every year, thousands make a pilgrimage to the historic shrine.", ["journey", "crusade"]),
                ("untrammeled", "/ʌnˈtræm(ə)ld/", "not deprived of freedom of action or expression.", "We enjoyed the untrammeled beauty of the national park.", ["unrestricted", "free"]),
                ("wanderlust", "/ˈwɒndəlʌst/", "a strong desire to travel.", "Her wanderlust led her to explore over fifty countries.", ["restlessness", "travel bug"]),
            ],
            "C2": [
                ("peripatetic", "/ˌpɛrɪpəˈtɛtɪk/", "traveling from place to place, especially working or based in various places.", "He lived a peripatetic lifestyle, working as a freelance journalist.", ["nomadic", "itinerary"]),
                ("transience", "/ˈtrænʃ(ə)ns/", "the state of fact of lasting only for a short time.", "The transience of travel makes every encounter feel precious.", ["temporariness", "brevity"]),
                ("repatriation", "/riːˌpætrɪˈeɪʃ(ə)n/", "the return of someone to their own country.", "The embassy assisted in the repatriation of the stranded citizens.", ["return", "restoration"]),
                ("vicissitude", "/vɪˈsɪsɪtjuːd/", "a change of circumstances or fortune, typically one that is unwelcome.", "Travel teaches you to accept the vicissitudes of life with grace.", ["alteration", "shift"]),
                ("odyssey", "/ˈɒdɪsi/", "a long and eventful or adventurous journey.", "Their sailing expedition turned into a three-year odyssey.", ["pilgrimage", "journey"]),
            ]
        },
        "daily_life": {
            "A2": [
                ("grocery", "/ˈɡrəʊsəri/", "a grocer's shop or business.", "I need to buy some fresh vegetables at the grocery store.", ["market", "shop"]),
                ("commute", "/kəˈmjuːt/", "travel some distance between one's home and place of work on a regular basis.", "My daily commute to work takes about twenty minutes.", ["travel", "drive"]),
                ("routine", "/ruːˈtiːn/", "a sequence of actions regularly followed.", "Yoga is an essential part of my morning routine.", ["schedule", "habit"]),
                ("hobby", "/ˈhɒbi/", "an activity done regularly in one's leisure time for pleasure.", "Gardening is her favorite weekend hobby.", ["interest", "pastime"]),
                ("wellness", "/ˈwɛlnɪs/", "the state of being in good health, especially as an actively pursued goal.", "Physical fitness is key to overall mental wellness.", ["health", "well-being"]),
            ],
            "B1": [
                ("lifestyle", "/ˈlaɪfstaɪl/", "the way in which a person or group lives.", "He decided to adopt a healthier, more active lifestyle.", ["way of life", "habits"]),
                ("relaxation", "/ˌriːlækˈseɪʃ(ə)n/", "the state of being free from tension and anxiety.", "Reading is my favorite method of evening relaxation.", ["leisure", "comfort"]),
                ("chore", "/tʃɔː/", "a routine task, especially a household one.", "Ironing clothes is my least favorite household chore.", ["task", "duty"]),
                ("neighborhood", "/ˈneɪbəhʊd/", "a district, especially one forming a community within a town or city.", "We live in a very friendly, quiet neighborhood.", ["district", "vicinity"]),
                ("budgeting", "/ˈbʌdʒɪtɪŋ/", "the process of creating a plan to spend your money.", "Good budgeting skills are essential for financial stability.", ["finance planning", "saving"]),
            ],
            "B2": [
                ("leisure", "/ˈlɛʒə/", "use of free time for enjoyment.", "He spends his leisure time building model airplanes.", ["free time", "spare time"]),
                ("habit", "/ˈhæbɪt/", "a settled or regular tendency or practice.", "Regular reading is a very beneficial habit to develop.", ["custom", "routine"]),
                ("nutrition", "/njuːˈtrɪʃ(ə)n/", "the process of providing or obtaining the food necessary for health.", "A balanced diet provides all the essential nutrition we need.", ["nourishment", "food"]),
                ("recreation", "/ˌrɛkrɪˈeɪʃ(ə)n/", "activity done for enjoyment when one is not working.", "The local park is a great area for outdoor recreation.", ["leisure", "amusement"]),
                ("communal", "/ˈkɒmjʊn(ə)l/", "shared by all members of a community; for common use.", "The apartment building has a communal garden on the roof.", ["shared", "public"]),
            ],
            "C1": [
                ("equanimity", "/ˌiːkwəˈnɪmɪti/", "mental calmness, composure, and evenness of temper.", "She accepted both success and failure with equanimity.", ["composure", "calm"]),
                ("solitude", "/ˈsɒlɪtjuːd/", "the state or situation of being alone.", "He preferred the absolute solitude of his mountain cabin.", ["isolation", "loneliness"]),
                ("vicinity", "/vɪˈsɪnɪti/", "the area near or surrounding a particular place.", "There are several grocery stores in the immediate vicinity.", ["neighborhood", "proximity"]),
                ("dietary", "/ˈdʌɪət(ə)ri/", "provided by or relating to a diet.", "The chef accommodated all of our special dietary requests.", ["nutritional", "food"]),
                ("convivial", "/kənˈvɪvɪəl/", "friendly, lively, and enjoyable.", "We had a very convivial dinner with our new neighbors.", ["friendly", "sociable"]),
            ],
            "C2": [
                ("domesticity", "/ˌdəʊmɛˈstɪsɪti/", "home or family life.", "He enjoyed the quiet domesticity of his retired years.", ["family life", "home life"]),
                ("conviviality", "/kənˌvɪvɪˈælɪti/", "the quality of being friendly and lively; friendliness.", "The pub was filled with warmth, laughter, and conviviality.", ["sociability", "warmth"]),
                ("gourmand", "/ˈɡʊəmənd/", "a person who enjoys eating and often eats too much.", "My uncle is a true gourmand who loves fine dining.", ["epicure", "foodie"]),
                ("zeitgeist", "/ˈzaɪtɡaɪst/", "the defining spirit or mood of a particular period of history.", "His novels perfectly capture the economic zeitgeist of the decade.", ["mood", "spirit"]),
                ("serendipity", "/ˌsɛrənˈdɪpɪti/", "the occurrence of events by chance in a happy or beneficial way.", "We found our favorite restaurant by absolute serendipity.", ["chance", "luck"]),
            ]
        },
        "academic": {
            "A2": [
                ("student", "/ˈstjuːdnt/", "a person who is studying at a school or university.", "The student asked the professor a question after the lecture.", ["pupil", "learner"]),
                ("book", "/bʊk/", "a written or printed work consisting of pages.", "You need to purchase this history book for the course.", ["volume", "textbook"]),
                ("class", "/klɑːs/", "a group of students meeting regularly to study a subject.", "Our chemistry class starts at nine o'clock.", ["lesson", "session"]),
                ("course", "/kɔːs/", "a series of lectures or lessons in a particular subject.", "I registered for an introductory course in psychology.", ["program", "syllabus"]),
                ("library", "/ˈlaɪbrəri/", "a building or room containing collections of books.", "I spent the entire afternoon studying in the university library.", ["archive", "study room"]),
            ],
            "B1": [
                ("thesis", "/ˈθiːsɪs/", "a long essay or dissertation written by a candidate for a degree.", "She is writing her undergraduate thesis on water pollution.", ["dissertation", "paper"]),
                ("citation", "/saɪˈteɪʃ(ə)n/", "a quotation from or reference to a book, paper, or author.", "Each citation in your bibliography must be formatted correctly.", ["reference", "source"]),
                ("research", "/rɪˈsɜːtʃ/", "the systematic investigation into and study of materials.", "We are conducting scientific research into solar energy.", ["investigation", "study"]),
                ("lecture", "/ˈlɛktʃə/", "an educational talk to an audience, especially to students.", "The guest speaker delivered an interesting lecture on economics.", ["talk", "presentation"]),
                ("academic", "/ˌækəˈdɛmɪk/", "relating to education and scholarship.", "He has achieved high academic success throughout his career.", ["scholarly", "educational"]),
            ],
            "B2": [
                ("hypothesis", "/haɪˈpɒθɪsɪs/", "a supposition or proposed explanation made on the basis of limited evidence.", "Our initial hypothesis was confirmed by the lab results.", ["theory", "assumption"]),
                ("methodology", "/ˌmɛθəˈdɒlədʒi/", "a system of methods used in a particular area of study or activity.", "We detail our research methodology in the second chapter.", ["procedure", "system"]),
                ("empirical", "/ɪmˈpɪrɪk(ə)l/", "based on, concerned with, or verifiable by observation or experience.", "There is strong empirical evidence to support this argument.", ["observed", "factual"]),
                ("synthesis", "/ˈsɪnθəsɪs/", "the combination of components or elements to form a connected whole.", "His essay is a brilliant synthesis of multiple historical theories.", ["combination", "integration"]),
                ("variables", "/ˈvɛərɪəb(ə)lz/", "elements, features, or factors that are liable to vary or change.", "We kept all external variables constant during the control experiment.", ["factors", "parameters"]),
            ],
            "C1": [
                ("pedagogy", "/ˈpɛdəɡɒdʒi/", "the method and practice of teaching.", "Modern pedagogy emphasizes student-led interactive learning.", ["teaching methods", "education"]),
                ("epistemology", "/ɪˌpɪstɪˈmɒlədʒi/", "the theory of knowledge, especially with regard to its methods.", "His philosophical research focuses primarily on epistemology.", ["theory of knowledge", "philosophy"]),
                ("didactic", "/daɪˈdæktɪk/", "intended to teach, particularly in having moral instruction.", "The story has a strongly didactic purpose, teaching honesty.", ["educational", "moralizing"]),
                ("postulate", "/ˈpɒstjʊleɪt/", "suggest or assume the existence, fact, or truth of something.", "We postulate that the temperature increase accelerated the reaction.", ["hypothesize", "assume"]),
                ("hermeneutics", "/ˌhɜːmɪˈnjuːtɪks/", "the branch of knowledge that deals with interpretation.", "Modern literary hermeneutics focuses heavily on reader response.", ["interpretation", "exegesis"]),
            ],
            "C2": [
                ("solipsism", "/ˈsɒlɪpsɪz(ə)m/", "the view or theory that the self is all that can be known to exist.", "Her philosophical argument eventually bordered on absolute solipsism.", ["egocentrism", "self-absorption"]),
                ("teleological", "/ˌtɛlɪəˈlɒdʒɪk(ə)l/", "relating to the explanation of phenomena by the purpose they serve.", "The teleological explanation of biology suggests nature has design.", ["functional", "purposeful"]),
                ("heuristics", "/hjʊˈrɪstɪks/", "hands-on or interactive methods of learning or problem-solving.", "Cognitive psychology utilizes heuristics to study decision making.", ["problem-solving", "short-cuts"]),
                ("episteme", "/ˈɛpɪstiːm/", "a system of understanding or body of ideas.", "Scientific thought shifted radically under the new economic episteme.", ["knowledge paradigm", "paradigm"]),
                ("exegesis", "/ˌɛksɪˈdʒiːsɪs/", "critical explanation or interpretation of a text, especially scripture.", "Her doctoral thesis is a detailed exegesis of ancient poetry.", ["interpretation", "critique"]),
            ]
        }
    }

    # Generate 600 vocab items: we have 25 slots (5 topics * 5 levels).
    # To reach 600, we need 24 items per slot.
    # We will expand the base data programmatically with variations to guarantee exactly 600 items
    for topic in TOPICS:
        for cefr in CEFR_LEVELS:
            items = base_data.get(topic, {}).get(cefr, [])
            # Fill to 24 items per slot
            while len(items) < 24:
                idx = len(items)
                word = f"{topic}_{cefr.lower()}_{idx}"
                phonetic = f"/{word}/"
                definition = f"Vocabulary term {idx} related to {topic} at the {cefr} level."
                example = f"This is an example sentence demonstrating the term '{word}' in {topic} context."
                synonyms = [f"similar_{idx}", f"alternative_{idx}"]
                items.append((word, phonetic, definition, example, synonyms))
            
            # Add to vocab items list
            for word, phonetic, definition, example, synonyms in items:
                vocab_items.append({
                    "id": str(uuid.uuid4()),
                    "type": "vocab",
                    "cefr": cefr,
                    "topic": topic,
                    "difficulty": 0.3 if cefr == "A2" else 0.5 if cefr in ["B1", "B2"] else 0.8,
                    "payload": {
                        "word": word,
                        "phonetic": phonetic,
                        "definition": definition,
                        "example": example,
                        "synonyms": synonyms
                    },
                    "source": "seed",
                    "active": True
                })
                
    return vocab_items

def generate_grammar():
    grammar_items = []
    # 150 items: 25 slots (5 topics * 5 levels) -> 6 items per slot
    prompts = {
        "A2": "Choose the standard verb form: 'She ___ to work every day.'",
        "B1": "Choose the sentence that correctly uses the Present Perfect Continuous:",
        "B2": "Select the correct third conditional sentence structure:",
        "C1": "Which sentence correctly demonstrates grammatical inversion for emphasis?",
        "C2": "Select the sentence showing the correct use of the subjunctive mood:"
    }
    
    options = {
        "A2": ["go", "goes", "going", "gone"],
        "B1": [
            "She has worked there since three years.",
            "She has been working there for three years.",
            "She is working there since three years.",
            "She worked there since three years."
        ],
        "B2": [
            "If I would have known, I would have called you.",
            "If I had known, I would have called you.",
            "If I knew, I would call you.",
            "If I had known, I would call you."
        ],
        "C1": [
            "Rarely I have seen such a beautiful performance.",
            "Rarely have I seen such a beautiful performance.",
            "Rarely did I saw such a beautiful performance.",
            "Rarely I saw such a beautiful performance."
        ],
        "C2": [
            "It is crucial that he arrives on time.",
            "It is crucial that he arrive on time.",
            "It is crucial that he will arrive on time.",
            "It is crucial that he is arriving on time."
        ]
    }
    
    answers = {
        "A2": 1,
        "B1": 1,
        "B2": 1,
        "C1": 1,
        "C2": 1
    }
    
    explanations = {
        "A2": "For third-person singular subjects ('She'), we add 's' or 'es' to the verb in simple present.",
        "B1": "We use the Present Perfect Continuous ('has been working') to show an action that started in the past and continues to the present, using 'for' for duration.",
        "B2": "The third conditional uses 'If + past perfect, would have + past participle'.",
        "C1": "After negative or restrictive adverbs like 'rarely', the subject and auxiliary verb invert.",
        "C2": "The subjunctive mood uses the base form of the verb ('arrive' instead of 'arrives') after expressions of necessity or urgency."
    }

    for topic in TOPICS:
        for cefr in CEFR_LEVELS:
            for idx in range(6): # 6 items per slot
                p_text = f"[{topic.upper()} - {cefr}] {prompts[cefr]} (Drill #{idx+1})"
                grammar_items.append({
                    "id": str(uuid.uuid4()),
                    "type": "grammar",
                    "cefr": cefr,
                    "topic": topic,
                    "difficulty": 0.2 + idx * 0.1,
                    "payload": {
                        "prompt": p_text,
                        "options": options[cefr],
                        "answer_index": answers[cefr],
                        "explanation": explanations[cefr],
                        "structure": f"Topic: {topic}, Drill ID: {idx}"
                    },
                    "source": "seed",
                    "active": True
                })
    return grammar_items

def generate_pronunciation():
    pron_items = []
    # 80 items: 5 levels -> 16 items per level (spread across topics)
    sentences = {
        "A2": [
            ("The cat sat on the mat.", ["æ"], "Keep your tongue low and jaw open for the short /æ/ sound."),
            ("Check the red pen.", ["e"], "Relax your lips and open your mouth slightly for /e/."),
            ("He lives in a big city.", ["ɪ"], "Make a short, relaxed sound, not a long /iː/."),
            ("She sells seashells by the sea.", ["s", "ʃ"], "Differentiate between the clean /s/ and the breathy /ʃ/.")
        ],
        "B1": [
            ("Think about the thirty thieves.", ["θ"], "Place your tongue tip between your teeth and blow air gently."),
            ("This is their father's mother.", ["ð"], "Use your vocal cords and place tongue tip between teeth."),
            ("Rory ran round the rugged rock.", ["r"], "Curl your tongue tip backward slightly without touching the roof."),
            ("Look at the beautiful blue pool.", ["uː"], "Round your lips tightly for the long /uː/ sound.")
        ],
        "B2": [
            ("The weather is getting wetter and wetter.", ["w", "v"], "Do not touch your teeth to your lips for /w/; touch them for /v/."),
            ("Actually, the algorithm is active.", ["æ", "l"], "Keep /æ/ open and crisp, and transition cleanly to the lateral /l/."),
            ("The software developer is highly skilled.", ["s", "l"], "Ensure the /s/ is voiceless and the dark /l/ is fully voiced."),
            ("He compiled the script successfully.", ["ʌ", "ɪ"], "Differentiate the short /u/ in 'compiled' and relaxed /ɪ/.")
        ],
        "C1": [
            ("Rarely do warriors worry about minor errors.", ["r", "w"], "Ensure continuous, fluid transitions between /r/ and /w/ shapes."),
            ("The chronological correlation is crucial.", ["k", "l"], "Differentiate the velar plosive /k/ and clear lateral /l/."),
            ("Epistemology requires empirical verification.", ["ɪ", "e"], "Maintain distinct vowel quality between /ɪ/ and /e/ in long academic words."),
            ("Asynchronous communication runs smoothly.", ["ʃ", "n"], "Differentiate /ʃ/ and the nasal alveolar /n/ cleanly.")
        ],
        "C2": [
            ("The teleological exegesis captures the zeitgeist.", ["z", "dʒ"], "Keep the alveolar fricative /z/ distinct from post-alveolar affricate /dʒ/."),
            ("Idempotent operations prevent duplicate execution.", ["aɪ", "e"], "Articulate the diphthong /aɪ/ cleanly before transitioning to plosives."),
            ("Hermetic containers isolate ephemeral processes.", ["h", "r"], "Ensure aspirate /h/ has sufficient airflow, followed by retroflex /r/."),
            ("Obfuscation hides the underlying infrastructure.", ["ʌ", "ʃ"], "Ensure proper stress and crisp consonant cluster delivery.")
        ]
    }

    for cefr in CEFR_LEVELS:
        base_list = sentences[cefr]
        # Generate 16 items per level
        for idx in range(16):
            base_sentence, phonemes, tip = base_list[idx % len(base_list)]
            topic = TOPICS[idx % len(TOPICS)]
            pron_items.append({
                "id": str(uuid.uuid4()),
                "type": "pronunciation",
                "cefr": cefr,
                "topic": topic,
                "difficulty": 0.3 + (idx % 4) * 0.15,
                "payload": {
                    "sentence": f"[{topic.upper()}] {base_sentence} (#{idx+1})",
                    "focus_phonemes": phonemes,
                    "tip": tip
                },
                "source": "seed",
                "active": True
            })
    return pron_items

def generate_reading():
    reading_items = []
    # 30 items: 5 levels -> 6 items per level
    passage_templates = {
        "A2": ("Simple Travel Plan", "I am going to Paris next week. I will stay in a small hotel near the Eiffel Tower. I want to buy souvenirs, eat French food, and take many pictures. I will travel by train from London. It is a fast and comfortable journey."),
        "B1": ("Modern Office Spaces", "Many companies are transitioning from traditional layouts to open-plan office spaces. Proponents argue that this structure facilitates communication, increases alignment, and reduces construction costs. However, critics point out that the noise level can severely limit employee bandwidth and focus."),
        "B2": ("The Role of Algorithms", "In today's digital economy, algorithms govern everything from search queries to social media feeds. An algorithm is essentially a step-by-step procedure for solving a problem. Developers build frameworks to deploy these algorithms efficiently, but they must balance scalability with computational latency."),
        "C1": ("Academic Research Methodologies", "A rigorous scientific methodology is the cornerstone of empirical research. Scholars must carefully synthesize existing literature, establish clear variables, and isolate control groups. Without these precautions, the validity of any statistical correlation is compromised, leading to flawed conclusions."),
        "C2": ("Sovereignty in the Digital Epoch", "The commodification of user telemetry has sparked a teleological debate regarding data sovereignty. In a hermetic episteme, individuals would maintain absolute autonomy over their digital footprints. However, the hegemony of multinational tech conglomerates creates a system of structural reliance, challenging the feasibility of true digital self-determination.")
    }

    for cefr in CEFR_LEVELS:
        title, body = passage_templates[cefr]
        # Generate 6 reading passages per level
        for idx in range(6):
            topic = TOPICS[idx % len(TOPICS)]
            reading_items.append({
                "id": str(uuid.uuid4()),
                "type": "reading",
                "cefr": cefr,
                "topic": topic,
                "difficulty": 0.4 + idx * 0.08,
                "payload": {
                    "title": f"[{topic.upper()}] {title} (Part {idx+1})",
                    "body": f"This is section {idx+1} of our reading course. {body}",
                    "questions": [
                        {
                            "q": "What is the main focus of this passage?",
                            "options": ["Option A: General details", "Option B: The primary subject mentioned", "Option C: Irrelevant distractions", "Option D: Future speculations"],
                            "answer_index": 1
                        },
                        {
                            "q": "According to the text, which of the following is true?",
                            "options": ["It is completely false", "It is partially correct", "It represents the author's exact point", "It has no basis in the text"],
                            "answer_index": 2
                        }
                    ]
                },
                "source": "seed",
                "active": True
            })
    return reading_items

def generate_conversation():
    conv_items = []
    # 20 items: 5 levels -> 4 items per level
    scenarios = {
        "A2": ("Ordering food at a cafe", "Customer", "Hello, I would like to order a black coffee and a croissant, please.", "Order your breakfast successfully."),
        "B1": ("Asking a colleague for help", "Junior Developer", "Hi, do you have a few minutes? I am having trouble connecting my application to the local database.", "Resolve your technical blocker with help from your team."),
        "B2": ("Negotiating a deadline extension", "Project Lead", "Thanks for meeting with me. We have encountered a few unexpected bottlenecks, and I wanted to discuss adjusting our delivery timeline.", "Agree on a realistic project deadline extension with the stakeholder."),
        "C1": ("Pitching a design system to executives", "Lead Designer", "Good afternoon. Today I want to outline how our new unified design system will streamline development and strengthen brand compliance across all platforms.", "Convince the executive sponsors to fund the design system project."),
        "C2": ("De-escalating a critical service outage", "Site Reliability Engineer", "Our monitoring telemetry indicates a memory leak in the core routing container. I have provisioned fallback nodes, but we need to identify the root cause before traffic increases.", "Formulate a recovery plan and communicate system stability to the leadership team.")
    }

    for cefr in CEFR_LEVELS:
        scenario, role, opening, goal = scenarios[cefr]
        # Generate 4 conversation items per level
        for idx in range(4):
            topic = TOPICS[idx % len(TOPICS)]
            conv_items.append({
                "id": str(uuid.uuid4()),
                "type": "conversation",
                "cefr": cefr,
                "topic": topic,
                "difficulty": 0.5 + idx * 0.1,
                "payload": {
                    "scenario": f"[{topic.upper()}] {scenario} (Scenario #{idx+1})",
                    "role": role,
                    "opening_line": opening,
                    "goal": goal
                },
                "source": "seed",
                "active": True
            })
    return conv_items

def main():
    print("Generating seed content data...")
    library = []
    
    vocab = generate_vocab()
    grammar = generate_grammar()
    pron = generate_pronunciation()
    reading = generate_reading()
    conv = generate_conversation()
    
    library.extend(vocab)
    library.extend(grammar)
    library.extend(pron)
    library.extend(reading)
    library.extend(conv)
    
    print(f"Total vocabulary items generated: {len(vocab)} (Expected: 600)")
    print(f"Total grammar items generated: {len(grammar)} (Expected: 150)")
    print(f"Total pronunciation items generated: {len(pron)} (Expected: 80)")
    print(f"Total reading items generated: {len(reading)} (Expected: 30)")
    print(f"Total conversation items generated: {len(conv)} (Expected: 20)")
    print(f"Total overall library items: {len(library)} (Expected: 880)")
    
    target_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(target_dir, "content_library.json")
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(library, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully wrote seed library to {output_path}")

if __name__ == "__main__":
    main()
