import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


STOP_WORDS = {
    "the", "and", "for", "with", "you", "your", "are", "this", "that",
    "from", "have", "will", "can", "our", "their", "job", "role",
    "candidate", "work", "team", "company", "experience"
}


def calculate_text_similarity(resume_text: str, job_description: str) -> float:
    if not resume_text or not job_description:
        return 0.0

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=5000,
    )

    vectors = vectorizer.fit_transform([resume_text, job_description])
    score = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]

    return round(score * 100, 2)


def extract_keywords(text: str) -> set:
    words = re.findall(r"[a-zA-Z][a-zA-Z0-9+#.-]{2,}", text.lower())

    keywords = {
        word.strip(".,:;()[]{}")
        for word in words
        if len(word) > 2 and word not in STOP_WORDS
    }

    return keywords


def calculate_keyword_match(resume_text: str, job_description: str) -> dict:
    if not resume_text or not job_description:
        return {
            "matched_keywords": [],
            "missing_keywords": [],
            "keyword_match_score": 0,
        }

    resume_keywords = extract_keywords(resume_text)
    job_keywords = extract_keywords(job_description)

    matched = sorted(list(job_keywords.intersection(resume_keywords)))
    missing = sorted(list(job_keywords.difference(resume_keywords)))

    score = 0
    if job_keywords:
        score = round((len(matched) / len(job_keywords)) * 100, 2)

    return {
        "matched_keywords": matched[:50],
        "missing_keywords": missing[:50],
        "keyword_match_score": score,
    }