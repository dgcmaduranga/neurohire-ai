from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.dependencies import get_current_user
from app.interviews.service import (
    evaluate_interview_answer,
    generate_interview_question,
    get_interview_history,
)

router = APIRouter(prefix="/interviews", tags=["Interviews"])


class InterviewStartRequest(BaseModel):
    job_role: Optional[str] = None
    role: Optional[str] = None
    industry_hint: Optional[str] = ""
    experience_level: Optional[str] = "Entry Level"
    level: Optional[str] = "Entry Level"
    total_questions: Optional[int] = 7
    instruction: Optional[str] = None


class InterviewAnswerRequest(BaseModel):
    interview_id: Optional[str] = None
    job_role: Optional[str] = None
    role: Optional[str] = None
    industry_hint: Optional[str] = ""
    experience_level: Optional[str] = "Entry Level"
    level: Optional[str] = "Entry Level"
    question_number: Optional[int] = 1
    total_questions: Optional[int] = 7
    question: str
    answer: str
    conversation: Optional[List[Dict[str, Any]]] = []
    instruction: Optional[str] = None


def get_user_id(current_user: dict) -> str:
    user_id = (
        current_user.get("_id")
        or current_user.get("id")
        or current_user.get("user_id")
    )

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user token.")

    return str(user_id)


@router.post("/start")
async def start_interview(
    request: InterviewStartRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id(current_user)

    role = request.job_role or request.role

    if not role or not role.strip():
        raise HTTPException(
            status_code=400,
            detail="Job role is required.",
        )

    return await generate_interview_question(
        user_id=user_id,
        job_role=role.strip(),
        industry_hint=request.industry_hint or "",
        experience_level=request.experience_level or request.level or "Entry Level",
        total_questions=request.total_questions or 7,
        instruction=request.instruction or "",
    )


@router.post("/answer")
async def submit_answer(
    request: InterviewAnswerRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id(current_user)

    role = request.job_role or request.role

    if not role or not role.strip():
        raise HTTPException(
            status_code=400,
            detail="Job role is required.",
        )

    if not request.answer or not request.answer.strip():
        raise HTTPException(
            status_code=400,
            detail="Answer is required.",
        )

    return await evaluate_interview_answer(
        user_id=user_id,
        interview_id=request.interview_id,
        job_role=role.strip(),
        industry_hint=request.industry_hint or "",
        experience_level=request.experience_level or request.level or "Entry Level",
        question_number=request.question_number or 1,
        total_questions=request.total_questions or 7,
        question=request.question,
        answer=request.answer.strip(),
        conversation=request.conversation or [],
        instruction=request.instruction or "",
    )


@router.get("/history")
async def interview_history(
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id(current_user)
    interviews = await get_interview_history(user_id)

    return {
        "status": "success",
        "count": len(interviews),
        "interviews": interviews,
    }