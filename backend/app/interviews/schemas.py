from typing import Any, Dict, List, Optional

from pydantic import BaseModel


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


class FinalInterviewReport(BaseModel):
    overall_score: int
    communication_score: int
    role_knowledge_score: int
    confidence_score: int
    strengths: List[str]
    weaknesses: List[str]
    recommendation: str


class InterviewAnswerResponse(BaseModel):
    status: str
    score: int
    is_answer_relevant: bool
    feedback: str
    strengths: List[str]
    weaknesses: List[str]
    improved_answer: str
    next_question: Optional[str] = None
    final_report: Optional[FinalInterviewReport] = None


class InterviewStartResponse(BaseModel):
    status: str
    interview_id: str
    job_role: str
    industry_hint: Optional[str] = ""
    experience_level: Optional[str] = "Entry Level"
    question: str


class InterviewHistoryResponse(BaseModel):
    status: str
    count: int
    interviews: List[Dict[str, Any]]