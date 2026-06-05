import re
from collections import Counter
from typing import Dict, List, Optional

from app.ai.skills import extract_skills, extract_skills_by_category


SECTION_KEYWORDS = {
    "summary": [
        "summary",
        "professional summary",
        "profile",
        "career profile",
        "objective",
        "career objective",
        "about me",
    ],
    "education": [
        "education",
        "academic background",
        "academic qualifications",
        "qualifications",
        "degree",
        "university",
        "college",
        "school",
    ],
    "experience": [
        "experience",
        "work experience",
        "employment",
        "employment history",
        "professional experience",
        "career history",
        "internship",
        "internships",
    ],
    "projects": [
        "projects",
        "academic projects",
        "personal projects",
        "portfolio",
        "project experience",
    ],
    "skills": [
        "skills",
        "technical skills",
        "core skills",
        "key skills",
        "professional skills",
        "tools",
        "technologies",
    ],
    "certifications": [
        "certification",
        "certifications",
        "certificate",
        "certificates",
        "licenses",
        "training",
        "courses",
    ],
    "languages": [
        "languages",
        "language skills",
    ],
    "achievements": [
        "achievements",
        "awards",
        "honors",
        "key achievements",
        "accomplishments",
    ],
}


ACTION_VERBS = [
    "developed",
    "designed",
    "implemented",
    "improved",
    "created",
    "built",
    "managed",
    "led",
    "optimized",
    "automated",
    "delivered",
    "analyzed",
    "integrated",
    "maintained",
    "collaborated",
    "reduced",
    "increased",
    "achieved",
    "deployed",
    "resolved",
    "streamlined",
]


def clean_text(text: str) -> str:
    if not text:
        return ""

    text = text.replace("\r", " ")
    text = text.replace("\t", " ")
    text = re.sub(r"\n{2,}", "\n", text)
    text = re.sub(r"[ ]{2,}", " ", text)

    return text.strip()


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def extract_email(text: str) -> Optional[str]:
    match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    return match.group(0) if match else None


def extract_phone(text: str) -> Optional[str]:
    patterns = [
        r"(\+?\d[\d\s\-()]{7,}\d)",
        r"(\+94\s?\d{2}\s?\d{3}\s?\d{4})",
        r"(0\d{2}\s?\d{3}\s?\d{4})",
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            phone = match.group(0).strip()
            digits = re.sub(r"\D", "", phone)

            if 9 <= len(digits) <= 15:
                return phone

    return None


def extract_links(text: str) -> List[str]:
    pattern = r"(https?://[^\s,]+|www\.[^\s,]+|linkedin\.com/[^\s,]+|github\.com/[^\s,]+|behance\.net/[^\s,]+|dribbble\.com/[^\s,]+)"
    links = re.findall(pattern, text.lower())

    cleaned_links = []
    for link in links:
        cleaned = link.strip().rstrip(".,)")
        if cleaned not in cleaned_links:
            cleaned_links.append(cleaned)

    return cleaned_links


def detect_sections(text: str) -> Dict[str, bool]:
    lower = normalize_text(text)

    sections = {}

    for section, keywords in SECTION_KEYWORDS.items():
        sections[section] = any(
            re.search(rf"\b{re.escape(keyword)}\b", lower)
            for keyword in keywords
        )

    return sections


def extract_bullets(text: str) -> List[str]:
    lines = text.splitlines()
    bullets = []

    for line in lines:
        clean = line.strip()

        if re.match(r"^[-•*●▪–]\s+", clean):
            bullets.append(clean)

        elif re.match(r"^\d+\.\s+", clean):
            bullets.append(clean)

    return bullets


def extract_numbers_and_metrics(text: str) -> List[str]:
    patterns = [
        r"\d+%",
        r"\d+\+",
        r"\$\d+[\w,]*",
        r"\d+\s*(years|year|months|month|users|clients|projects|hours|days|teams|members|revenue|sales|accuracy)",
    ]

    metrics = []

    lower = text.lower()

    for pattern in patterns:
        matches = re.findall(pattern, lower)

        for match in matches:
            if isinstance(match, tuple):
                continue

        full_matches = re.finditer(pattern, lower)
        for item in full_matches:
            value = item.group(0)
            if value not in metrics:
                metrics.append(value)

    return metrics


def detect_action_verbs(text: str) -> List[str]:
    lower = normalize_text(text)

    detected = []

    for verb in ACTION_VERBS:
        if re.search(rf"\b{verb}\b", lower):
            detected.append(verb)

    return detected


def detect_repeated_words(text: str) -> List[str]:
    words = re.findall(r"\b[a-zA-Z]{5,}\b", text.lower())

    stop_words = {
        "experience",
        "skills",
        "project",
        "projects",
        "using",
        "with",
        "from",
        "that",
        "this",
        "have",
        "will",
        "your",
        "resume",
        "software",
        "engineer",
        "developer",
        "management",
        "system",
        "application",
    }

    filtered = [word for word in words if word not in stop_words]
    counts = Counter(filtered)

    return [word for word, count in counts.items() if count >= 6][:10]


def calculate_parse_quality(text: str, email: Optional[str], phone: Optional[str], sections: Dict[str, bool]) -> int:
    score = 0
    word_count = len(text.split())

    if word_count >= 250:
        score += 35
    elif word_count >= 150:
        score += 25
    elif word_count >= 80:
        score += 15

    if email:
        score += 15

    if phone:
        score += 10

    detected_sections = sum(1 for value in sections.values() if value)

    if detected_sections >= 5:
        score += 30
    elif detected_sections >= 3:
        score += 20
    elif detected_sections >= 2:
        score += 10

    strange_symbols = len(re.findall(r"[^\w\s.,:@/+()\-#&%|]", text))

    if strange_symbols <= 30:
        score += 10
    elif strange_symbols <= 70:
        score += 5

    return min(score, 100)


def analyze_resume_text(text: str):
    cleaned_text = clean_text(text)
    normalized = normalize_text(cleaned_text)

    email = extract_email(cleaned_text)
    phone = extract_phone(cleaned_text)
    links = extract_links(cleaned_text)
    skills = extract_skills(cleaned_text)
    skills_by_category = extract_skills_by_category(cleaned_text)
    sections = detect_sections(cleaned_text)
    bullets = extract_bullets(text)
    metrics = extract_numbers_and_metrics(cleaned_text)
    action_verbs = detect_action_verbs(cleaned_text)
    repeated_words = detect_repeated_words(cleaned_text)

    words = cleaned_text.split()

    return {
        "email": email,
        "phone": phone,
        "links": links,
        "skills": skills,
        "skills_by_category": skills_by_category,
        "sections": sections,
        "word_count": len(words),
        "character_count": len(cleaned_text),
        "bullet_count": len(bullets),
        "bullets": bullets[:20],
        "metrics": metrics[:20],
        "metric_count": len(metrics),
        "action_verbs": action_verbs,
        "action_verb_count": len(action_verbs),
        "repeated_words": repeated_words,
        "parse_quality": calculate_parse_quality(
            cleaned_text,
            email,
            phone,
            sections,
        ),
        "has_contact_details": bool(email or phone),
        "has_professional_links": bool(links),
        "has_measurable_impact": len(metrics) > 0,
        "has_action_verbs": len(action_verbs) > 0,
        "normalized_preview": normalized[:500],
    }