from fastapi import APIRouter
from pydantic import BaseModel
from app.ats.service import generate_ats_report

router = APIRouter(prefix="/ats", tags=["ATS Analyzer"])


class ATSAnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str = ""


@router.post("/analyze-text")
async def analyze_text(request: ATSAnalyzeRequest):
    report = generate_ats_report(
        resume_text=request.resume_text,
        job_description=request.job_description,
    )

    return {
        "status": "success",
        "report": report,
    }