from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import HTTPException, status

from app.database import (
    users_collection,
    resumes_collection,
    ats_reports_collection,
    interviews_collection,
)


def serialize_datetime(value):
    if not value:
        return None

    return str(value)


def safe_number(value):
    try:
        return round(float(value or 0))
    except Exception:
        return 0


def build_user_match(user_id: str):
    object_user_id = ObjectId(user_id)

    return {
        "$or": [
            {"user_id": user_id},
            {"user_id": object_user_id},
        ]
    }


def get_ats_score(report_doc: dict):
    if not report_doc:
        return 0

    if report_doc.get("ats_score") is not None:
        return safe_number(report_doc.get("ats_score"))

    if report_doc.get("score") is not None:
        return safe_number(report_doc.get("score"))

    report = report_doc.get("report") or {}

    if report.get("ats_score") is not None:
        return safe_number(report.get("ats_score"))

    if report.get("score") is not None:
        return safe_number(report.get("score"))

    if report.get("overall_score") is not None:
        return safe_number(report.get("overall_score"))

    return 0


def get_ats_rating(report_doc: dict):
    if not report_doc:
        return ""

    if report_doc.get("rating"):
        return report_doc.get("rating")

    report = report_doc.get("report") or {}

    return (
        report.get("rating")
        or report.get("grade")
        or report.get("level")
        or ""
    )


def get_target_role(report_doc: dict):
    if not report_doc:
        return ""

    if report_doc.get("target_role"):
        return report_doc.get("target_role")

    if report_doc.get("job_description"):
        return report_doc.get("job_description")

    if report_doc.get("role"):
        return report_doc.get("role")

    report = report_doc.get("report") or {}

    return (
        report.get("target_role")
        or report.get("job_description")
        or report.get("role")
        or ""
    )


def get_interview_score(interview_doc: dict):
    if not interview_doc:
        return 0

    if interview_doc.get("score") is not None:
        return safe_number(interview_doc.get("score"))

    if interview_doc.get("overall_score") is not None:
        return safe_number(interview_doc.get("overall_score"))

    feedback = interview_doc.get("feedback") or {}

    if feedback.get("score") is not None:
        return safe_number(feedback.get("score"))

    return 0


def is_filled(value):
    return value is not None and str(value).strip() != ""


async def get_dashboard_summary(user_id: str):
    if not user_id or not ObjectId.is_valid(str(user_id)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user id",
        )

    object_user_id = ObjectId(user_id)

    user = await users_collection.find_one({"_id": object_user_id})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user_match = build_user_match(str(user_id))

    total_resumes = await resumes_collection.count_documents(user_match)
    total_interviews = await interviews_collection.count_documents(user_match)

    latest_resume = await resumes_collection.find_one(
        user_match,
        sort=[("created_at", -1)],
    )

    latest_interview = await interviews_collection.find_one(
        user_match,
        sort=[("created_at", -1)],
    )

    latest_ats_report = await ats_reports_collection.find_one(
        user_match,
        sort=[("created_at", -1)],
    )

    all_ats_reports = await ats_reports_collection.find(user_match).to_list(
        length=1000
    )

    scores = []

    for report_doc in all_ats_reports:
        score = get_ats_score(report_doc)

        if score > 0:
            scores.append(score)

    average_ats_score = round(sum(scores) / len(scores)) if scores else 0
    best_ats_score = max(scores) if scores else 0

    profile_fields = [
        user.get("name"),
        user.get("email"),
        user.get("phone"),
        user.get("target_role"),
        user.get("location"),
        user.get("bio"),
    ]

    completed_fields = sum(1 for field in profile_fields if is_filled(field))
    profile_completion = round((completed_fields / len(profile_fields)) * 100)

    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    resumes_this_week = await resumes_collection.count_documents(
        {
            "$and": [
                user_match,
                {"created_at": {"$gte": week_ago}},
            ]
        }
    )

    interviews_this_week = await interviews_collection.count_documents(
        {
            "$and": [
                user_match,
                {"created_at": {"$gte": week_ago}},
            ]
        }
    )

    latest_resume_score = get_ats_score(latest_ats_report)
    latest_resume_rating = get_ats_rating(latest_ats_report)
    latest_target_role = get_target_role(latest_ats_report)
    latest_interview_score = get_interview_score(latest_interview)

    next_step = "Complete your profile"

    if profile_completion < 80:
        next_step = "Complete your profile"
    elif total_resumes == 0:
        next_step = "Upload your first resume"
    elif total_resumes > 0 and best_ats_score < 80:
        next_step = "Improve your ATS score"
    elif best_ats_score >= 80 and total_interviews == 0:
        next_step = "Start AI interview practice"
    else:
        next_step = "Keep improving your career progress"

    return {
        "user": {
            "id": str(user.get("_id")),
            "_id": str(user.get("_id")),
            "name": user.get("name", ""),
            "username": user.get("username", ""),
            "email": user.get("email", ""),
            "phone": user.get("phone", ""),
            "target_role": user.get("target_role", ""),
            "location": user.get("location", ""),
            "bio": user.get("bio", ""),
            "auth_provider": user.get("auth_provider", ""),
            "profile_picture": user.get("profile_picture", ""),
            "created_at": serialize_datetime(user.get("created_at")),
            "updated_at": serialize_datetime(user.get("updated_at")),
        },
        "stats": {
            "profile_completion": profile_completion,
            "total_resumes": total_resumes,
            "total_interviews": total_interviews,
            "average_ats_score": average_ats_score,
            "best_ats_score": best_ats_score,
            "resumes_this_week": resumes_this_week,
            "interviews_this_week": interviews_this_week,
        },
        "latest_resume": {
            "id": str(latest_resume.get("_id")) if latest_resume else "",
            "file_name": (
                latest_resume.get("filename")
                or latest_resume.get("file_name")
                or latest_resume.get("stored_filename")
                or ""
            )
            if latest_resume
            else "",
            "ats_score": latest_resume_score,
            "rating": latest_resume_rating,
            "target_role": latest_target_role,
            "created_at": serialize_datetime(latest_resume.get("created_at"))
            if latest_resume
            else None,
        },
        "latest_interview": {
            "id": str(latest_interview.get("_id")) if latest_interview else "",
            "score": latest_interview_score,
            "role": latest_interview.get("role", "") if latest_interview else "",
            "status": latest_interview.get("status", "") if latest_interview else "",
            "created_at": serialize_datetime(latest_interview.get("created_at"))
            if latest_interview
            else None,
        },
        "recommended_next_step": next_step,
    }