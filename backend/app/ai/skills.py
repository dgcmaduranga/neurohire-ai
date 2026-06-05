import re
from typing import Dict, List


SKILL_CATEGORIES = {
    "software_it": [
        "python", "java", "javascript", "typescript", "react", "next.js",
        "node.js", "express", "fastapi", "django", "flask", "html", "css",
        "tailwind", "bootstrap", "mongodb", "mysql", "postgresql", "firebase",
        "sqlite", "redis", "docker", "kubernetes", "aws", "azure", "gcp",
        "git", "github", "gitlab", "rest api", "graphql", "jwt",
        "microservices", "ci/cd", "devops", "linux", "nginx",
        "machine learning", "deep learning", "nlp", "ocr", "tensorflow",
        "pytorch", "keras", "scikit-learn", "pandas", "numpy",
        "data analysis", "power bi", "tableau", "figma", "api integration",
        "unit testing", "software testing", "agile", "scrum",
    ],
    "business_management": [
        "project management", "team leadership", "communication",
        "problem solving", "strategic planning", "business analysis",
        "operations management", "risk management", "decision making",
        "stakeholder management", "time management", "process improvement",
        "change management", "budget management", "resource planning",
    ],
    "marketing_sales": [
        "digital marketing", "seo", "sem", "content marketing", "social media",
        "email marketing", "sales", "lead generation", "customer service",
        "crm", "market research", "branding", "copywriting", "google analytics",
        "campaign management", "salesforce", "hubspot", "negotiation",
    ],
    "finance_accounting": [
        "accounting", "bookkeeping", "financial analysis", "budgeting",
        "tax", "auditing", "payroll", "excel", "quickbooks", "xero",
        "financial reporting", "cash flow", "reconciliation",
        "accounts payable", "accounts receivable", "forecasting",
    ],
    "healthcare": [
        "patient care", "clinical support", "medical terminology",
        "nursing", "pharmacy", "first aid", "health records",
        "laboratory", "diagnosis support", "emergency care",
        "medical documentation", "healthcare management",
    ],
    "engineering": [
        "autocad", "solidworks", "matlab", "mechanical design",
        "civil engineering", "electrical engineering", "manufacturing",
        "quality control", "maintenance", "project planning",
        "site supervision", "structural design", "estimation",
        "quality assurance", "lean manufacturing",
    ],
    "education": [
        "teaching", "lesson planning", "curriculum development",
        "classroom management", "training", "student assessment",
        "online learning", "research", "mentoring", "academic writing",
        "instructional design",
    ],
    "hospitality_tourism": [
        "hotel management", "front office", "food and beverage",
        "customer service", "event planning", "tourism", "reservation",
        "guest relations", "housekeeping", "travel planning",
    ],
    "design_creative": [
        "graphic design", "ui design", "ux design", "photoshop",
        "illustrator", "canva", "video editing", "animation",
        "photography", "creative writing", "adobe xd", "premiere pro",
        "after effects", "branding", "typography", "wireframing",
        "prototyping",
    ],
    "legal_admin": [
        "legal research", "contract management", "documentation",
        "administration", "data entry", "records management",
        "office management", "compliance", "scheduling",
    ],
    "supply_chain_logistics": [
        "inventory management", "procurement", "logistics",
        "supply chain", "warehouse management", "vendor management",
        "shipping", "demand planning", "erp", "sap",
    ],
    "general_soft_skills": [
        "leadership", "teamwork", "adaptability", "critical thinking",
        "creativity", "organization", "attention to detail",
        "negotiation", "presentation", "multitasking", "collaboration",
        "analytical thinking", "interpersonal skills", "problem-solving",
    ],
}


SKILL_ALIASES = {
    "js": "javascript",
    "ts": "typescript",
    "node": "node.js",
    "nodejs": "node.js",
    "nextjs": "next.js",
    "reactjs": "react",
    "mongo": "mongodb",
    "mongo db": "mongodb",
    "postgres": "postgresql",
    "postgre sql": "postgresql",
    "firebase firestore": "firebase",
    "rest": "rest api",
    "apis": "api integration",
    "api": "api integration",
    "ml": "machine learning",
    "ai": "machine learning",
    "dl": "deep learning",
    "sklearn": "scikit-learn",
    "tf": "tensorflow",
    "ps": "photoshop",
    "ai illustrator": "illustrator",
    "ms excel": "excel",
    "powerbi": "power bi",
    "google cloud": "gcp",
    "amazon web services": "aws",
    "customer support": "customer service",
    "problem solving": "problem solving",
    "problem-solving": "problem solving",
}


ALL_SKILLS = sorted(
    list({skill for skills in SKILL_CATEGORIES.values() for skill in skills})
)


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").lower()).strip()


def skill_exists(text: str, skill: str) -> bool:
    escaped = re.escape(skill.lower())

    if re.search(rf"(?<![a-z0-9+#]){escaped}(?![a-z0-9+#])", text):
        return True

    return False


def extract_skills(text: str) -> List[str]:
    lower_text = normalize_text(text)
    found = set()

    for skill in ALL_SKILLS:
        if skill_exists(lower_text, skill):
            found.add(skill)

    for alias, canonical in SKILL_ALIASES.items():
        if skill_exists(lower_text, alias):
            found.add(canonical)

    return sorted(found)


def extract_skills_by_category(text: str) -> Dict[str, List[str]]:
    lower_text = normalize_text(text)
    result = {}

    found_skills = set(extract_skills(text))

    for category, skills in SKILL_CATEGORIES.items():
        matched = []

        for skill in skills:
            if skill in found_skills or skill_exists(lower_text, skill):
                matched.append(skill)

        if matched:
            result[category] = sorted(set(matched))

    return result


def infer_industries_from_skills(skills: List[str]) -> List[str]:
    industries = []

    skill_set = set(skill.lower() for skill in skills)

    for category, category_skills in SKILL_CATEGORIES.items():
        matched_count = len(skill_set.intersection(set(category_skills)))

        if matched_count >= 2:
            industries.append(category)

    return industries


def get_all_skills() -> List[str]:
    return ALL_SKILLS