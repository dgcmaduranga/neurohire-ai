import json
import re
from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import HTTPException
from openai import OpenAI

from app.config import settings
from app.database import interviews_collection

client = OpenAI(api_key=settings.OPENAI_API_KEY)

DEFAULT_TOTAL_QUESTIONS = 10


def get_openai_client():
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API key is missing.")
    return client


def safe_json_loads(text: str) -> Dict[str, Any]:
    try:
        return json.loads(text)
    except Exception:
        pass

    match = re.search(r"\{.*\}", text, re.DOTALL)

    if not match:
        raise HTTPException(status_code=500, detail="AI response was not valid JSON.")

    try:
        return json.loads(match.group(0))
    except Exception:
        raise HTTPException(status_code=500, detail="AI response JSON parsing failed.")


def normalize_score(value: Any, default: int = 50) -> int:
    try:
        score = int(float(value))
    except Exception:
        score = default

    return max(0, min(score, 100))


def normalize_total_questions(value: Any) -> int:
    try:
        total = int(value)
    except Exception:
        total = DEFAULT_TOTAL_QUESTIONS

    if total < 1:
        return DEFAULT_TOTAL_QUESTIONS

    return total


def is_repeat_request(answer: str) -> bool:
    text = answer.lower().strip()

    repeat_phrases = [
        "sorry",
        "sorry what",
        "what",
        "pardon",
        "come again",
        "repeat",
        "repeat please",
        "can you repeat",
        "please repeat",
        "i didn't hear",
        "i did not hear",
        "say again",
        "one more time",
    ]

    if text in repeat_phrases:
        return True

    return any(phrase in text for phrase in repeat_phrases) and len(text.split()) <= 7


def clean_messages_for_openai(messages: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    cleaned = []

    for message in messages[-24:]:
        role = message.get("role", "")
        content = message.get("content", "")

        if not content:
            continue

        if role in ["ai", "assistant"]:
            cleaned.append({"role": "assistant", "content": content})
        elif role == "user":
            cleaned.append({"role": "user", "content": content})
        elif role == "feedback":
            cleaned.append({"role": "assistant", "content": f"Feedback: {content}"})

    return cleaned


def build_system_prompt(job_role: str, industry_hint: str, experience_level: str) -> str:
    return f"""
You are a real professional interviewer and interview coach.

Target job role:
{job_role}

Industry hint:
{industry_hint or "Any relevant industry"}

Candidate experience level:
{experience_level}

Core rules:
- Support any job role and any industry in the world.
- Do not use hardcoded questions.
- Ask questions dynamically based on the exact job role.
- Act like a real interviewer, not a generic chatbot.
- Ask one question at a time.
- Use natural interview flow.
- First evaluate the candidate's self-introduction.
- Then ask role-specific, practical, behavioral, scenario-based, and technical questions depending on the job role.
- If the candidate asks to repeat, repeat the same question and do not evaluate.
- If the answer is weak, irrelevant, too short, or only a greeting, give a low score honestly.
- Do not praise weak answers.
- Give clear missing points and a better sample answer.
- Ask follow-up questions based on the candidate's previous answers.
- Return ONLY valid JSON. No markdown.
"""


def build_start_prompt(
    job_role: str,
    industry_hint: str,
    experience_level: str,
    total_questions: int,
) -> str:
    return f"""
Start a realistic interview.

Job role: {job_role}
Industry: {industry_hint or "Any relevant industry"}
Experience level: {experience_level}
Total questions: {total_questions}

Important:
- Start with a professional welcome.
- Do not ask "How are you today?"
- Do not start with a technical question.
- First question must ask the candidate to introduce themselves.
- Make the introduction question suitable for the role.
- Return ONLY valid JSON.

JSON format:
{{
  "status": "success",
  "question": "Hello, welcome to your {job_role} interview. To begin, please introduce yourself briefly and tell me why you are interested in this role."
}}
"""


def build_evaluation_prompt(
    job_role: str,
    industry_hint: str,
    experience_level: str,
    question_number: int,
    total_questions: int,
    question: str,
    answer: str,
    is_final: bool,
) -> str:
    return f"""
Evaluate this interview answer.

Job role:
{job_role}

Industry:
{industry_hint or "Any relevant industry"}

Experience level:
{experience_level}

Question number:
{question_number} of {total_questions}

Current interviewer question:
{question}

Candidate spoken answer:
{answer}

Evaluation rules:
- If answer is only "hi", "hello", "okay", "yes", "no", "fine", "good", or similar, it is not a proper answer.
- If the answer does not answer the question, mark it low.
- If the answer is too short, mark it low.
- If the answer is relevant but incomplete, give a fair score and explain missing points.
- For self-introduction, check whether the candidate mentions background, education/experience, relevant skills, interest in the role, and career goal.
- For role-specific questions, check role knowledge, practical examples, tools/processes, problem-solving, and clarity.
- Do not praise weak answers.
- Give a better sample answer tailored to the exact job role.
- Ask the next natural interview question for the same job role.
- Questions must fit any industry/job role, not only IT.
- Return ONLY valid JSON.

If NOT final, return:
{{
  "status": "success",
  "action": "evaluate_answer",
  "score": 0,
  "is_answer_relevant": true,
  "feedback": "Honest feedback paragraph.",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "improved_answer": "A better sample answer the candidate can learn from.",
  "next_question": "Next natural role-specific interview question."
}}

If final, return:
{{
  "status": "success",
  "action": "final_report",
  "score": 0,
  "is_answer_relevant": true,
  "feedback": "Final answer feedback.",
  "strengths": ["strength 1"],
  "weaknesses": ["weakness 1"],
  "improved_answer": "A better sample answer.",
  "final_report": {{
    "overall_score": 0,
    "communication_score": 0,
    "role_knowledge_score": 0,
    "confidence_score": 0,
    "strengths": ["overall strength 1", "overall strength 2"],
    "weaknesses": ["overall weakness 1", "overall weakness 2"],
    "recommendation": "Final realistic recommendation."
  }}
}}

Final question: {str(is_final).lower()}
"""


async def generate_interview_question(
    user_id: str,
    job_role: Optional[str] = None,
    industry_hint: str = "",
    experience_level: str = "Entry Level",
    total_questions: int = DEFAULT_TOTAL_QUESTIONS,
    instruction: str = "",
    role: Optional[str] = None,
    skills: Optional[List[str]] = None,
):
    openai_client = get_openai_client()
    selected_role = job_role or role
    total_questions = normalize_total_questions(total_questions)

    if not selected_role or not selected_role.strip():
        raise HTTPException(status_code=400, detail="Job role is required.")

    selected_role = selected_role.strip()

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": build_system_prompt(
                    selected_role,
                    industry_hint,
                    experience_level,
                ),
            },
            {
                "role": "user",
                "content": build_start_prompt(
                    selected_role,
                    industry_hint,
                    experience_level,
                    total_questions,
                ),
            },
        ],
        temperature=0.55,
    )

    data = safe_json_loads(response.choices[0].message.content or "")
    question = data.get("question")

    if not question:
        question = (
            f"Hello, welcome to your {selected_role} interview. "
            f"To begin, please introduce yourself briefly and tell me why you are interested in this role."
        )

    interview_doc = {
        "user_id": user_id,
        "job_role": selected_role,
        "industry_hint": industry_hint,
        "experience_level": experience_level,
        "total_questions": total_questions,
        "messages": [
            {
                "role": "ai",
                "content": question,
                "created_at": datetime.utcnow(),
            }
        ],
        "status": "in_progress",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await interviews_collection.insert_one(interview_doc)

    return {
        "status": "success",
        "interview_id": str(result.inserted_id),
        "job_role": selected_role,
        "industry_hint": industry_hint,
        "experience_level": experience_level,
        "total_questions": total_questions,
        "question_number": 1,
        "question": question,
    }


async def evaluate_interview_answer(
    user_id: str,
    answer: str,
    job_role: Optional[str] = None,
    industry_hint: str = "",
    experience_level: str = "Entry Level",
    question_number: int = 1,
    total_questions: int = DEFAULT_TOTAL_QUESTIONS,
    question: str = "",
    conversation: Optional[List[Dict[str, Any]]] = None,
    instruction: str = "",
    interview_id: Optional[str] = None,
):
    openai_client = get_openai_client()

    if not answer or not answer.strip():
        raise HTTPException(status_code=400, detail="Answer is required.")

    answer = answer.strip()
    selected_role = job_role or "General Role"
    conversation = conversation or []
    interview = None
    stored_messages = []

    total_questions = normalize_total_questions(total_questions)

    if interview_id:
        try:
            interview = await interviews_collection.find_one(
                {"_id": ObjectId(interview_id), "user_id": user_id}
            )
        except Exception:
            interview = None

    if interview:
        selected_role = interview.get("job_role") or selected_role
        industry_hint = interview.get("industry_hint") or industry_hint
        experience_level = interview.get("experience_level") or experience_level
        total_questions = normalize_total_questions(
            interview.get("total_questions") or total_questions
        )

        stored_messages = interview.get("messages", [])

        if not question:
            ai_messages = [m for m in stored_messages if m.get("role") == "ai"]
            if ai_messages:
                question = ai_messages[-1].get("content", "")

    if is_repeat_request(answer):
        repeated_text = f"No problem, let me repeat the question. {question}"

        repeat_entry = {
            "role": "user",
            "content": answer,
            "created_at": datetime.utcnow(),
        }

        ai_entry = {
            "role": "ai",
            "content": repeated_text,
            "created_at": datetime.utcnow(),
        }

        if interview_id and interview:
            await interviews_collection.update_one(
                {"_id": ObjectId(interview_id), "user_id": user_id},
                {
                    "$push": {"messages": {"$each": [repeat_entry, ai_entry]}},
                    "$set": {"updated_at": datetime.utcnow()},
                },
            )

        return {
            "status": "success",
            "action": "repeat_question",
            "score": None,
            "is_answer_relevant": None,
            "feedback": "No problem. I’ll repeat the question for you.",
            "strengths": [],
            "weaknesses": [],
            "improved_answer": "",
            "next_question": repeated_text,
            "question_number": question_number,
            "total_questions": total_questions,
        }

    is_final = question_number >= total_questions
    conversation_context = clean_messages_for_openai(stored_messages + conversation)

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": build_system_prompt(
                    selected_role,
                    industry_hint,
                    experience_level,
                ),
            },
            *conversation_context,
            {
                "role": "user",
                "content": build_evaluation_prompt(
                    selected_role,
                    industry_hint,
                    experience_level,
                    question_number,
                    total_questions,
                    question,
                    answer,
                    is_final,
                ),
            },
        ],
        temperature=0.4,
    )

    data = safe_json_loads(response.choices[0].message.content or "")

    score = normalize_score(data.get("score"), 40)
    data["score"] = score

    if not data.get("action"):
        data["action"] = "final_report" if data.get("final_report") else "evaluate_answer"

    if data.get("final_report"):
        report = data["final_report"]
        report["overall_score"] = normalize_score(report.get("overall_score"), score)
        report["communication_score"] = normalize_score(report.get("communication_score"), score)
        report["role_knowledge_score"] = normalize_score(report.get("role_knowledge_score"), score)
        report["confidence_score"] = normalize_score(report.get("confidence_score"), score)

    if not data.get("next_question") and not data.get("final_report"):
        data["next_question"] = (
            f"Thank you. Now, can you give me a practical example from your experience "
            f"that shows your suitability for the {selected_role} role?"
        )

    message_entries = [
        {
            "role": "user",
            "content": answer,
            "question": question,
            "score": score,
            "created_at": datetime.utcnow(),
        },
        {
            "role": "feedback",
            "content": data.get("feedback", ""),
            "strengths": data.get("strengths", []),
            "weaknesses": data.get("weaknesses", []),
            "improved_answer": data.get("improved_answer", ""),
            "created_at": datetime.utcnow(),
        },
    ]

    if data.get("next_question") and not data.get("final_report"):
        message_entries.append(
            {
                "role": "ai",
                "content": data.get("next_question"),
                "created_at": datetime.utcnow(),
            }
        )

    status = "completed" if data.get("final_report") else "in_progress"

    update_doc = {
        "$push": {"messages": {"$each": message_entries}},
        "$set": {
            "status": status,
            "latest_score": score,
            "latest_feedback": data.get("feedback", ""),
            "final_report": data.get("final_report"),
            "updated_at": datetime.utcnow(),
        },
    }

    if interview_id and interview:
        await interviews_collection.update_one(
            {"_id": ObjectId(interview_id), "user_id": user_id},
            update_doc,
        )
    else:
        await interviews_collection.insert_one(
            {
                "user_id": user_id,
                "job_role": selected_role,
                "industry_hint": industry_hint,
                "experience_level": experience_level,
                "total_questions": total_questions,
                "messages": message_entries,
                "status": status,
                "latest_score": score,
                "latest_feedback": data.get("feedback", ""),
                "final_report": data.get("final_report"),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        )

    data["question_number"] = question_number
    data["total_questions"] = total_questions

    return data


async def get_interview_history(user_id: str):
    interviews = await interviews_collection.find(
        {"user_id": user_id}
    ).sort("created_at", -1).to_list(50)

    for interview in interviews:
        interview["_id"] = str(interview["_id"])

        if "created_at" in interview:
            interview["created_at"] = str(interview["created_at"])

        if "updated_at" in interview:
            interview["updated_at"] = str(interview["updated_at"])

    return interviews