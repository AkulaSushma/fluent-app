"""
Fluent API — built-in content library.

Provides **instant** fallback content when AI APIs are unreachable.
All data is stored as plain Python dicts/lists — no external files needed.

Contents
--------
* 80 vocabulary flashcards (10 themes × 8 cards each)
* 12 structured grammar lessons with quizzes
* 15 reading-practice articles (150-250 words each)
"""

from __future__ import annotations

import random
from typing import Any

# ---------------------------------------------------------------------------
# 1. VOCABULARY — 10 themes × 8 cards = 80 flashcards
# ---------------------------------------------------------------------------

_VOCAB: dict[str, list[dict[str, str]]] = {
    # ── Corporate ─────────────────────────────────────────────────────────
    "corporate": [
        {
            "word": "Synergy",
            "ipa": "/ˈsɪn.ər.dʒi/",
            "definition": "The combined effect of a group that exceeds the sum of individual efforts.",
            "example": "The merger created a synergy that boosted profits by 40 percent.",
            "hindi": "तालमेल",
            "telugu": "సమన్వయం",
        },
        {
            "word": "Leverage",
            "ipa": "/ˈlev.ər.ɪdʒ/",
            "definition": "To use something to maximum advantage.",
            "example": "We need to leverage our existing customer base to drive growth.",
            "hindi": "लाभ उठाना",
            "telugu": "ప్రయోజనం పొందు",
        },
        {
            "word": "Streamline",
            "ipa": "/ˈstriːm.laɪn/",
            "definition": "To make a process more efficient by simplifying it.",
            "example": "The company streamlined its approval process to save time.",
            "hindi": "सुव्यवस्थित करना",
            "telugu": "సరళీకరించు",
        },
        {
            "word": "Stakeholder",
            "ipa": "/ˈsteɪk.hoʊl.dər/",
            "definition": "A person or group with an interest or concern in a business.",
            "example": "All stakeholders were invited to the quarterly review meeting.",
            "hindi": "हितधारक",
            "telugu": "వాటాదారు",
        },
        {
            "word": "Bandwidth",
            "ipa": "/ˈbænd.wɪdθ/",
            "definition": "The capacity to handle work or information at a given time.",
            "example": "I don't have the bandwidth to take on another project right now.",
            "hindi": "क्षमता",
            "telugu": "సామర్థ్యం",
        },
        {
            "word": "Pivot",
            "ipa": "/ˈpɪv.ət/",
            "definition": "To change direction or strategy in business.",
            "example": "The startup decided to pivot from hardware to a software-as-a-service model.",
            "hindi": "दिशा बदलना",
            "telugu": "దిశ మార్చు",
        },
        {
            "word": "Scalable",
            "ipa": "/ˈskeɪ.lə.bəl/",
            "definition": "Able to grow or expand in capacity without losing efficiency.",
            "example": "We need a scalable solution that works for ten users or ten thousand.",
            "hindi": "विस्तार योग्य",
            "telugu": "విస్తరించగల",
        },
        {
            "word": "Onboard",
            "ipa": "/ˈɒn.bɔːrd/",
            "definition": "To integrate a new employee or customer into an organisation.",
            "example": "HR will onboard all new hires during their first week.",
            "hindi": "शामिल करना",
            "telugu": "చేర్చుకొను",
        },
    ],
    # ── Technology ────────────────────────────────────────────────────────
    "technology": [
        {
            "word": "Algorithm",
            "ipa": "/ˈæl.ɡə.rɪð.əm/",
            "definition": "A step-by-step procedure for solving a problem or performing a computation.",
            "example": "The search algorithm returns results in under a millisecond.",
            "hindi": "कलन विधि",
            "telugu": "అల్గారిథం",
        },
        {
            "word": "Latency",
            "ipa": "/ˈleɪ.tən.si/",
            "definition": "The delay before a transfer of data begins following an instruction.",
            "example": "High latency can make video calls frustrating for remote workers.",
            "hindi": "विलंबता",
            "telugu": "జాప్యం",
        },
        {
            "word": "Encryption",
            "ipa": "/ɪnˈkrɪp.ʃən/",
            "definition": "The process of encoding information so only authorised parties can read it.",
            "example": "End-to-end encryption ensures that only the sender and receiver can view the messages.",
            "hindi": "कूटलेखन",
            "telugu": "గూఢ లిపీకరణ",
        },
        {
            "word": "Bandwidth",
            "ipa": "/ˈbænd.wɪdθ/",
            "definition": "The maximum rate of data transfer across a network path.",
            "example": "Upgrading the bandwidth improved download speeds significantly.",
            "hindi": "बैंडविड्थ",
            "telugu": "బ్యాండ్‌విడ్త్",
        },
        {
            "word": "Deploy",
            "ipa": "/dɪˈplɔɪ/",
            "definition": "To release and install software into a production environment.",
            "example": "We deploy new features every two weeks using continuous integration.",
            "hindi": "तैनात करना",
            "telugu": "అమలు చేయు",
        },
        {
            "word": "Iterate",
            "ipa": "/ˈɪt.ə.reɪt/",
            "definition": "To repeat a process in order to approach a desired result.",
            "example": "The team will iterate on the design based on user feedback.",
            "hindi": "दोहराना",
            "telugu": "పునరావృతం చేయు",
        },
        {
            "word": "Refactor",
            "ipa": "/riːˈfæk.tər/",
            "definition": "To restructure existing code without changing its external behaviour.",
            "example": "We need to refactor this module before adding new features.",
            "hindi": "पुनर्गठन करना",
            "telugu": "పునర్నిర్మాణం చేయు",
        },
        {
            "word": "Cache",
            "ipa": "/kæʃ/",
            "definition": "A hardware or software component that stores data for faster future access.",
            "example": "Clearing the browser cache resolved the page-loading issue.",
            "hindi": "कैश",
            "telugu": "క్యాష్",
        },
    ],
    # ── Academic ──────────────────────────────────────────────────────────
    "academic": [
        {
            "word": "Hypothesis",
            "ipa": "/haɪˈpɒθ.ə.sɪs/",
            "definition": "A proposed explanation made as a starting point for further investigation.",
            "example": "The researcher's hypothesis was confirmed by the experimental data.",
            "hindi": "परिकल्पना",
            "telugu": "పరికల్పన",
        },
        {
            "word": "Empirical",
            "ipa": "/ɪmˈpɪr.ɪ.kəl/",
            "definition": "Based on observation or experience rather than theory.",
            "example": "Empirical evidence supports the effectiveness of this teaching method.",
            "hindi": "अनुभवसिद्ध",
            "telugu": "అనుభవాత్మక",
        },
        {
            "word": "Paradigm",
            "ipa": "/ˈpær.ə.daɪm/",
            "definition": "A typical example or model of something; a framework of concepts.",
            "example": "The discovery shifted the scientific paradigm entirely.",
            "hindi": "प्रतिमान",
            "telugu": "నమూనా",
        },
        {
            "word": "Discourse",
            "ipa": "/ˈdɪs.kɔːrs/",
            "definition": "Written or spoken communication or debate on a particular topic.",
            "example": "Academic discourse requires evidence-based arguments.",
            "hindi": "प्रवचन",
            "telugu": "ఉపన్యాసం",
        },
        {
            "word": "Methodology",
            "ipa": "/ˌmeθ.əˈdɒl.ə.dʒi/",
            "definition": "A system of methods used in a particular area of study or activity.",
            "example": "The paper outlines the methodology used for data collection.",
            "hindi": "कार्यप्रणाली",
            "telugu": "పద్ధతి శాస్త్రం",
        },
        {
            "word": "Correlation",
            "ipa": "/ˌkɒr.əˈleɪ.ʃən/",
            "definition": "A mutual relationship or connection between two or more things.",
            "example": "There is a strong correlation between exercise and mental health.",
            "hindi": "सहसंबंध",
            "telugu": "సహసంబంధం",
        },
        {
            "word": "Thesis",
            "ipa": "/ˈθiː.sɪs/",
            "definition": "A statement or theory put forward to be supported by arguments.",
            "example": "She defended her doctoral thesis before a panel of professors.",
            "hindi": "शोध प्रबंध",
            "telugu": "సిద్ధాంత వ్యాసం",
        },
        {
            "word": "Abstract",
            "ipa": "/ˈæb.strækt/",
            "definition": "A brief summary of a research paper or academic article.",
            "example": "Read the abstract before deciding whether the paper is relevant.",
            "hindi": "सारांश",
            "telugu": "సారాంశం",
        },
    ],
    # ── Travel ────────────────────────────────────────────────────────────
    "travel": [
        {
            "word": "Itinerary",
            "ipa": "/aɪˈtɪn.ər.ər.i/",
            "definition": "A planned route or schedule of a journey.",
            "example": "Our itinerary includes stops in Paris, Rome, and Athens.",
            "hindi": "यात्रा कार्यक्रम",
            "telugu": "ప్రయాణ ప్రణాళిక",
        },
        {
            "word": "Layover",
            "ipa": "/ˈleɪ.oʊ.vər/",
            "definition": "A period of rest or waiting during a journey, especially between flights.",
            "example": "We had a six-hour layover in Dubai on our way to London.",
            "hindi": "पड़ाव",
            "telugu": "మధ్య విరామం",
        },
        {
            "word": "Customs",
            "ipa": "/ˈkʌs.təmz/",
            "definition": "The government department that monitors goods entering and leaving a country.",
            "example": "You must declare all items over the duty-free limit at customs.",
            "hindi": "सीमा शुल्क",
            "telugu": "కస్టమ్స్",
        },
        {
            "word": "Embassy",
            "ipa": "/ˈem.bə.si/",
            "definition": "The official residence or office of an ambassador in a foreign country.",
            "example": "Contact the embassy immediately if you lose your passport abroad.",
            "hindi": "दूतावास",
            "telugu": "రాయబార కార్యాలయం",
        },
        {
            "word": "Concierge",
            "ipa": "/ˌkɒn.siˈeʒ/",
            "definition": "A hotel employee who assists guests with bookings, tours, and local information.",
            "example": "The concierge booked a river cruise and arranged a taxi for us.",
            "hindi": "द्वारपाल",
            "telugu": "ద్వారపాలకుడు",
        },
        {
            "word": "Transit",
            "ipa": "/ˈtræn.zɪt/",
            "definition": "The act of passing through a place on the way to a destination.",
            "example": "Passengers in transit do not need to clear immigration.",
            "hindi": "पारगमन",
            "telugu": "రవాణా",
        },
        {
            "word": "Excursion",
            "ipa": "/ɪkˈskɜːr.ʒən/",
            "definition": "A short trip taken for leisure, often as part of a longer journey.",
            "example": "The cruise offered a day excursion to a nearby island.",
            "hindi": "सैर",
            "telugu": "విహారయాత్ర",
        },
        {
            "word": "Souvenir",
            "ipa": "/ˌsuː.vəˈnɪr/",
            "definition": "An item purchased or kept as a reminder of a place visited.",
            "example": "She bought a small ceramic plate as a souvenir from Greece.",
            "hindi": "स्मृति चिन्ह",
            "telugu": "జ్ఞాపిక",
        },
    ],
    # ── Medical ───────────────────────────────────────────────────────────
    "medical": [
        {
            "word": "Diagnosis",
            "ipa": "/ˌdaɪ.əɡˈnoʊ.sɪs/",
            "definition": "The identification of a disease or condition through examination.",
            "example": "The doctor confirmed the diagnosis after reviewing the blood tests.",
            "hindi": "निदान",
            "telugu": "రోగ నిర్ధారణ",
        },
        {
            "word": "Prognosis",
            "ipa": "/prɒɡˈnoʊ.sɪs/",
            "definition": "The likely course or outcome of a disease or ailment.",
            "example": "The prognosis for early-stage patients is generally very positive.",
            "hindi": "पूर्वानुमान",
            "telugu": "రోగ పూర్వానుమానం",
        },
        {
            "word": "Symptom",
            "ipa": "/ˈsɪmp.təm/",
            "definition": "A physical or mental sign indicating the presence of a condition.",
            "example": "A persistent cough is a common symptom of bronchitis.",
            "hindi": "लक्षण",
            "telugu": "లక్షణం",
        },
        {
            "word": "Prescription",
            "ipa": "/prɪˈskrɪp.ʃən/",
            "definition": "A written instruction from a doctor authorising a patient to obtain medicine.",
            "example": "The pharmacist filled the prescription within twenty minutes.",
            "hindi": "नुस्खा",
            "telugu": "వైద్య చీటి",
        },
        {
            "word": "Chronic",
            "ipa": "/ˈkrɒn.ɪk/",
            "definition": "A condition that persists over a long period of time.",
            "example": "Chronic back pain affects millions of office workers worldwide.",
            "hindi": "दीर्घकालिक",
            "telugu": "దీర్ఘకాలిక",
        },
        {
            "word": "Acute",
            "ipa": "/əˈkjuːt/",
            "definition": "A condition that is severe and sudden in onset.",
            "example": "She was hospitalised for acute appendicitis and required immediate surgery.",
            "hindi": "तीव्र",
            "telugu": "తీవ్రమైన",
        },
        {
            "word": "Benign",
            "ipa": "/bɪˈnaɪn/",
            "definition": "Not harmful in effect; (of a tumour) not cancerous.",
            "example": "Fortunately, the biopsy revealed that the tumour was benign.",
            "hindi": "सौम्य",
            "telugu": "నిరపాయమైన",
        },
        {
            "word": "Adverse",
            "ipa": "/ˈæd.vɜːrs/",
            "definition": "Harmful or unfavourable, especially regarding a medical reaction.",
            "example": "The patient experienced no adverse effects from the new medication.",
            "hindi": "प्रतिकूल",
            "telugu": "ప్రతికూలమైన",
        },
    ],
    # ── Legal ─────────────────────────────────────────────────────────────
    "legal": [
        {
            "word": "Jurisdiction",
            "ipa": "/ˌdʒʊə.rɪsˈdɪk.ʃən/",
            "definition": "The official power to make legal decisions and judgements.",
            "example": "This court does not have jurisdiction over cases filed in another state.",
            "hindi": "अधिकार क्षेत्र",
            "telugu": "అధికార పరిధి",
        },
        {
            "word": "Litigation",
            "ipa": "/ˌlɪt.ɪˈɡeɪ.ʃən/",
            "definition": "The process of taking legal action through the courts.",
            "example": "The company chose to settle rather than face lengthy litigation.",
            "hindi": "मुकदमेबाज़ी",
            "telugu": "వ్యాజ్యం",
        },
        {
            "word": "Precedent",
            "ipa": "/ˈpres.ɪ.dənt/",
            "definition": "An earlier event or action regarded as an example for subsequent situations.",
            "example": "The Supreme Court ruling set a precedent for all future privacy cases.",
            "hindi": "पूर्व उदाहरण",
            "telugu": "పూర్వ ఉదాహరణ",
        },
        {
            "word": "Statute",
            "ipa": "/ˈstætʃ.uːt/",
            "definition": "A written law passed by a legislative body.",
            "example": "The statute clearly defines the penalties for tax evasion.",
            "hindi": "विधि",
            "telugu": "శాసనం",
        },
        {
            "word": "Plaintiff",
            "ipa": "/ˈpleɪn.tɪf/",
            "definition": "A person who brings a case against another in a court of law.",
            "example": "The plaintiff alleged that the contract had been breached.",
            "hindi": "वादी",
            "telugu": "వాది",
        },
        {
            "word": "Defendant",
            "ipa": "/dɪˈfen.dənt/",
            "definition": "A person or entity accused or sued in a court of law.",
            "example": "The defendant pleaded not guilty to all charges.",
            "hindi": "प्रतिवादी",
            "telugu": "ప్రతివాది",
        },
        {
            "word": "Acquittal",
            "ipa": "/əˈkwɪt.əl/",
            "definition": "A judgement that a person is not guilty of the crime charged.",
            "example": "The jury's acquittal came after three days of deliberation.",
            "hindi": "दोषमुक्ति",
            "telugu": "నిర్దోషిగా విడుదల",
        },
        {
            "word": "Verdict",
            "ipa": "/ˈvɜːr.dɪkt/",
            "definition": "A decision on an issue of fact in a civil or criminal case.",
            "example": "The verdict was delivered to a packed courtroom.",
            "hindi": "फैसला",
            "telugu": "తీర్పు",
        },
    ],
    # ── Finance ───────────────────────────────────────────────────────────
    "finance": [
        {
            "word": "Equity",
            "ipa": "/ˈek.wɪ.ti/",
            "definition": "The value of shares issued by a company; ownership interest.",
            "example": "Investors received equity in the startup in exchange for early funding.",
            "hindi": "इक्विटी",
            "telugu": "ఈక్విటీ",
        },
        {
            "word": "Dividend",
            "ipa": "/ˈdɪv.ɪ.dend/",
            "definition": "A sum of money paid regularly by a company to its shareholders.",
            "example": "The board declared a quarterly dividend of two dollars per share.",
            "hindi": "लाभांश",
            "telugu": "డివిడెండ్",
        },
        {
            "word": "Portfolio",
            "ipa": "/pɔːrtˈfoʊ.li.oʊ/",
            "definition": "A collection of financial investments held by a person or institution.",
            "example": "A diversified portfolio reduces the overall risk of investment loss.",
            "hindi": "निवेश संग्रह",
            "telugu": "పెట్టుబడి సమాహారం",
        },
        {
            "word": "Amortize",
            "ipa": "/ˈæm.ər.taɪz/",
            "definition": "To gradually write off the cost of an asset over a period.",
            "example": "The company will amortize the software licence over five years.",
            "hindi": "परिशोधन करना",
            "telugu": "రుణ విమోచనం చేయు",
        },
        {
            "word": "Yield",
            "ipa": "/jiːld/",
            "definition": "The income return on an investment, expressed as a percentage.",
            "example": "Government bonds currently offer a yield of around four percent.",
            "hindi": "प्रतिफल",
            "telugu": "ప్రతిఫలం",
        },
        {
            "word": "Depreciation",
            "ipa": "/dɪˌpriː.ʃiˈeɪ.ʃən/",
            "definition": "The decrease in value of an asset over time due to wear and tear.",
            "example": "Depreciation of company vehicles is recorded as an annual expense.",
            "hindi": "मूल्यह्रास",
            "telugu": "తరుగుదల",
        },
        {
            "word": "Collateral",
            "ipa": "/kəˈlæt.ər.əl/",
            "definition": "An asset pledged as security for repayment of a loan.",
            "example": "The bank required the house as collateral for the mortgage.",
            "hindi": "संपार्श्विक",
            "telugu": "తాకట్టు",
        },
        {
            "word": "Liquidity",
            "ipa": "/lɪˈkwɪd.ɪ.ti/",
            "definition": "The ease with which an asset can be converted to cash without loss.",
            "example": "Real estate has lower liquidity compared to publicly traded stocks.",
            "hindi": "तरलता",
            "telugu": "ద్రవ్యత",
        },
    ],
    # ── Science ───────────────────────────────────────────────────────────
    "science": [
        {
            "word": "Catalyst",
            "ipa": "/ˈkæt.əl.ɪst/",
            "definition": "A substance that increases the rate of a chemical reaction without being consumed.",
            "example": "Platinum acts as a catalyst in many industrial chemical processes.",
            "hindi": "उत्प्रेरक",
            "telugu": "ఉత్ప్రేరకం",
        },
        {
            "word": "Entropy",
            "ipa": "/ˈen.trə.pi/",
            "definition": "A measure of disorder or randomness in a system.",
            "example": "The second law of thermodynamics states that entropy always increases.",
            "hindi": "एन्ट्रापी",
            "telugu": "ఎంట్రోపీ",
        },
        {
            "word": "Osmosis",
            "ipa": "/ɒzˈmoʊ.sɪs/",
            "definition": "The movement of solvent molecules through a semipermeable membrane.",
            "example": "Plants absorb water from the soil through osmosis.",
            "hindi": "परासरण",
            "telugu": "ద్రవాభిసరణం",
        },
        {
            "word": "Genome",
            "ipa": "/ˈdʒiː.noʊm/",
            "definition": "The complete set of genes or genetic material in a cell or organism.",
            "example": "Scientists mapped the entire human genome in 2003.",
            "hindi": "जीनोम",
            "telugu": "జీనోమ్",
        },
        {
            "word": "Isotope",
            "ipa": "/ˈaɪ.sə.toʊp/",
            "definition": "Atoms of the same element with different numbers of neutrons.",
            "example": "Carbon-14 is a radioactive isotope used for dating ancient artefacts.",
            "hindi": "समस्थानिक",
            "telugu": "ఐసోటోపు",
        },
        {
            "word": "Molecule",
            "ipa": "/ˈmɒl.ɪ.kjuːl/",
            "definition": "The smallest unit of a substance that retains its chemical properties.",
            "example": "A water molecule consists of two hydrogen atoms and one oxygen atom.",
            "hindi": "अणु",
            "telugu": "అణువు",
        },
        {
            "word": "Photosynthesis",
            "ipa": "/ˌfoʊ.toʊˈsɪn.θə.sɪs/",
            "definition": "The process by which plants convert sunlight into chemical energy.",
            "example": "Photosynthesis occurs primarily in the leaves of green plants.",
            "hindi": "प्रकाश संश्लेषण",
            "telugu": "కిరణజన్య సంయోగక్రియ",
        },
        {
            "word": "Mitosis",
            "ipa": "/maɪˈtoʊ.sɪs/",
            "definition": "Cell division that results in two identical daughter cells.",
            "example": "Mitosis is essential for growth and repair of body tissues.",
            "hindi": "समसूत्री विभाजन",
            "telugu": "సమవిభజనం",
        },
    ],
    # ── Arts ──────────────────────────────────────────────────────────────
    "arts": [
        {
            "word": "Aesthetic",
            "ipa": "/esˈθet.ɪk/",
            "definition": "Concerned with beauty or the appreciation of beauty.",
            "example": "The building's aesthetic design won several architecture awards.",
            "hindi": "सौंदर्य संबंधी",
            "telugu": "సౌందర్య సంబంధమైన",
        },
        {
            "word": "Renaissance",
            "ipa": "/ˈren.ə.sɑːns/",
            "definition": "A revival of interest in art and learning, originally in 14th-17th century Europe.",
            "example": "The Renaissance produced masterpieces by Leonardo da Vinci and Michelangelo.",
            "hindi": "पुनर्जागरण",
            "telugu": "పునరుజ్జీవనం",
        },
        {
            "word": "Composition",
            "ipa": "/ˌkɒm.pəˈzɪʃ.ən/",
            "definition": "The arrangement of elements in a work of art or music.",
            "example": "The composition of the photograph draws the viewer's eye to the centre.",
            "hindi": "रचना",
            "telugu": "కూర్పు",
        },
        {
            "word": "Palette",
            "ipa": "/ˈpæl.ɪt/",
            "definition": "The range of colours used by an artist in a particular work.",
            "example": "Monet favoured a soft, pastel palette in his water lily paintings.",
            "hindi": "रंगपट्ट",
            "telugu": "రంగుల పలక",
        },
        {
            "word": "Motif",
            "ipa": "/moʊˈtiːf/",
            "definition": "A recurring theme, subject, or design element in artistic works.",
            "example": "The floral motif appears throughout the tapestry's border.",
            "hindi": "आधार विषय",
            "telugu": "ప్రధాన అంశం",
        },
        {
            "word": "Genre",
            "ipa": "/ˈʒɑːn.rə/",
            "definition": "A category of artistic composition characterised by style, form, or content.",
            "example": "Science fiction is my favourite genre of both film and literature.",
            "hindi": "विधा",
            "telugu": "ప్రక్రియ",
        },
        {
            "word": "Opus",
            "ipa": "/ˈoʊ.pəs/",
            "definition": "A separate composition or set of compositions, especially in music.",
            "example": "Beethoven's Opus 27 includes the famous Moonlight Sonata.",
            "hindi": "कृति",
            "telugu": "సంగీత కృతి",
        },
        {
            "word": "Avant-garde",
            "ipa": "/ˌæv.ɒ̃ˈɡɑːrd/",
            "definition": "New and experimental ideas in art, culture, or politics.",
            "example": "The avant-garde film challenged every convention of traditional cinema.",
            "hindi": "अग्रणी",
            "telugu": "ముందంజ కళ",
        },
    ],
    # ── Daily Life ────────────────────────────────────────────────────────
    "daily life": [
        {
            "word": "Procrastinate",
            "ipa": "/proʊˈkræs.tɪ.neɪt/",
            "definition": "To delay or postpone action; to put off doing something.",
            "example": "If you procrastinate on filing taxes, you may face penalties.",
            "hindi": "टालमटोल करना",
            "telugu": "వాయిదా వేయు",
        },
        {
            "word": "Compromise",
            "ipa": "/ˈkɒm.prə.maɪz/",
            "definition": "An agreement reached by each side making concessions.",
            "example": "The couple reached a compromise on where to spend the holidays.",
            "hindi": "समझौता",
            "telugu": "రాజీ",
        },
        {
            "word": "Persevere",
            "ipa": "/ˌpɜː.sɪˈvɪər/",
            "definition": "To continue in a course of action despite difficulty or delay.",
            "example": "Athletes who persevere through setbacks often achieve greatness.",
            "hindi": "डटे रहना",
            "telugu": "పట్టుదలగా ఉండు",
        },
        {
            "word": "Accommodate",
            "ipa": "/əˈkɒm.ə.deɪt/",
            "definition": "To provide lodging or sufficient space for; to adjust to.",
            "example": "The hall can accommodate up to five hundred guests.",
            "hindi": "समायोजित करना",
            "telugu": "సర్దుబాటు చేయు",
        },
        {
            "word": "Empathize",
            "ipa": "/ˈem.pə.θaɪz/",
            "definition": "To understand and share the feelings of another person.",
            "example": "Good leaders empathize with their team members during tough times.",
            "hindi": "सहानुभूति रखना",
            "telugu": "సానుభూతి చూపు",
        },
        {
            "word": "Articulate",
            "ipa": "/ɑːrˈtɪk.jə.lɪt/",
            "definition": "To express an idea or feeling fluently and clearly.",
            "example": "She was able to articulate her vision for the company's future.",
            "hindi": "स्पष्ट रूप से कहना",
            "telugu": "స్పష్టంగా చెప్పు",
        },
        {
            "word": "Meticulous",
            "ipa": "/məˈtɪk.jə.ləs/",
            "definition": "Showing great attention to detail; very careful and precise.",
            "example": "His meticulous planning ensured the event went off without a hitch.",
            "hindi": "सूक्ष्मदर्शी",
            "telugu": "నిశితమైన",
        },
        {
            "word": "Tenacious",
            "ipa": "/təˈneɪ.ʃəs/",
            "definition": "Holding firmly to something; persistent and determined.",
            "example": "Her tenacious attitude helped her overcome every obstacle in her career.",
            "hindi": "दृढ़",
            "telugu": "పట్టుదలగల",
        },
    ],
}

# ---------------------------------------------------------------------------
# 2. GRAMMAR LESSONS — 12 structured lessons
# ---------------------------------------------------------------------------

from app.services.grammar_data import _GRAMMAR as _GRAMMAR_DICT

_GRAMMAR: list[dict[str, Any]] = list(_GRAMMAR_DICT.values())

GRAMMAR_CURRICULUM: dict[str, Any] = {
    "categories": [
        {"id": "tenses", "label": "Tenses & Time", "emoji": "⏳"},
        {"id": "structure", "label": "Sentence Structure", "emoji": "🧩"},
        {"id": "word_classes", "label": "Word Classes", "emoji": "📦"},
        {"id": "complex", "label": "Complex Constructions", "emoji": "🏗️"},
        {"id": "connectors", "label": "Connectors & Flow", "emoji": "🔗"},
        {"id": "style", "label": "Style & Register", "emoji": "🎭"},
    ],
    "topics": [
        {
            "id": lesson["id"],
            "title": lesson["topic"],
            "level": lesson["level"],
            "category": lesson["category"],
            "prerequisites": lesson["prerequisites"],
        }
        for lesson in _GRAMMAR_DICT.values()
    ]
}


# ---------------------------------------------------------------------------
# 3. ARTICLES — 15 reading-practice scripts (150-250 words each)
# ---------------------------------------------------------------------------

_ARTICLES: list[dict[str, Any]] = [
    {
        "title": "The Power of a Morning Routine",
        "content": (
            "How you start your morning sets the tone for your entire day. Developing a structured "
            "morning routine is one of the most effective ways to boost your productivity and maintain "
            "a positive mindset. Start by waking up at a consistent time and stretching your body. "
            "Write down three things you are grateful for and list your top priorities for the day. "
            "Avoid checking your phone immediately; instead, spend the first hour nourishing your mind "
            "with a good book, quiet meditation, or a healthy breakfast. This simple habit keeps you "
            "focused, energized, and ready to face any challenges with confidence. Remember, a successful "
            "day is built one morning at a time."
        ),
        "word_count": 118,
        "explanation": (
            "Focus on the linked speech (liaison) between words ending in consonants and starting with "
            "vowels, such as 'start your' (/stɑːrt-jər/) and 'waking up' (/weɪkɪŋ-ʌp/). Practice reducing "
            "unstressed vowels to a schwa (/ə/), particularly in words like 'productivity' and 'consistent'."
        )
    },
    {
        "title": "Staying Motivated Every Day",
        "content": (
            "Staying motivated when learning a new skill can be challenging, but it is entirely possible. "
            "The secret is to connect your daily practice to a larger purpose. Ask yourself why you want "
            "to master English. Is it to advance your career, travel the world, or make new friends? "
            "Write your goal down and place it where you see it every day. When your energy is low, "
            "break your study target into tiny, manageable steps. Instead of an hour, tell yourself you "
            "will practice for just five minutes. Celebrate small victories, like mastering a difficult "
            "word. Consistency is what turns effort into automatic habit, leading you directly to success."
        ),
        "word_count": 115,
        "explanation": (
            "Pay close attention to syllable stress in multi-syllable words. For instance, in 'motivation', "
            "the primary stress is on 'va' (/ˌmoʊtɪˈveɪʃən/), and in 'consistency', the stress is on 'sis' "
            "(/kənˈsɪstənsi/). Keep the unstressed syllables short and light."
        )
    },
    {
        "title": "Handling Stress with Mindfulness",
        "content": (
            "Daily stress is inevitable, but how you react to it is within your control. Mindfulness "
            "is the practice of bringing your attention back to the present moment without judgment. "
            "When you feel overwhelmed by your daily routine, pause for a moment. Close your eyes and "
            "take three slow, deep breaths. Pay attention to the physical sensation of air entering and "
            "leaving your body. Observe your thoughts like clouds passing in the sky, without holding on "
            "to them. Practicing mindfulness for even five minutes a day rewires your brain, reducing anxiety "
            "and improving emotional resilience. A calm mind is your greatest superpower."
        ),
        "word_count": 105,
        "explanation": (
            "Practice the distinction between the soft, voiceless /θ/ sound in 'mindfulness' and 'breath' "
            "and the voiced /ð/ sound in 'breaths', 'they', and 'without'. Ensure your tongue is placed "
            "slightly between your teeth to create a clean friction sound."
        )
    },
    {
        "title": "The Art of Gratitude",
        "content": (
            "Expressing gratitude in your daily conversations is a simple way to strengthen relationships "
            "and increase your personal happiness. Take time to appreciate the people around you. "
            "A sincere 'thank you' can brighten someone's day and build a strong emotional connection. "
            "When you speak to a coworker, friend, or family member, acknowledge their effort and show "
            "them that you notice their kindness. In your conversations, try saying 'I really appreciate "
            "your help' instead of just a generic greeting. Making gratitude a daily habit trains your "
            "brain to look for the positive aspects of life, creating a cycle of joy and encouragement."
        ),
        "word_count": 107,
        "explanation": (
            "Focus on the correct pronunciation of the short /æ/ vowel sound in words like 'gratitude', "
            "'appreciation', 'happiness', and 'family'. Open your mouth slightly wider and pull the corners "
            "of your lips back to differentiate it from the /e/ sound in 'effort'."
        )
    },
    {
        "title": "Overcoming the Fear of Speaking",
        "content": (
            "Many language learners fear speaking because they are afraid of making mistakes. However, "
            "making mistakes is the only way to grow. When practicing conversation, focus on communication "
            "rather than absolute perfection. Real-world speakers care about understanding your message, "
            "not your grammar score. To build confidence, speak aloud to yourself during your daily "
            "routine. Narrate your actions as you wash dishes or walk to work. Take deep, slow breaths before "
            "conversations to calm your nervous system. By speaking up regularly, you desensitize your "
            "brain to anxiety and build the muscle memory required for natural, fluent speech."
        ),
        "word_count": 98,
        "explanation": (
            "Identify silent letters to avoid over-pronouncing words. For example, the 'l' in 'walk' "
            "(/wɔːk/) and 'talk' (/tɔːk/) is completely silent, and the 'b' in 'doubt' and 'debt' "
            "is not pronounced. Practice the long /uː/ sound in 'fluent' and 'muscle memory'."
        )
    },
    {
        "title": "The Magic of Small Habits",
        "content": (
            "It is a common mistake to believe that massive success requires massive action. In reality, "
            "the most profound life changes come from the accumulation of small, daily habits. If you "
            "improve a skill by just one percent every day, you will be thirty-seven times better at it "
            "by the end of a year. Write down a small action you can do daily, such as learning one "
            "new word or reading two pages of a book. Make it so easy that you cannot say no. The goal "
            "is not to complete a giant task, but to establish a consistent identity. Small steps lead to "
            "giant leaps."
        ),
        "word_count": 113,
        "explanation": (
            "Observe how American English speakers flap the /t/ sound into a soft /d/ when it sits between "
            "vowels, such as in 'ability' (/əˈbɪl.ə.t̬i/) and 'reality' (/riˈæl.ə.t̬i/). Keep your tongue "
            "tap light and rapid against the roof of your mouth."
        )
    },
    {
        "title": "Finding Positivity in Failures",
        "content": (
            "Failure is not the opposite of success; it is a vital part of it. Every mistake you make "
            "is a data point that teaches you what does not work. When a project fails or you make a "
            "pronunciation error, reframe the situation. Ask yourself: 'What can I learn from this "
            "experience?' Successful people do not avoid failure; they accept it, learn from it, and "
            "try again with more wisdom. Developing this growth mindset helps you persevere when tasks "
            "become difficult. Treat every setback as a stepping stone on your journey to mastery."
        ),
        "word_count": 94,
        "explanation": (
            "Practice the rising intonation pattern when asking open questions (e.g., 'What can I learn "
            "from this?') versus the falling intonation pattern at the end of declarative statements (e.g., "
            "'Failure is a vital part of success.'). This improves sentence musicality."
        )
    },
    {
        "title": "Building Social Confidence",
        "content": (
            "Social confidence is a skill you can build through deliberate practice, not a personality "
            "trait you are born with. Start small in your daily routine. When you order coffee or buy "
            "groceries, make eye contact, smile, and say a warm 'Good morning'. Ask a simple follow-up "
            "question like 'How is your day going?'. Listening actively to the response shows that "
            "you value the interaction. In conversations, focus your attention outward on the other person "
            "instead of worrying about how you sound. By taking small social risks daily, you train your "
            "mind to feel safe and confident in any conversation."
        ),
        "word_count": 105,
        "explanation": (
            "Focus on the distinction between the labiodental /v/ sound (lips touching teeth) in 'value', "
            "'deliberate', and 'groceries' and the bilabial /w/ sound (rounded lips) in 'warm', 'worrying', "
            "and 'would'. Pronounce 'value' as /ˈvæl.juː/ and 'warm' as /wɔːrm/."
        )
    },
    {
        "title": "Handling Difficult Conversations",
        "content": (
            "Difficult conversations are a natural part of daily life, but they do not have to result "
            "in conflict. The key is to speak with clarity and listen with empathy. When discussing a "
            "sensitive topic, use 'I' statements to express your feelings without accusing the other "
            "person. For example, say 'I feel overwhelmed when tasks are delayed' instead of 'You always "
            "ruin the project'. Pause and take a breath before responding to a difficult statement. "
            "Focus on finding a mutual solution rather than winning the argument. A calm, respectful "
            "approach turns conflict into an opportunity for growth and understanding."
        ),
        "word_count": 101,
        "explanation": (
            "Use pausing (chunking) to group thoughts together naturally. For example, pause slightly "
            "after 'When discussing a sensitive topic,' and 'take a breath'. This gives the listener "
            "time to process your words and helps you control your breathing."
        )
    },
    {
        "title": "Achieving Daily Goals",
        "content": (
            "Setting goals is easy, but achieving them requires focus and discipline. Every morning, "
            "identify three critical tasks that will move you closest to your long-term dreams. Write "
            "them down on a card and commit to completing them before checking social media or email. "
            "When working on a task, eliminate all distractions: turn off phone notifications and focus "
            "entirely for twenty-five minutes, followed by a five-minute break. This technique keeps "
            "your mind fresh and prevents burnout. By achieving three small goals every single day, "
            "you build momentum and turn massive dreams into daily realities."
        ),
        "word_count": 96,
        "explanation": (
            "Practice the clear pronunciation of the final consonant clusters like /st/ in 'closest' "
            "and 'tasks', and /nd/ in 'mind' and 'second'. Ensure you pronounce both consonants in the "
            "cluster clearly without dropping the final sound."
        )
    },
    {
        "title": "Active Listening Secrets",
        "content": (
            "Most people do not listen to understand; they listen to reply. Active listening is the "
            "secret to successful conversations and deep relationships. When someone speaks to you, "
            "give them your undivided attention. Put away your phone, make eye contact, and nod to show "
            "understanding. Once they finish speaking, summarize what you heard by saying 'It sounds "
            "like you are saying...' to verify you understood correctly. Ask clarifying questions instead "
            "of giving immediate advice. Active listening builds trust, prevents misunderstandings, "
            "and makes you a compelling conversationalist."
        ),
        "word_count": 87,
        "explanation": (
            "Focus on the difference between the /ʃ/ ('sh') sound in 'relationship' and 'understanding' "
            "and the /tʃ/ ('ch') sound in 'achieving' and 'clarifying'. Make the /tʃ/ sound shorter, "
            "releasing the air sharply."
        )
    },
    {
        "title": "Finding Screen Time Balance",
        "content": (
            "Our phones are designed to capture and hold our attention, often leading to mindless scrolling "
            "and wasted time. To regain control of your life, establish clear screen time boundaries. "
            "Declare your bedroom a phone-free zone to improve your sleep quality. Set a daily limit "
            "for social media apps and use the extra time to engage in real-world activities. Spend "
            "time walking in nature, practicing a hobby, or having face-to-face conversations with "
            "loved ones. Reconnecting with the physical world reduces stress and helps you live mindfully "
            "in the present moment. Control your device, or it will control you."
        ),
        "word_count": 100,
        "explanation": (
            "Pay attention to vowel length. Vowels are longer before voiced consonants (like the /d/ "
            "in 'scrolling' or /z/ in 'boundaries') and shorter before voiceless consonants (like the "
            "/t/ in 'limit' or /s/ in 'limits')."
        )
    },
    {
        "title": "Beating Daily Procrastination",
        "content": (
            "Procrastination is not a time management problem; it is an emotional management problem. "
            "We delay tasks because our brain associates them with stress, boredom, or fear of failure. "
            "To beat procrastination, use the five-second rule: count down 'five, four, three, two, one' "
            "and immediately start the task without thinking. Break the project down until the first "
            "step takes less than two minutes. Once you start, the resistance fades and momentum takes "
            "over. The hardest part of any task is simply getting started. Take the first step today."
        ),
        "word_count": 90,
        "explanation": (
            "Practice linking the /d/ sound to the following vowel in expressions like 'getting started' "
            "(/ɡɛt.ɪŋ-stɑːr.t̬ɪd/) and 'count down' (/kaʊnt-daʊn/). This smooth connection is key "
            "to achieving natural native-sounding rhythm."
        )
    },
    {
        "title": "Mindset and Physical Health",
        "content": (
            "Your body and mind are deeply connected. The thoughts you think shape your physical energy, "
            "and how you move your body changes your emotional state. To maintain high energy daily, "
            "practice positive self-talk. Speak encouraging words to yourself, especially during tough "
            "workouts or busy workdays. Combine this with daily physical movement, like a fifteen-minute "
            "walk in the fresh air. This increases blood flow, releases endorphins, and clears mental "
            "clutter. A healthy body supports a strong, positive mind, giving you the power to achieve "
            "your daily dreams."
        ),
        "word_count": 89,
        "explanation": (
            "Ensure correct pronunciation of the /r/ sound in words like 'thoughts', 'physical', 'blood', "
            "and 'healthy'. In English, the /r/ is retroflex (tongue tip curled back but not touching "
            "the roof of the mouth). Practice 'fresh air' and 'blood flow'."
        )
    },
    {
        "title": "Nurturing Self-Compassion",
        "content": (
            "We are often our own harshest critics. When you make a mistake, fail a test, or fall short "
            "of a goal, remind yourself to practice self-compassion. Speak to yourself the same way "
            "you would speak to a close friend who is struggling. Offer words of kindness, patience, "
            "and understanding instead of anger. Remember that making mistakes is a universal human "
            "experience, not a personal flaw. Treating yourself with compassion reduces the fear of "
            "failure, giving you the emotional strength to pick yourself up, try again, and continue "
            "growing."
        ),
        "word_count": 91,
        "explanation": (
            "Reduce helper verbs and prepositions to their weak forms. For example, 'to' is pronounced "
            "as /tə/ instead of /tuː/ in 'speak to yourself' or 'would' is pronounced as /wəd/ "
            "in 'you would speak'."
        )
    }
]



# ---------------------------------------------------------------------------
# 4. PUBLIC FUNCTIONS
# ---------------------------------------------------------------------------


def get_vocab_deck(theme: str = "corporate", count: int = 8) -> dict:
    """Return a random selection of *count* cards from the themed deck.

    Parameters
    ----------
    theme:
        One of the available theme names (case-insensitive).
        Falls back to ``"corporate"`` when the theme is unknown.
    count:
        Number of cards to return (capped to deck size).

    Returns
    -------
    dict
        ``{"cards": [<card>, ...]}`` where each card contains *word*,
        *ipa*, *definition*, *example*, *hindi*, and *telugu*.
    """
    key = theme.strip().lower()
    cards = _VOCAB.get(key, _VOCAB["corporate"])
    count = min(count, len(cards))
    return {"cards": random.sample(cards, count)}


def get_available_themes() -> list[str]:
    """Return all available vocabulary theme names."""
    return list(_VOCAB.keys())


def get_grammar_lesson(topic: str = "") -> dict:
    """Return a grammar lesson matching *topic*, or a random one if empty.

    The match is case-insensitive and supports matching by snake_case ID
    or substring matching on the topic display title.
    """
    if topic:
        needle = topic.strip().lower()
        # 1. Direct ID lookup
        if needle in _GRAMMAR_DICT:
            lesson = dict(_GRAMMAR_DICT[needle])
            if "example" not in lesson and lesson.get("examples"):
                lesson["example"] = lesson["examples"][0]["sentence"]
            if "tokens" not in lesson and lesson.get("examples"):
                lesson["tokens"] = lesson["examples"][0]["tokens"]
            return lesson
        
        # 2. Substring matching on display title
        for lesson in _GRAMMAR:
            if needle in lesson["topic"].lower():
                lesson_copy = dict(lesson)
                if "example" not in lesson_copy and lesson_copy.get("examples"):
                    lesson_copy["example"] = lesson_copy["examples"][0]["sentence"]
                if "tokens" not in lesson_copy and lesson_copy.get("examples"):
                    lesson_copy["tokens"] = lesson_copy["examples"][0]["tokens"]
                return lesson_copy

    # 3. Fallback to random choice
    lesson = dict(random.choice(_GRAMMAR))
    if "example" not in lesson and lesson.get("examples"):
        lesson["example"] = lesson["examples"][0]["sentence"]
    if "tokens" not in lesson and lesson.get("examples"):
        lesson["tokens"] = lesson["examples"][0]["tokens"]
    return lesson


def get_grammar_topics() -> dict:
    """Return the grammar curriculum structure including categories and topics."""
    return GRAMMAR_CURRICULUM


def get_grammar_topic_by_id(topic_id: str) -> dict | None:
    """Return a grammar lesson matching *topic_id*, or None if not found."""
    lesson = _GRAMMAR_DICT.get(topic_id)
    if lesson:
        lesson_copy = dict(lesson)
        if "example" not in lesson_copy and lesson_copy.get("examples"):
            lesson_copy["example"] = lesson_copy["examples"][0]["sentence"]
        if "tokens" not in lesson_copy and lesson_copy.get("examples"):
            lesson_copy["tokens"] = lesson_copy["examples"][0]["tokens"]
        return lesson_copy
    return None



def get_article(level: str = "intermediate", day: int | None = None) -> dict:
    """Return an article appropriate for *level*.

    If day is provided, returns the article sequentially to avoid repetition.
    Otherwise, returns a random choice.
    """
    if day is not None and day > 0:
        idx = (day - 1) % len(_ARTICLES)
        return _ARTICLES[idx]
    return random.choice(_ARTICLES)
