from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ResumeAnalyzeResponse(BaseModel):
    status: str
    message: Optional[str] = None

    resume_id: Optional[str] = None

    filename: Optional[str] = None
    file_name: Optional[str] = None

    resume_text: Optional[str] = None
    extracted_text_preview: str

    ats_report: Dict[str, Any]


class ResumeHistoryItem(BaseModel):
    id: str
    filename: str
    created_at: str


class ImproveResumeRequest(BaseModel):
    resume_text: str
    ats_report: Dict[str, Any]
    target_role: Optional[str] = "general"


class PersonalInfo(BaseModel):
    name: Optional[str] = ""
    title: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    links: List[str] = []


class SkillGroups(BaseModel):
    technical: List[str] = []
    professional: List[str] = []
    tools: List[str] = []


class ExperienceItem(BaseModel):
    role: Optional[str] = ""
    company: Optional[str] = ""
    location: Optional[str] = ""
    date: Optional[str] = ""
    bullets: List[str] = []


class ProjectItem(BaseModel):
    name: Optional[str] = ""
    description: Optional[str] = ""
    bullets: List[str] = []
    link: Optional[str] = ""


class EducationItem(BaseModel):
    degree: Optional[str] = ""
    institution: Optional[str] = ""
    location: Optional[str] = ""
    date: Optional[str] = ""


class EnhancedResumeJson(BaseModel):
    personal_info: PersonalInfo

    summary: str = ""

    skills: SkillGroups

    experience: List[ExperienceItem] = []

    projects: List[ProjectItem] = []

    education: List[EducationItem] = []

    certifications: List[str] = []

    languages: List[str] = []

    achievements: List[str] = []

    improvements_made: List[str] = []

    estimated_new_score: Optional[float] = None


class ImproveResumeResponse(BaseModel):
    status: str

    message: str

    target_role: Optional[str] = None

    original_score: Optional[float] = None
    original_rating: Optional[str] = None

    estimated_new_score: Optional[float] = None

    enhanced_resume_json: Optional[Dict[str, Any]] = None

    improved_resume: Optional[str] = None


class ImprovedResumePdfRequest(BaseModel):
    improved_resume: str
    filename: Optional[str] = "neurohire-improved-resume.pdf"


class ImprovedResumePdfResponse(BaseModel):
    status: str
    pdf_url: Optional[str] = None
    filename: str


class JobRecommendation(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    country: Optional[str] = None
    description: Optional[str] = None
    source: Optional[str] = None
    apply_link: Optional[str] = None
    employment_type: Optional[str] = None
    posted_at: Optional[str] = None


class AtsReportResponse(BaseModel):
    ats_score: float

    rating: str

    target_role: str

    score_breakdown: Dict[str, Any]

    strengths: List[str]

    improvement_plan: List[str]

    missing_role_skills: List[str]

    matched_role_skills: List[str]

    required_skills: List[str]

    recommend_jobs_allowed: bool

    recommend_jobs_message: str

    summary: str


class ResumeSectionAnalysis(BaseModel):
    email: Optional[str] = None

    phone: Optional[str] = None

    links: List[str] = []

    skills: List[str] = []

    word_count: int = 0

    sections: Dict[str, bool] = {}


class AtsHistoryResponse(BaseModel):
    status: str

    reports: List[Dict[str, Any]]