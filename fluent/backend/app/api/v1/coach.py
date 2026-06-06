"""
Fluent API — Advanced English Coach endpoints.

Provides three training modules:
  1. /coach/tech-article     — Daily tech articles for business reading & executive summary practice
  2. /coach/tongue-twister   — Progressive tongue twisters for speech muscle training
  3. /coach/corporate-phrases — Weak-to-strong corporate phrase transformations
"""

from __future__ import annotations

import logging
import random
from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models import User

log = logging.getLogger(__name__)

router = APIRouter(prefix="/coach", tags=["coach"])

# ═══════════════════════════════════════════════════════════════════════
#  1. DAILY TECH ARTICLES
# ═══════════════════════════════════════════════════════════════════════

_TECH_ARTICLE_PROMPT = """You are an expert English Communication Coach specialising in executive business English.

Generate a tech/business article for an English learner to read, summarise, and discuss.

Return ONLY valid JSON with this exact structure:
{
  "title": "string — catchy headline (6–12 words)",
  "content": "string — a 250–400 word tech/business article written in clear, professional English. Cover a real-world technology or business topic. Include nuanced perspectives.",
  "key_tradeoffs": ["string", "string"] — exactly 2–3 trade-offs the reader should identify in the article,
  "executive_summary": "string — a model 2-sentence executive summary of the article",
  "discussion_prompt": "string — a thought-provoking question asking the reader to recommend a course of action based on the article",
  "vocabulary_highlights": ["string", "string", "string"] — 3–5 advanced vocabulary words from the article worth learning
}

Topic to write about: {topic}

Make the article insightful, balanced, and suitable for someone training to communicate at an executive level in English."""

_TECH_TOPICS = [
    "The trade-offs of migrating enterprise systems to microservices architecture",
    "How AI-driven automation is reshaping middle management roles in tech companies",
    "Cloud-native vs on-premise: evaluating total cost of ownership for startups",
    "The rise of low-code platforms and their impact on traditional software engineering",
    "Remote work technology infrastructure: balancing security with employee flexibility",
    "Edge computing versus cloud computing for IoT deployments in manufacturing",
    "The business case for investing in developer experience and internal tooling",
    "How tech companies are rethinking data privacy in the age of generative AI",
    "Platform engineering: building internal developer platforms vs buying SaaS solutions",
    "The sustainability challenge: reducing carbon footprint of large-scale data centres",
    "API-first strategy: how companies are turning internal tools into revenue streams",
    "The future of quantum computing and its practical business applications by 2030",
    "Digital transformation failures: lessons from enterprises that got it wrong",
    "Open source vs proprietary software: strategic considerations for CTOs",
    "How fintech is disrupting traditional banking through embedded finance solutions",
    "The impact of 5G networks on enterprise mobility and real-time collaboration",
    "Building resilient supply chains with predictive analytics and machine learning",
    "The ethical implications of facial recognition technology in workplace monitoring",
    "Zero-trust architecture: rethinking cybersecurity for the hybrid workforce",
    "Tech talent retention strategies: what keeps senior engineers from leaving",
]

_FALLBACK_TECH_ARTICLES: list[dict[str, Any]] = [
    {
        "title": "Microservices vs Monoliths: The Hidden Cost of Distribution",
        "content": "When Netflix famously migrated to microservices in 2012, it sparked a revolution in software architecture. Today, nearly every ambitious startup begins with a microservices-first approach. But is this always the right call?\n\nThe appeal is clear: microservices offer independent deployability, technology flexibility, and team autonomy. Each service can be scaled independently, and failures are isolated. For large organisations with hundreds of engineers, this decomposition enables parallel development at unprecedented speed.\n\nHowever, the hidden costs are substantial. Network latency between services replaces in-process function calls. Distributed tracing, service meshes, and API gateways add operational complexity. A simple database query that took milliseconds in a monolith now requires orchestrating calls across multiple services, each with its own failure mode.\n\nMoreover, microservices demand mature DevOps practices. Teams need robust CI/CD pipelines, container orchestration, and monitoring infrastructure. For a team of five engineers, maintaining twenty services can become a full-time job, leaving little capacity for feature development.\n\nThe pragmatic middle ground is emerging: start with a well-structured monolith, identify clear domain boundaries, and extract services only when the organisational or scaling needs justify the complexity. Companies like Shopify have demonstrated that a modular monolith can support enormous scale while maintaining developer productivity.\n\nThe key insight is that architecture should serve business objectives, not engineering aesthetics. The best architecture is the one your team can operate effectively.",
        "key_tradeoffs": [
            "Independent scalability vs increased operational complexity",
            "Team autonomy vs coordination overhead and distributed system challenges",
            "Technology flexibility vs the cost of maintaining polyglot infrastructure"
        ],
        "executive_summary": "While microservices offer scalability and team autonomy for large organisations, their hidden costs in operational complexity make them unsuitable for smaller teams. The pragmatic approach is to start with a modular monolith and extract services only when business needs justify the investment.",
        "discussion_prompt": "If you were advising a 15-person startup planning to scale to 100 engineers over three years, would you recommend starting with microservices or a modular monolith? What factors would drive your recommendation?",
        "vocabulary_highlights": ["deployability", "orchestrating", "pragmatic", "polyglot", "decomposition"]
    },
    {
        "title": "The AI Productivity Paradox: Why More Tools Don't Mean More Output",
        "content": "Enterprise spending on AI productivity tools exceeded $45 billion in 2025, yet worker productivity growth remains stubbornly flat. This disconnect — the AI Productivity Paradox — is forcing executives to rethink their technology investment strategies.\n\nThe issue isn't the technology itself. Modern AI tools are genuinely capable: they can draft emails, summarise meetings, generate code, and analyse data. The problem lies in implementation. Most organisations deploy AI tools without redesigning workflows, creating a layer of technology on top of existing processes rather than transforming them.\n\nConsider the typical knowledge worker's day. They now have an AI assistant for email, another for document creation, a third for meeting notes, and a fourth for project management. Each tool requires context-switching, prompt engineering, and output verification. The cognitive overhead of managing these tools often negates the time they save.\n\nSuccessful AI adoption requires a fundamentally different approach. Instead of asking 'What tasks can AI do?', leaders should ask 'What outcomes do we need, and how should workflows be redesigned around AI capabilities?' This means eliminating unnecessary steps entirely, not just automating them.\n\nCompanies seeing genuine productivity gains are those that have restructured roles and processes. They've created new positions like 'AI workflow designers' and invested heavily in training. The technology is the easy part; the organisational transformation is where the real challenge — and value — lies.\n\nThe executives who will thrive are those who treat AI not as a tool to add, but as a catalyst for reimagining how work gets done.",
        "key_tradeoffs": [
            "Deploying many AI tools quickly vs investing time in workflow redesign",
            "Automating existing processes vs fundamentally rethinking them",
            "Short-term tool adoption costs vs long-term organisational transformation investment"
        ],
        "executive_summary": "Despite massive enterprise spending on AI tools, productivity gains remain flat because organisations layer technology onto existing workflows rather than redesigning them. Companies achieving real results are those restructuring roles and processes around AI capabilities, not just adding tools.",
        "discussion_prompt": "As a technology leader, how would you balance the urgency to adopt AI tools with the need for deep workflow transformation? What would your first three steps be?",
        "vocabulary_highlights": ["paradox", "stubbornly", "cognitive overhead", "catalyst", "reimagining"]
    },
    {
        "title": "Remote Work Infrastructure: Security vs Flexibility in the Hybrid Era",
        "content": "Three years into the hybrid work revolution, CIOs face a defining challenge: how to build technology infrastructure that is both secure and flexible. The tension between these two objectives is reshaping enterprise IT strategy.\n\nTraditional security models relied on perimeter defence — firewalls, VPNs, and controlled office networks. With employees working from homes, coffee shops, and co-working spaces across multiple time zones, this perimeter has effectively dissolved. The attack surface has expanded dramatically, and security teams are struggling to maintain visibility.\n\nThe response has been a shift toward zero-trust architecture, where every access request is verified regardless of location. While conceptually sound, zero-trust implementation is expensive and complex. It requires identity management overhauls, micro-segmentation of networks, and continuous authentication — all of which can frustrate employees accustomed to seamless access.\n\nThe flexibility imperative is equally compelling. Top talent increasingly demands location independence. Companies that restrict remote access or impose cumbersome security protocols risk losing engineers to competitors offering frictionless work experiences. A recent survey found that 67% of tech professionals would decline a role that required full-time office attendance.\n\nLeading organisations are finding balance through risk-tiered access models. Routine tasks like email and messaging operate with minimal friction, while sensitive operations — accessing production databases, deploying code, handling customer data — require additional verification steps. This graduated approach preserves the daily work experience while protecting critical assets.\n\nThe winning strategy isn't choosing between security and flexibility — it's designing systems where both coexist through intelligent, context-aware policies.",
        "key_tradeoffs": [
            "Strict security controls vs employee experience and talent retention",
            "Zero-trust implementation costs vs the risk exposure of legacy perimeter models",
            "Uniform security policies vs risk-tiered access that balances usability and protection"
        ],
        "executive_summary": "The hybrid work era has dissolved traditional security perimeters, forcing organisations toward zero-trust architecture that can frustrate employees. Leading companies are adopting risk-tiered access models that maintain seamless daily workflows while adding verification for sensitive operations.",
        "discussion_prompt": "If tasked with redesigning your company's remote access infrastructure, how would you prioritise security investments while ensuring the developer experience remains competitive?",
        "vocabulary_highlights": ["perimeter", "micro-segmentation", "frictionless", "imperative", "graduated"]
    },
    {
        "title": "Platform Engineering: Build vs Buy for Internal Developer Tools",
        "content": "The rise of platform engineering represents a fundamental shift in how organisations think about developer productivity. Rather than expecting each team to build and maintain their own tooling, companies are creating dedicated platform teams that provide self-service capabilities to the entire engineering organisation.\n\nThe build vs buy decision sits at the heart of this movement. Building custom internal platforms offers tight integration with existing systems, precise control over developer workflows, and the ability to encode organisational knowledge into tooling. Spotify's Backstage, originally an internal tool, demonstrates how a well-built platform can become a competitive advantage and even an open-source standard.\n\nHowever, building comes at a steep cost. A capable platform team requires 5–10 dedicated engineers, and the platform itself needs ongoing maintenance, documentation, and support. Many organisations underestimate this commitment, launching ambitious platform initiatives that eventually stagnate due to insufficient investment.\n\nBuying SaaS solutions — platforms like Humanitec, Cortex, or Port — offers faster time-to-value and professional support. These products incorporate best practices from hundreds of engineering organisations. But they also impose constraints: vendor lock-in, limited customisation, and subscription costs that scale with team size.\n\nThe emerging best practice is a hybrid approach: adopt a SaaS platform for foundational capabilities like service catalogues and deployment pipelines, then build custom extensions for organisation-specific workflows. This strategy captures 80% of the value at 30% of the cost of a fully custom build.\n\nThe decision ultimately depends on engineering maturity. Teams with fewer than 50 developers rarely justify a custom platform, while those exceeding 200 often can't afford not to build one.",
        "key_tradeoffs": [
            "Custom platform control and integration vs the high cost of dedicated platform teams",
            "SaaS speed-to-value vs vendor lock-in and limited customisation",
            "Hybrid approach flexibility vs the complexity of managing both custom and SaaS components"
        ],
        "executive_summary": "Platform engineering is shifting developer tooling from team-level DIY to centralised self-service platforms, with organisations choosing between building custom solutions and buying SaaS products. The emerging best practice is a hybrid approach — adopting SaaS for foundations and building custom extensions — balancing cost, speed, and organisational fit.",
        "discussion_prompt": "For an engineering organisation of 80 developers with plans to double in two years, would you recommend building a custom platform, buying SaaS, or a hybrid approach? How would you present this recommendation to the CTO?",
        "vocabulary_highlights": ["self-service", "stagnate", "foundational", "lock-in", "maturity"]
    },
    {
        "title": "Generative AI and Data Privacy: Navigating the Regulatory Minefield",
        "content": "As generative AI tools become embedded in enterprise workflows, data privacy has emerged as the most pressing governance challenge facing technology leaders. The core tension is stark: AI models perform better with more data, but using that data increasingly conflicts with privacy regulations and customer expectations.\n\nThe regulatory landscape is fragmenting rapidly. The EU's AI Act imposes strict requirements on high-risk AI systems, including mandatory transparency and human oversight. California's CCPA grants consumers the right to opt out of automated decision-making. Meanwhile, emerging regulations in India, Brazil, and Southeast Asia create a patchwork of compliance requirements that global companies must navigate simultaneously.\n\nFor enterprises using third-party AI services, the data flow question is particularly acute. When an employee pastes customer information into an AI chatbot, that data may be processed on servers in multiple jurisdictions, potentially violating data residency requirements. Several major banks have already banned the use of external AI tools, preferring to build or host models internally despite the higher cost.\n\nThe technical solutions are evolving rapidly. Federated learning allows models to train on distributed data without centralising it. Differential privacy adds mathematical noise to datasets, preserving analytical utility while protecting individual records. Retrieval-augmented generation (RAG) architectures can limit AI access to approved data sources, reducing the risk of inadvertent data exposure.\n\nForward-thinking companies are appointing AI governance officers who bridge legal, technical, and business functions. They're establishing AI usage policies that classify data sensitivity levels and prescribe appropriate tools for each. The organisations that get governance right will turn privacy compliance into a competitive advantage, building customer trust while their competitors face regulatory penalties.",
        "key_tradeoffs": [
            "AI model performance (more data) vs privacy compliance and customer trust",
            "Using third-party AI services (lower cost) vs self-hosting models (greater control)",
            "Speed of AI adoption vs the time required to establish proper governance frameworks"
        ],
        "executive_summary": "Generative AI adoption is colliding with a fragmenting global privacy regulatory landscape, forcing enterprises to choose between powerful third-party AI services and controlled self-hosted alternatives. Companies establishing strong AI governance frameworks early will turn compliance into a competitive advantage through greater customer trust.",
        "discussion_prompt": "If you were presenting an AI governance strategy to your board of directors, how would you frame the balance between innovation speed and regulatory risk? What three policies would you implement first?",
        "vocabulary_highlights": ["governance", "patchwork", "federated", "inadvertent", "prescribe"]
    },
]


# ═══════════════════════════════════════════════════════════════════════
#  2. DAILY TONGUE TWISTERS
# ═══════════════════════════════════════════════════════════════════════

_TONGUE_TWISTER_PROMPT = """You are an expert English Speech Coach and Pronunciation Trainer.

Generate a set of tongue twisters for English fluency training at the "{level}" level.

Return ONLY valid JSON with this exact structure:
{{
  "level": "{level}",
  "warm_up": "string — a simple warm-up phrase to loosen the mouth muscles before starting",
  "twisters": [
    {{
      "text": "string — the tongue twister (1–3 sentences)",
      "focus_sounds": ["string", "string"] — the 1–2 key phonetic sounds this twister trains (e.g. 'th', 'sh', 'r/l'),
      "tip": "string — a brief pronunciation tip for this twister"
    }},
    ... exactly 3 twisters
  ],
  "challenge": "string — a harder bonus tongue twister for extra practice"
}}

Requirements:
- Beginner: Simple repeated sounds, short phrases
- Intermediate: Mixed consonant clusters, moderate length
- Advanced: Complex sound combinations, longer phrases, rapid transitions

Make each twister fun, memorable, and genuinely helpful for English speech muscle training."""

_FALLBACK_TWISTERS: dict[str, list[dict[str, Any]]] = {
    "beginner": [
        {
            "level": "beginner",
            "warm_up": "Red lorry, yellow lorry. Say it slowly three times, then speed up.",
            "twisters": [
                {"text": "She sells sea shells by the seashore.", "focus_sounds": ["sh", "s"], "tip": "Keep your tongue behind your teeth for 'S' and push it forward slightly for 'SH'."},
                {"text": "Peter Piper picked a peck of pickled peppers.", "focus_sounds": ["p"], "tip": "Use short bursts of air for each 'P' — feel the pop on your lips."},
                {"text": "How much wood would a woodchuck chuck if a woodchuck could chuck wood?", "focus_sounds": ["w", "ch"], "tip": "Round your lips tightly for 'W' and snap the tongue for 'CH'."}
            ],
            "challenge": "I saw Susie sitting in a shoe shine shop. Where she shines, she sits, and where she sits, she shines."
        },
        {
            "level": "beginner",
            "warm_up": "Toy boat, toy boat, toy boat. Keep your jaw relaxed.",
            "twisters": [
                {"text": "Big black bugs bleed blue black blood.", "focus_sounds": ["b", "bl"], "tip": "Press your lips together firmly before releasing each 'B' blend."},
                {"text": "Fresh French fried fish.", "focus_sounds": ["fr", "f"], "tip": "Bite your lower lip lightly for 'F' and roll into the 'R' smoothly."},
                {"text": "Six slippery snails slid slowly seaward.", "focus_sounds": ["s", "sl"], "tip": "Keep the 'S' sharp and hissing, then flow into the 'L' without stopping."}
            ],
            "challenge": "Whether the weather is cold, or whether the weather is hot, we'll weather the weather, whatever the weather, whether we like it or not."
        },
        {
            "level": "beginner",
            "warm_up": "Unique New York, unique New York. Focus on the 'yoo-NEEK' sound.",
            "twisters": [
                {"text": "Betty Botter bought some butter, but she said the butter's bitter.", "focus_sounds": ["b", "t"], "tip": "Alternate between lip-press 'B' and tongue-tap 'T' crisply."},
                {"text": "A proper copper coffee pot.", "focus_sounds": ["p", "k"], "tip": "Hit each plosive with a clean burst — don't let them blur together."},
                {"text": "Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair.", "focus_sounds": ["z", "w"], "tip": "Buzz the 'Z' sound from your vocal cords and round lips for 'W'."}
            ],
            "challenge": "I scream, you scream, we all scream for ice cream."
        },
    ],
    "intermediate": [
        {
            "level": "intermediate",
            "warm_up": "The lips, the teeth, the tip of the tongue. Repeat five times.",
            "twisters": [
                {"text": "The thirty-three thieves thought that they thrilled the throne throughout Thursday.", "focus_sounds": ["th"], "tip": "Place your tongue tip between your teeth and push air for 'TH'. Don't substitute with 'D' or 'T'."},
                {"text": "Lesser leather never weathered wetter weather better.", "focus_sounds": ["l", "th", "w"], "tip": "Transition smoothly between tongue-tip 'L', interdental 'TH', and rounded-lip 'W'."},
                {"text": "Can you can a canned can into an uncanned can like a canner can can a canned can into an uncanned can?", "focus_sounds": ["k", "n"], "tip": "Keep the back of your tongue active for 'K' and drop to nasal 'N' quickly."}
            ],
            "challenge": "The sixth sick sheikh's sixth sheep's sick."
        },
        {
            "level": "intermediate",
            "warm_up": "Mommy made me mash my M&Ms. Feel the vibration on your lips.",
            "twisters": [
                {"text": "How can a clam cram in a clean cream can?", "focus_sounds": ["cl", "cr"], "tip": "Keep the 'CL' and 'CR' clusters distinct — don't merge the consonants."},
                {"text": "I wish to wash my Irish wristwatch.", "focus_sounds": ["w", "sh", "r"], "tip": "The 'W' to 'SH' transition requires rapid lip and tongue repositioning."},
                {"text": "Near an ear, a nearer ear, a nearly eerie ear.", "focus_sounds": ["n", "ear"], "tip": "Focus on the subtle difference between 'near', 'nearer', and 'eerie' — the vowel shifts are key."}
            ],
            "challenge": "If a dog chews shoes, whose shoes does he choose?"
        },
        {
            "level": "intermediate",
            "warm_up": "Rubber baby buggy bumpers. Start slow, then accelerate.",
            "twisters": [
                {"text": "Which wristwatches are Swiss wristwatches?", "focus_sounds": ["w", "sw"], "tip": "The 'WR' is silent — say 'rist' not 'wrist'. Then round lips for 'SW'."},
                {"text": "Fred fed Ted bread, and Ted fed Fred bread.", "focus_sounds": ["f", "d", "br"], "tip": "Keep the rhythm steady — this is about consistent pacing across similar sounds."},
                {"text": "Eleven benevolent elephants.", "focus_sounds": ["l", "v", "f"], "tip": "Move between 'L' (tongue up), 'V' (teeth on lip), and 'F' (same but voiceless) precisely."}
            ],
            "challenge": "A tutor who tooted the flute tried to tutor two tooters to toot. Said the two to the tutor, is it tougher to toot, or to tutor two tooters to toot?"
        },
    ],
    "advanced": [
        {
            "level": "advanced",
            "warm_up": "Pad kid poured curd pulled cod. This is rated one of the hardest tongue twisters ever — try it slowly first.",
            "twisters": [
                {"text": "Brisk brave brigadiers brandished broad bright blades, blunderbusses, and bludgeons — balancing them badly.", "focus_sounds": ["br", "bl"], "tip": "Maintain the 'BR' and 'BL' clusters at speed without swallowing the consonants."},
                {"text": "Imagine an imaginary menagerie manager managing an imaginary menagerie.", "focus_sounds": ["m", "n", "j"], "tip": "The nasal 'M' to 'N' transitions combined with soft 'J' in 'imaginary' challenge your velum control."},
                {"text": "Specific Pacific, specific Pacific. The specific Pacific specific to the Pacific is specifically pacific.", "focus_sounds": ["sp", "p", "f"], "tip": "Distinguish 'specific' (sp-) from 'Pacific' (p-) — the initial sibilant makes all the difference."}
            ],
            "challenge": "If you must cross a coarse, cross cow across a crowded cow crossing, cross the cross, coarse cow across the crowded cow crossing carefully."
        },
        {
            "level": "advanced",
            "warm_up": "Irish wristwatch, Swiss wristwatch. The ultimate warm-up — try three times fast.",
            "twisters": [
                {"text": "The seething sea ceaseth and thus the seething sea sufficeth us.", "focus_sounds": ["s", "th", "f"], "tip": "Three fricatives in rapid succession — sibilant 'S', interdental 'TH', and labiodental 'F'."},
                {"text": "Rory the warrior and Roger the worrier were reared wrongly in a rural brewery.", "focus_sounds": ["r", "w"], "tip": "The 'R/W' minimal pairs here expose whether you're using the tongue-tip (R) vs lip-rounding (W) correctly."},
                {"text": "She stood on the balcony inexplicably mimicking him hiccupping and amicably welcoming him in.", "focus_sounds": ["m", "k", "l"], "tip": "The polysyllabic words demand precise stress placement — 'inEXplicably', 'AMicably'."}
            ],
            "challenge": "Pad kid poured curd pulled cod. Pad kid poured curd pulled cod. Pad kid poured curd pulled cod."
        },
        {
            "level": "advanced",
            "warm_up": "Peggy Babcock, Peggy Babcock, Peggy Babcock. Feel the lip explosions.",
            "twisters": [
                {"text": "To sit in solemn silence on a dull dark dock in a pestilential prison with a life-long lock, awaiting the sensation of a short sharp shock from a cheap and chippy chopper on a big black block.", "focus_sounds": ["s", "sh", "ch"], "tip": "Three sibilant variants in sequence: flat 'S', palatalized 'SH', and affricate 'CH'. Control the tongue position for each."},
                {"text": "Theophilus Thistle, the thistle-sifter, sifted a sieve of unsifted thistles.", "focus_sounds": ["th", "s"], "tip": "The 'TH' to 'S' transition is the crux — tongue between teeth, then behind teeth, rapidly."},
                {"text": "Six Czech cricket critics.", "focus_sounds": ["s", "ch", "cr", "k"], "tip": "Four different consonant clusters in six words — focus on clean articulation of each cluster boundary."}
            ],
            "challenge": "The epitome of femininity is to exhibit the ephemeral quality of ethereal epiphanies."
        },
    ],
}


# ═══════════════════════════════════════════════════════════════════════
#  3. CORPORATE COMMUNICATION PHRASES
# ═══════════════════════════════════════════════════════════════════════

_CORPORATE_PHRASES_PROMPT = """You are an expert Corporate Communication Coach who transforms casual, weak, or unprofessional English phrases into executive-level, confident, and diplomatic language.

Generate a set of phrase transformations for corporate communication training.

Return ONLY valid JSON with this exact structure:
{{
  "phrases": [
    {{
      "weak": "string — the casual/unprofessional phrase people commonly say",
      "strong": "string — the executive-level alternative",
      "context": "string — brief explanation of when/why to use the strong version",
      "category": "string — one of: assertiveness, clarity, professionalism, diplomacy"
    }},
    ... exactly 10 phrases
  ],
  "scenario": "string — a 3–4 sentence mini role-play scenario where the learner must apply 2–3 of the strong phrases in context. Describe the situation and what the learner should say."
}}

Focus on phrases commonly heard in IT, corporate, and professional settings. Mix all four categories.
Make the transformations genuinely useful for someone moving from intermediate to executive-level English."""

_FALLBACK_CORPORATE_PHRASES: list[dict[str, Any]] = [
    {
        "phrases": [
            {"weak": "I think maybe we should...", "strong": "I'd like to suggest that we...", "context": "When proposing an idea in a meeting, lead with confidence rather than hedging with 'maybe'.", "category": "assertiveness"},
            {"weak": "I'm confused.", "strong": "Could you please elaborate on that point?", "context": "Requesting clarity shows engagement, not weakness. It positions you as attentive.", "category": "clarity"},
            {"weak": "That's not my job.", "strong": "I'm not the right person for that, but I can connect you with someone who is.", "context": "Redirecting professionally shows teamwork and initiative rather than defensiveness.", "category": "professionalism"},
            {"weak": "I don't agree with you.", "strong": "I see it differently. Here's my perspective...", "context": "Framing disagreement as offering a different perspective invites dialogue rather than conflict.", "category": "diplomacy"},
            {"weak": "Sorry for the late reply.", "strong": "Thank you for your patience.", "context": "Gratitude-framing is more positive and confident than apologising unnecessarily.", "category": "professionalism"},
            {"weak": "I don't know.", "strong": "That's a great question. Let me look into it and get back to you by end of day.", "context": "Committing to a timeline shows reliability and professionalism.", "category": "assertiveness"},
            {"weak": "I'll try to get it done.", "strong": "I'll have this completed by Thursday.", "context": "Specific commitments build trust. 'Try' signals uncertainty.", "category": "assertiveness"},
            {"weak": "Can I ask a stupid question?", "strong": "I'd like to clarify something.", "context": "Never diminish your own questions. Requesting clarification is a sign of thoroughness.", "category": "clarity"},
            {"weak": "You're wrong about that.", "strong": "I'd like to offer an alternative viewpoint on this.", "context": "In executive communication, direct contradiction shuts down dialogue. Offering alternatives keeps it open.", "category": "diplomacy"},
            {"weak": "I was just wondering if...", "strong": "I'd like to understand...", "context": "Remove minimising language ('just', 'wondering'). State your intent directly.", "category": "clarity"}
        ],
        "scenario": "You're in a cross-functional sprint planning meeting. The project manager proposes a tight deadline that you believe is unrealistic. Your team lead asks if you can handle the additional QA workload for another team. Respond using confident, executive-level language: express your perspective on the timeline diplomatically, redirect the QA request professionally, and commit to what you can deliver with a specific timeline."
    },
    {
        "phrases": [
            {"weak": "Basically, what I'm trying to say is...", "strong": "In summary, my recommendation is...", "context": "Executive communication is direct. Remove filler phrases that undermine your message.", "category": "clarity"},
            {"weak": "I feel like this might not work.", "strong": "Based on the data, I have concerns about the feasibility of this approach.", "context": "Ground your objections in evidence, not feelings. This carries more weight.", "category": "assertiveness"},
            {"weak": "No offence, but...", "strong": "I'd like to share some constructive feedback.", "context": "Saying 'no offence' signals that offence is coming. Frame it as constructive instead.", "category": "diplomacy"},
            {"weak": "Does that make sense?", "strong": "I'd welcome your thoughts on this.", "context": "Asking 'does that make sense' implies the listener might not understand. Inviting input is more respectful.", "category": "diplomacy"},
            {"weak": "I'm not sure, but...", "strong": "Based on my experience, I believe...", "context": "Lead with your expertise, not your uncertainty. You were hired for your knowledge.", "category": "assertiveness"},
            {"weak": "This is a disaster.", "strong": "This is a critical situation that requires immediate attention.", "context": "Replace emotional language with precise, action-oriented language in professional settings.", "category": "professionalism"},
            {"weak": "Why didn't you do it?", "strong": "Can you help me understand the current status of this task?", "context": "Inquiry-based language prevents defensiveness and gathers useful information.", "category": "diplomacy"},
            {"weak": "I'm swamped right now.", "strong": "I'm currently at capacity. Let me review my priorities and see how we can accommodate this.", "context": "Showing a problem-solving mindset even when declining work demonstrates leadership.", "category": "professionalism"},
            {"weak": "That's a good idea, but...", "strong": "That's a strong foundation. To build on it, I'd suggest...", "context": "'But' negates everything before it. 'Build on it' validates and extends.", "category": "diplomacy"},
            {"weak": "I guess we could do that.", "strong": "That's a viable option. Let me outline the steps to make it happen.", "context": "Replace tentative agreement with decisive ownership of the path forward.", "category": "assertiveness"}
        ],
        "scenario": "You're presenting quarterly results to senior leadership. The numbers are below target due to factors outside your team's control. A VP asks why the targets were missed and suggests your team needs more oversight. Respond with executive presence: acknowledge the results with data-driven context, redirect the oversight suggestion diplomatically, and present your recovery plan with confident language."
    },
    {
        "phrases": [
            {"weak": "Honestly speaking...", "strong": "To be transparent about this...", "context": "Starting with 'honestly' implies you aren't normally honest. 'Transparent' is more professional.", "category": "professionalism"},
            {"weak": "I'm bad at this.", "strong": "This is an area where I'm actively developing my skills.", "context": "Growth mindset language turns a weakness into a development opportunity.", "category": "assertiveness"},
            {"weak": "We've always done it this way.", "strong": "While this approach has served us well, I'm open to exploring alternatives.", "context": "Defending the status quo signals rigidity. Openness signals leadership.", "category": "clarity"},
            {"weak": "I need this ASAP.", "strong": "Could we prioritise this for completion by Wednesday at noon?", "context": "'ASAP' is vague and creates stress. Specific deadlines enable planning.", "category": "clarity"},
            {"weak": "Let me know what you think.", "strong": "I'd appreciate your feedback on the proposal by Friday so we can move to the next phase.", "context": "Pair your request with a deadline and reason to drive action.", "category": "assertiveness"},
            {"weak": "That's above my pay grade.", "strong": "That decision would benefit from leadership input. I'll escalate it with my recommendation.", "context": "Adding your recommendation shows initiative even when escalating.", "category": "professionalism"},
            {"weak": "Sorry to bother you.", "strong": "Thank you for making time for this.", "context": "You're not a bother — you're a professional with a legitimate need. Lead with appreciation.", "category": "professionalism"},
            {"weak": "It's fine, whatever.", "strong": "I'm comfortable with either approach. Here's what I'd consider when deciding...", "context": "Show engagement even when flexible. Add value by sharing decision criteria.", "category": "diplomacy"},
            {"weak": "I can't do that.", "strong": "Here's what I can do, and here's what we'd need to make the rest possible.", "context": "Lead with solutions, not limitations. Show what's achievable.", "category": "assertiveness"},
            {"weak": "Let's take this offline.", "strong": "Let's schedule a focused discussion on this to give it the attention it deserves.", "context": "'Offline' can feel dismissive. Framing it as 'focused discussion' adds value.", "category": "diplomacy"}
        ],
        "scenario": "You're onboarding a new team member who repeatedly asks the same questions and seems uncertain about their responsibilities. Rather than showing frustration, use professional coaching language: redirect them to documentation diplomatically, offer constructive guidance on self-sufficiency, and set clear expectations for the next check-in with a specific timeline."
    },
]


# ═══════════════════════════════════════════════════════════════════════
#  ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════

from datetime import date

_tech_article_cache: dict[date, dict] = {}
_tongue_twister_cache: dict[str, dict] = {}
_corporate_phrases_cache: dict[date, dict] = {}


@router.get("/tech-article")
async def get_tech_article(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return a daily tech/business article with trade-off analysis and executive summary practice."""
    today = date.today()
    if today in _tech_article_cache:
        return _tech_article_cache[today]

    # Serve high-quality articles from the library sequentially to save AI cost and load instantly
    try:
        idx = today.day % len(_FALLBACK_TECH_ARTICLES)
        article = dict(_FALLBACK_TECH_ARTICLES[idx])
        if "vocabulary_highlights" not in article:
            article["vocabulary_highlights"] = []
        _tech_article_cache[today] = article
        return article
    except Exception as exc:
        log.warning("Failed to load tech article from library: %s", exc)

    try:
        from app.services.ai_router import ai_json

        topic = random.choice(_TECH_TOPICS)
        prompt = _TECH_ARTICLE_PROMPT.format(topic=topic)

        data = await ai_json([
            {"role": "system", "content": "You are an expert English Communication Coach. Return only valid JSON."},
            {"role": "user", "content": prompt},
        ])

        # Validate required fields
        required = ["title", "content", "key_tradeoffs", "executive_summary", "discussion_prompt"]
        if all(k in data for k in required):
            if "vocabulary_highlights" not in data:
                data["vocabulary_highlights"] = []
            _tech_article_cache[today] = data
            return data
        else:
            log.warning("AI tech-article response missing required fields, falling back")
            raise ValueError("Missing fields")

    except Exception as exc:
        log.info("Tech article AI generation failed (%s), using fallback", exc)
        return random.choice(_FALLBACK_TECH_ARTICLES)


import urllib.parse

def _get_tts_url(text: str) -> str:
    # Google Translate TTS limit is 200 chars.
    clean_text = text.replace("\n", " ").strip()
    truncated = clean_text[:200]
    encoded = urllib.parse.quote_plus(truncated)
    return f"https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q={encoded}"


@router.get("/tongue-twister")
async def get_tongue_twister(
    level: str = Query("intermediate", pattern="^(beginner|intermediate|advanced)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return a set of tongue twisters for speech muscle training at the specified level."""
    today = date.today()
    cache_key = f"{level}:{today}"
    if cache_key in _tongue_twister_cache:
        return _tongue_twister_cache[cache_key]

    # Serve high-quality pre-defined tongue twisters instantly with zero AI cost
    try:
        pool = _FALLBACK_TWISTERS.get(level, _FALLBACK_TWISTERS["intermediate"])
        idx = today.day % len(pool)
        data = dict(pool[idx])
        # Add audio URLs dynamically to both AI generated and fallback data
        data["warm_up_audio"] = _get_tts_url(data.get("warm_up", ""))
        data["challenge_audio"] = _get_tts_url(data.get("challenge", ""))
        for t in data.get("twisters", []):
            t["audio_url"] = _get_tts_url(t.get("text", ""))

        _tongue_twister_cache[cache_key] = data
        return data
    except Exception as exc:
        log.warning("Failed to load tongue twister from fallback library: %s", exc)

    try:
        from app.services.ai_router import ai_json

        prompt = _TONGUE_TWISTER_PROMPT.format(level=level)

        data = await ai_json([
            {"role": "system", "content": "You are an expert English Speech Coach. Return only valid JSON."},
            {"role": "user", "content": prompt},
        ])

        # Validate structure
        if "twisters" in data and isinstance(data["twisters"], list) and len(data["twisters"]) >= 2:
            data["level"] = level
            if "warm_up" not in data:
                data["warm_up"] = "Red lorry, yellow lorry. Repeat three times."
            if "challenge" not in data:
                data["challenge"] = "She sells sea shells by the seashore."
        else:
            raise ValueError("Invalid twister structure")

    except Exception as exc:
        log.info("Tongue twister AI generation failed (%s), using fallback", exc)
        pool = _FALLBACK_TWISTERS.get(level, _FALLBACK_TWISTERS["intermediate"])
        data = dict(random.choice(pool))

    # Add audio URLs dynamically to both AI generated and fallback data
    data["warm_up_audio"] = _get_tts_url(data.get("warm_up", ""))
    data["challenge_audio"] = _get_tts_url(data.get("challenge", ""))
    for t in data.get("twisters", []):
        t["audio_url"] = _get_tts_url(t.get("text", ""))

    _tongue_twister_cache[cache_key] = data
    return data


@router.get("/corporate-phrases")
async def get_corporate_phrases(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return a set of weak-to-strong corporate phrase transformations with a role-play scenario."""
    today = date.today()
    if today in _corporate_phrases_cache:
        return _corporate_phrases_cache[today]

    # Serve high-quality pre-defined corporate phrases instantly with zero AI cost
    try:
        idx = today.day % len(_FALLBACK_CORPORATE_PHRASES)
        data = dict(_FALLBACK_CORPORATE_PHRASES[idx])
        _corporate_phrases_cache[today] = data
        return data
    except Exception as exc:
        log.warning("Failed to load corporate phrases from fallback library: %s", exc)

    try:
        from app.services.ai_router import ai_json

        data = await ai_json([
            {"role": "system", "content": "You are an expert Corporate Communication Coach. Return only valid JSON."},
            {"role": "user", "content": _CORPORATE_PHRASES_PROMPT},
        ])

        # Validate structure
        if "phrases" in data and isinstance(data["phrases"], list) and len(data["phrases"]) >= 5:
            if "scenario" not in data:
                data["scenario"] = "Practice using these phrases in your next team meeting."
            _corporate_phrases_cache[today] = data
            return data
        else:
            raise ValueError("Invalid phrase structure")

    except Exception as exc:
        log.info("Corporate phrases AI generation failed (%s), using fallback", exc)
        return random.choice(_FALLBACK_CORPORATE_PHRASES)
