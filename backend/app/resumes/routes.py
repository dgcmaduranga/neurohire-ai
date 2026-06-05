from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from fastapi.responses import FileResponse

from app.dependencies import get_current_user
from app.resumes.service import (
    save_and_analyze_resume,
    get_resume_history,
    get_ats_reports,
    generate_improved_resume,
    generate_improved_resume_pdf,
)
from app.resumes.schemas import ImproveResumeRequest, ImprovedResumePdfRequest

router = APIRouter(
    prefix="/resumes",
    tags=["Resumes"],
)


def get_user_id(current_user: dict) -> str:
    user_id = (
        current_user.get("user_id")
        or current_user.get("id")
        or current_user.get("_id")
    )

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid user token.",
        )

    return str(user_id)


@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(""),
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id(current_user)

    return await save_and_analyze_resume(
        file=file,
        user_id=user_id,
        job_description=job_description,
    )


@router.post("/improve")
async def improve_resume(
    request: ImproveResumeRequest,
    current_user: dict = Depends(get_current_user),
):
    get_user_id(current_user)

    if not request.resume_text or len(request.resume_text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Resume text is too short to improve.",
        )

    return await generate_improved_resume(
        resume_text=request.resume_text,
        ats_report=request.ats_report,
        target_role=request.target_role or "general",
    )


@router.post("/improved-pdf")
async def improved_resume_pdf(
    request: ImprovedResumePdfRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id(current_user)

    if not request.improved_resume or len(request.improved_resume.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Improved resume text is too short to generate PDF.",
        )

    pdf_path = await generate_improved_resume_pdf(
        improved_resume=request.improved_resume,
        user_id=user_id,
        filename=request.filename or "neurohire-improved-resume.pdf",
    )

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=request.filename or "neurohire-improved-resume.pdf",
    )


@router.get("/history")
async def resume_history(
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id(current_user)

    return {
        "status": "success",
        "resumes": await get_resume_history(user_id),
    }


@router.get("/ats-reports")
async def ats_reports(
    current_user: dict = Depends(get_current_user),
):
    user_id = get_user_id(current_user)

    return {
        "status": "success",
        "reports": await get_ats_reports(user_id),
    }