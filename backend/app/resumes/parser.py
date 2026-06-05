from app.ai.nlp_service import analyze_resume_text


def parse_resume_text(text: str):
    analysis = analyze_resume_text(text)

    return {
        "contact": {
            "email": analysis.get("email"),
            "phone": analysis.get("phone"),
            "links": analysis.get("links", []),
        },
        "skills": analysis.get("skills", []),
        "skills_by_category": analysis.get("skills_by_category", {}),
        "sections": analysis.get("sections", {}),
        "word_count": analysis.get("word_count", 0),
        "character_count": analysis.get("character_count", 0),
        "bullet_count": analysis.get("bullet_count", 0),
        "metrics": analysis.get("metrics", []),
        "metric_count": analysis.get("metric_count", 0),
        "action_verbs": analysis.get("action_verbs", []),
        "action_verb_count": analysis.get("action_verb_count", 0),
        "repeated_words": analysis.get("repeated_words", []),
        "parse_quality": analysis.get("parse_quality", 0),
        "has_contact_details": analysis.get("has_contact_details", False),
        "has_professional_links": analysis.get("has_professional_links", False),
        "has_measurable_impact": analysis.get("has_measurable_impact", False),
        "has_action_verbs": analysis.get("has_action_verbs", False),
    }