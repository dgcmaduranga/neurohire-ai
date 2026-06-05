from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.config import settings
from app.dependencies import get_current_user
from app.jobs.service import get_saved_jobs, save_job_for_user, search_all_jobs

router = APIRouter(prefix="/jobs", tags=["Jobs"])


class SaveJobRequest(BaseModel):
    job: dict


@router.get("/search")
async def search_jobs(
    query: str = Query("software engineer"),
    location: str = Query(settings.DEFAULT_JOB_LOCATION),
):
    jobs = await search_all_jobs(query=query, location=location)

    return {
        "status": "success",
        "query": query,
        "location": location,
        "count": len(jobs),
        "jobs": jobs,
    }


@router.post("/save")
async def save_job(
    request: SaveJobRequest,
    current_user=Depends(get_current_user),
):
    return await save_job_for_user(
        user_id=current_user["_id"],
        job=request.job,
    )


@router.get("/saved")
async def saved_jobs(current_user=Depends(get_current_user)):
    jobs = await get_saved_jobs(current_user["_id"])

    return {
        "status": "success",
        "count": len(jobs),
        "jobs": jobs,
    }