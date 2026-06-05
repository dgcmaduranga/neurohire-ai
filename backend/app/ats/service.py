import re
from collections import Counter
from typing import Any

from app.ai.nlp_service import analyze_resume_text
from app.ai.similarity_service import calculate_keyword_match, calculate_text_similarity


ROLE_SKILLS = {
    "software engineer": [
        "python", "java", "javascript", "typescript", "react", "node.js",
        "api", "rest api", "database", "sql", "mongodb", "postgresql",
        "git", "docker", "testing", "agile", "problem solving",
        "cloud", "microservices", "ci/cd", "debugging"
    ],
    "frontend developer": [
        "html", "css", "javascript", "typescript", "react", "next.js",
        "tailwind", "responsive design", "api integration", "ui", "ux",
        "figma", "accessibility", "performance optimization"
    ],
    "backend developer": [
        "python", "java", "node.js", "fastapi", "django", "express",
        "rest api", "database", "mongodb", "postgresql", "jwt", "docker",
        "microservices", "cloud", "testing"
    ],
    "data analyst": [
        "excel", "sql", "python", "power bi", "tableau", "statistics",
        "data analysis", "dashboard", "reporting", "data visualization"
    ],
    "digital marketing": [
        "seo", "social media", "content marketing", "google analytics",
        "email marketing", "campaign management", "branding", "copywriting"
    ],
    "project manager": [
        "project planning", "agile", "scrum", "risk management",
        "stakeholder management", "budgeting", "timeline management",
        "communication", "leadership"
    ],
    "business analyst": [
        "requirements gathering", "documentation", "process mapping",
        "stakeholder management", "business analysis", "sql", "excel",
        "reporting", "communication"
    ],
    "hr executive": [
        "recruitment", "employee relations", "onboarding", "hr policies",
        "payroll", "performance management", "training", "communication"
    ],
    "sales executive": [
        "lead generation", "crm", "negotiation", "sales strategy",
        "customer relationship", "communication", "target achievement"
    ],
    "accountant": [
        "accounting", "financial reporting", "bookkeeping", "tax",
        "audit", "excel", "payroll", "reconciliation", "budgeting"
    ],
    "graphic designer": [
        "adobe photoshop", "adobe illustrator", "figma", "branding",
        "typography", "layout design", "visual design", "creativity"
    ],
    "ui ux designer": [
        "figma", "wireframing", "prototyping", "user research",
        "usability testing", "ui design", "ux design", "design systems"
    ],
    "customer service": [
        "customer support", "communication", "problem solving",
        "crm", "complaint handling", "empathy", "time management"
    ],
    "nurse": [
        "patient care", "clinical skills", "medication administration",
        "communication", "emergency care", "record keeping", "teamwork"
    ],
    "civil engineer": [
        "autocad", "site supervision", "project management",
        "construction", "estimation", "structural design", "safety"
    ],
}

GENERAL_SKILLS = [
    "communication", "teamwork", "leadership", "problem solving",
    "time management", "critical thinking", "adaptability",
    "attention to detail", "customer service", "planning"
]

ACTION_VERBS = [
    "developed", "designed", "implemented", "optimized", "improved",
    "increased", "reduced", "automated", "managed", "led", "created",
    "delivered", "integrated", "collaborated", "maintained", "deployed",
    "built", "enhanced", "analyzed", "streamlined", "resolved"
]

SECTION_ALIASES = {
    "summary": ["summary", "profile", "professional summary", "objective"],
    "experience": ["experience", "work experience", "employment", "career history"],
    "education": ["education", "academic", "qualification"],
    "skills": ["skills", "technical skills", "core skills", "key skills"],
    "projects": ["projects", "portfolio"],
    "certifications": ["certifications", "certificates", "licenses", "training"],
    "languages": ["languages"],
    "achievements": ["achievements", "key achievements", "awards"],
}


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").lower()).strip()


def detect_sections_from_text(resume_text: str, existing_sections: dict[str, bool]) -> dict[str, bool]:
    text = normalize(resume_text)
    sections = dict(existing_sections or {})

    for section, aliases in SECTION_ALIASES.items():
        sections.setdefault(section, False)
        if any(re.search(rf"\b{re.escape(alias)}\b", text) for alias in aliases):
            sections[section] = True

    return sections


def detect_target_role(job_description: str, resume_text: str) -> str:
    combined = normalize(f"{job_description} {resume_text}")
    role_scores = {}

    for role, skills in ROLE_SKILLS.items():
        score = 0

        if role in combined:
            score += 8

        role_words = role.split()
        score += sum(2 for word in role_words if word in combined)

        for skill in skills:
            if skill.lower() in combined:
                score += 1

        role_scores[role] = score

    best_role = max(role_scores, key=role_scores.get)

    if role_scores[best_role] <= 2:
        return "general"

    return best_role


def get_required_skills(target_role: str) -> list[str]:
    if target_role == "general":
        return GENERAL_SKILLS

    return ROLE_SKILLS.get(target_role, GENERAL_SKILLS)


def calculate_parse_rate_score(resume_text: str, analysis: dict[str, Any]) -> float:
    word_count = analysis.get("word_count", 0)
    score = 0

    if word_count >= 250:
        score += 8
    elif word_count >= 150:
        score += 6
    elif word_count >= 80:
        score += 4
    else:
        score += 2

    if analysis.get("email"):
        score += 2
    if analysis.get("phone"):
        score += 2
    if analysis.get("links"):
        score += 1

    strange_symbols = len(re.findall(r"[^\w\s.,:@/+()\-#&%|]", resume_text))
    if strange_symbols <= 20:
        score += 2
    elif strange_symbols <= 50:
        score += 1

    return round(min(score, 15), 2)


def calculate_structure_score(sections: dict[str, bool]) -> float:
    weights = {
        "summary": 3,
        "experience": 5,
        "education": 3,
        "skills": 4,
        "projects": 3,
        "certifications": 1.5,
        "languages": 1,
        "achievements": 1.5,
    }

    score = sum(weight for section, weight in weights.items() if sections.get(section))
    return round(min(score, 18), 2)


def calculate_contact_score(analysis: dict[str, Any]) -> float:
    score = 0

    if analysis.get("email"):
        score += 4
    if analysis.get("phone"):
        score += 3
    if analysis.get("links"):
        score += 3

    return round(min(score, 10), 2)


def calculate_skill_match_score(
    resume_text: str,
    detected_skills: list[str],
    required_skills: list[str],
) -> tuple[float, list[str], list[str]]:
    text = normalize(resume_text)
    detected_lower = [skill.lower() for skill in detected_skills]

    matched = []
    missing = []

    for skill in required_skills:
        skill_lower = skill.lower()

        found = (
            skill_lower in text
            or any(skill_lower in detected or detected in skill_lower for detected in detected_lower)
        )

        if found:
            matched.append(skill)
        else:
            missing.append(skill)

    if not required_skills:
        return 0, matched, missing

    ratio = len(matched) / len(required_skills)
    score = ratio * 18

    if len(detected_skills) >= 10:
        score += 2
    elif len(detected_skills) >= 6:
        score += 1

    return round(min(score, 20), 2), matched, missing


def calculate_impact_score(resume_text: str) -> tuple[float, list[str]]:
    text = normalize(resume_text)

    metrics = re.findall(
        r"(\d+%|\d+\+|\$\d+|\d+\s*(years|year|months|users|clients|projects|hours|days|teams))",
        text,
    )

    action_count = sum(1 for verb in ACTION_VERBS if verb in text)

    score = 0
    score += min(len(metrics) * 1.2, 8)
    score += min(action_count * 0.5, 7)

    suggestions = []

    if len(metrics) < 3:
        suggestions.append("Add more measurable results such as percentages, time saved, users supported, cost reduction, or performance improvement.")

    if action_count < 6:
        suggestions.append("Start more bullet points with strong action verbs such as Developed, Improved, Automated, Led, Designed, or Optimized.")

    return round(min(score, 15), 2), suggestions


def calculate_experience_score(resume_text: str, sections: dict[str, bool], word_count: int) -> float:
    text = normalize(resume_text)
    score = 0

    if sections.get("experience"):
        score += 6

    if sections.get("projects"):
        score += 3

    if sections.get("achievements"):
        score += 2

    if re.search(r"\b\d+\+?\s*(years|year|yrs|yr)\b", text):
        score += 2

    if word_count >= 300:
        score += 2
    elif word_count >= 180:
        score += 1

    return round(min(score, 15), 2)


def calculate_education_cert_score(sections: dict[str, bool]) -> float:
    score = 0

    if sections.get("education"):
        score += 4

    if sections.get("certifications"):
        score += 2

    if sections.get("languages"):
        score += 1

    return round(min(score, 7), 2)


def calculate_formatting_score(resume_text: str, analysis: dict[str, Any]) -> float:
    text = resume_text.strip()
    word_count = analysis.get("word_count", 0)

    score = 10

    if word_count < 120:
        score -= 4
    elif word_count < 220:
        score -= 2

    if len(text) > 9000:
        score -= 1.5

    if len(analysis.get("skills", [])) < 5:
        score -= 1.5

    strange_symbols = len(re.findall(r"[^\w\s.,:@/+()\-#&%|]", text))

    if strange_symbols > 80:
        score -= 2
    elif strange_symbols > 40:
        score -= 1

    return round(max(score, 0), 2)


def calculate_repetition_score(resume_text: str) -> tuple[float, list[str]]:
    words = re.findall(r"\b[a-zA-Z]{5,}\b", resume_text.lower())

    stop_words = {
        "experience", "skills", "project", "projects", "using", "with",
        "from", "that", "this", "have", "will", "your", "resume",
        "software", "engineer", "developer"
    }

    filtered = [word for word in words if word not in stop_words]
    counts = Counter(filtered)

    repeated = [word for word, count in counts.items() if count >= 6]

    if not repeated:
        return 5, []

    if len(repeated) <= 3:
        return 3.5, repeated[:5]

    return 2, repeated[:8]


def calculate_keyword_score(resume_text: str, job_description: str) -> tuple[float, dict]:
    if not job_description:
        return 8, {
            "matched_keywords": [],
            "missing_keywords": [],
            "keyword_match_score": 80,
            "note": "No job description provided. Default keyword score applied.",
        }

    keyword_report = calculate_keyword_match(resume_text, job_description)
    raw_score = keyword_report.get("keyword_match_score", 0)

    weighted_score = (raw_score / 100) * 12
    return round(weighted_score, 2), keyword_report


def calculate_similarity_score(resume_text: str, job_description: str) -> float:
    if not job_description:
        return 0

    similarity = calculate_text_similarity(resume_text, job_description)
    return round((similarity / 100) * 8, 2)


def calculate_final_score(
    parse_rate_score: float,
    structure_score: float,
    contact_score: float,
    skill_score: float,
    keyword_score: float,
    experience_score: float,
    education_score: float,
    formatting_score: float,
    impact_score: float,
    repetition_score: float,
    similarity_bonus: float,
    missing_skills: list[str],
    analysis: dict[str, Any],
) -> float:
    total = (
        parse_rate_score
        + structure_score
        + contact_score
        + skill_score
        + keyword_score
        + experience_score
        + education_score
        + formatting_score
        + impact_score
        + repetition_score
        + similarity_bonus
    )

    if not analysis.get("email"):
        total = min(total, 88)

    if not analysis.get("phone"):
        total = min(total, 92)

    if analysis.get("word_count", 0) < 150:
        total = min(total, 55)
    elif analysis.get("word_count", 0) < 250:
        total = min(total, 70)

    if len(analysis.get("skills", [])) < 4:
        total = min(total, 72)

    if len(missing_skills) >= 14:
        total = min(total, 78)
    elif len(missing_skills) >= 10:
        total = min(total, 84)

    return round(max(0, min(total, 100)), 2)


def get_rating(score: float) -> str:
    if score >= 90:
        return "Excellent"
    if score >= 80:
        return "Strong"
    if score >= 65:
        return "Good"
    if score >= 50:
        return "Needs Improvement"
    return "Poor"


def generate_suggestions(
    analysis: dict[str, Any],
    target_role: str,
    missing_skills: list[str],
    keyword_report: dict,
    job_description: str,
    impact_suggestions: list[str],
    repeated_words: list[str],
) -> list[str]:
    suggestions = []
    sections = analysis.get("sections", {})

    if not analysis.get("email"):
        suggestions.append("Add a clear professional email address.")

    if not analysis.get("phone"):
        suggestions.append("Add a contact number.")

    if not analysis.get("links"):
        suggestions.append("Add LinkedIn, portfolio, GitHub, Behance, or another relevant professional profile.")

    if not sections.get("summary"):
        suggestions.append("Add a short professional summary aligned with your target role.")

    if not sections.get("experience"):
        suggestions.append("Add work experience, internship experience, freelance work, or practical responsibilities.")

    if not sections.get("projects"):
        suggestions.append("Add projects or practical work examples with technologies/tools used and results achieved.")

    if not sections.get("skills"):
        suggestions.append("Add a dedicated skills section.")

    if missing_skills:
        suggestions.append(
            f"For a {target_role} role, add these skills only if you genuinely have them: "
            + ", ".join(missing_skills[:12])
        )

    if job_description:
        missing_keywords = keyword_report.get("missing_keywords", [])[:10]
        if missing_keywords:
            suggestions.append(
                "Add relevant job-description keywords naturally: "
                + ", ".join(missing_keywords)
            )

    suggestions.extend(impact_suggestions)

    if repeated_words:
        suggestions.append(
            "Reduce repeated words and use stronger synonyms for: "
            + ", ".join(repeated_words[:6])
        )

    suggestions.append("Keep formatting ATS-friendly: simple headings, readable fonts, clear bullet points, and no tables for critical details.")

    return suggestions


def generate_ats_report(resume_text: str, job_description: str = ""):
    analysis = analyze_resume_text(resume_text)
    analysis["sections"] = detect_sections_from_text(
        resume_text,
        analysis.get("sections", {}),
    )

    target_role = detect_target_role(job_description, resume_text)
    required_skills = get_required_skills(target_role)

    parse_rate_score = calculate_parse_rate_score(resume_text, analysis)
    structure_score = calculate_structure_score(analysis.get("sections", {}))
    contact_score = calculate_contact_score(analysis)

    skill_score, matched_skills, missing_skills = calculate_skill_match_score(
        resume_text,
        analysis.get("skills", []),
        required_skills,
    )

    keyword_score, keyword_report = calculate_keyword_score(resume_text, job_description)
    similarity_bonus = calculate_similarity_score(resume_text, job_description)

    experience_score = calculate_experience_score(
        resume_text,
        analysis.get("sections", {}),
        analysis.get("word_count", 0),
    )

    education_score = calculate_education_cert_score(analysis.get("sections", {}))
    formatting_score = calculate_formatting_score(resume_text, analysis)
    impact_score, impact_suggestions = calculate_impact_score(resume_text)
    repetition_score, repeated_words = calculate_repetition_score(resume_text)

    final_score = calculate_final_score(
        parse_rate_score=parse_rate_score,
        structure_score=structure_score,
        contact_score=contact_score,
        skill_score=skill_score,
        keyword_score=keyword_score,
        experience_score=experience_score,
        education_score=education_score,
        formatting_score=formatting_score,
        impact_score=impact_score,
        repetition_score=repetition_score,
        similarity_bonus=similarity_bonus,
        missing_skills=missing_skills,
        analysis=analysis,
    )

    rating = get_rating(final_score)

    recommend_allowed = final_score >= 80

    return {
        "ats_score": final_score,
        "rating": rating,
        "target_role": target_role,
        "score_breakdown": {
            "ats_parse_rate": parse_rate_score,
            "resume_structure": structure_score,
            "contact_and_profile": contact_score,
            "skills_match": skill_score,
            "keyword_match": keyword_score,
            "experience_relevance": experience_score,
            "education_certifications": education_score,
            "ats_formatting": formatting_score,
            "quantifying_impact": impact_score,
            "repetition": repetition_score,
            "semantic_similarity_bonus": similarity_bonus,
        },
        "required_skills": required_skills,
        "matched_role_skills": matched_skills,
        "missing_role_skills": missing_skills[:15],
        "keyword_report": keyword_report,
        "resume_analysis": analysis,
        "repeated_words": repeated_words,
        "strengths": [
            "Resume text was parsed successfully." if parse_rate_score >= 10 else "Resume parsing quality can be improved.",
            "Professional contact/profile details detected." if contact_score >= 7 else "Contact/profile section needs improvement.",
            "Good resume structure detected." if structure_score >= 12 else "Resume structure can be improved.",
            "Relevant role skills detected." if skill_score >= 12 else "Role-specific skills need improvement.",
            "Experience/projects show useful detail." if experience_score >= 10 else "Experience/project details need improvement.",
            "Measurable achievements detected." if impact_score >= 8 else "Add more measurable achievements.",
            "ATS-friendly formatting looks acceptable." if formatting_score >= 7 else "Formatting may need improvement for ATS systems.",
        ],
        "improvement_plan": generate_suggestions(
            analysis=analysis,
            target_role=target_role,
            missing_skills=missing_skills,
            keyword_report=keyword_report,
            job_description=job_description,
            impact_suggestions=impact_suggestions,
            repeated_words=repeated_words,
        ),
        "recommend_jobs_allowed": recommend_allowed,
        "recommend_jobs_message": (
            "Your resume is strong enough to search for matching jobs."
            if recommend_allowed
            else "Your resume score is below 80. Improve your resume before applying."
        ),
        "summary": "Resume analyzed using NLP extraction, role detection, weighted ATS scoring, keyword matching, semantic similarity, skill-gap analysis, impact analysis, repetition detection, and ATS formatting checks.",
    }