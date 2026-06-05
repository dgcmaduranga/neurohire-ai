import math
import re
from collections import Counter


STOP_WORDS = {
    "the", "and", "for", "with", "you", "your", "are", "this", "that",
    "from", "have", "will", "can", "our", "their", "job", "role",
    "candidate", "work", "team", "company", "experience", "a", "an",
    "to", "of", "in", "on", "at", "by", "as", "is", "be", "or", "we",
}


def tokenize(text: str) -> list[str]:
    if not text:
        return []

    words = re.findall(r"[a-zA-Z][a-zA-Z0-9+#.-]{2,}", text.lower())

    return [
        word.strip(".,:;()[]{}")
        for word in words
        if len(word.strip(".,:;()[]{}")) > 2
        and word.strip(".,:;()[]{}") not in STOP_WORDS
    ]


def cosine_from_counters(counter1: Counter, counter2: Counter) -> float:
    if not counter1 or not counter2:
        return 0.0

    common_words = set(counter1.keys()).intersection(counter2.keys())

    dot_product = sum(counter1[word] * counter2[word] for word in common_words)

    magnitude1 = math.sqrt(sum(value * value for value in counter1.values()))
    magnitude2 = math.sqrt(sum(value * value for value in counter2.values()))

    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0

    return dot_product / (magnitude1 * magnitude2)


def calculate_text_similarity(resume_text: str, job_description: str) -> float:
    if not resume_text or not job_description:
        return 0.0

    resume_tokens = tokenize(resume_text)
    job_tokens = tokenize(job_description)

    resume_counter = Counter(resume_tokens)
    job_counter = Counter(job_tokens)

    score = cosine_from_counters(resume_counter, job_counter)

    return round(score * 100, 2)


def extract_keywords(text: str) -> set:
    return set(tokenize(text))


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