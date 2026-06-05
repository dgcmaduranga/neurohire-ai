from datetime import datetime

from app.database import jobs_collection
from app.jobs.providers import (
    search_adzuna_jobs,
    search_jsearch_jobs,
    search_remotive_jobs,
    search_remoteok_jobs,
)


def remove_duplicate_jobs(jobs: list[dict]) -> list[dict]:
    seen = set()
    unique_jobs = []

    for job in jobs:
        key = (
            str(job.get("title", "")).lower(),
            str(job.get("company", "")).lower(),
            str(job.get("apply_link", "")).lower(),
        )

        if key in seen:
            continue

        seen.add(key)
        unique_jobs.append(job)

    return unique_jobs


async def search_all_jobs(
    query: str,
    location: str,
):
    all_jobs = []

    try:
        all_jobs.extend(await search_jsearch_jobs(query, location))
    except Exception as e:
        print("JSearch error:", e)

    try:
        all_jobs.extend(await search_adzuna_jobs(query, location))
    except Exception as e:
        print("Adzuna error:", e)

    try:
        all_jobs.extend(await search_remotive_jobs(query))
    except Exception as e:
        print("Remotive error:", e)

    try:
        all_jobs.extend(await search_remoteok_jobs(query))
    except Exception as e:
        print("RemoteOK error:", e)

    return remove_duplicate_jobs(all_jobs)


async def save_job_for_user(user_id: str, job: dict):
    job_doc = {
        "user_id": user_id,
        "job": job,
        "saved_at": datetime.utcnow(),
    }

    result = await jobs_collection.insert_one(job_doc)

    return {
        "status": "success",
        "message": "Job saved successfully",
        "saved_job_id": str(result.inserted_id),
    }


async def get_saved_jobs(user_id: str):
    saved_jobs = await jobs_collection.find(
        {"user_id": user_id}
    ).sort("saved_at", -1).to_list(100)

    for item in saved_jobs:
        item["_id"] = str(item["_id"])

    return saved_jobs