import re
from html import unescape

import httpx

from app.config import settings


def clean_html(raw_text: str | None) -> str:
    if not raw_text:
        return ""

    text = re.sub(r"<[^>]+>", " ", raw_text)
    text = unescape(text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def normalize_job(job: dict) -> dict:
    return {
        "source": job.get("source"),
        "title": job.get("title"),
        "company": job.get("company"),
        "location": job.get("location"),
        "country": job.get("country"),
        "description": clean_html(job.get("description")),
        "apply_link": job.get("apply_link"),
        "employment_type": job.get("employment_type"),
        "posted_at": job.get("posted_at"),
    }


async def search_jsearch_jobs(
    query: str,
    location: str,
    page: int = 1,
):
    if not settings.RAPIDAPI_KEY:
        return []

    url = "https://jsearch.p.rapidapi.com/search"

    headers = {
        "X-RapidAPI-Key": settings.RAPIDAPI_KEY,
        "X-RapidAPI-Host": settings.RAPIDAPI_HOST,
    }

    params = {
        "query": f"{query} in {location}",
        "page": str(page),
        "num_pages": "1",
        "country": "lk",
    }

    async with httpx.AsyncClient(timeout=25) as client:
        response = await client.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

    jobs = []

    for item in data.get("data", []):
        job = {
            "source": "JSearch",
            "title": item.get("job_title"),
            "company": item.get("employer_name"),
            "location": item.get("job_city")
            or item.get("job_state")
            or location,
            "country": item.get("job_country"),
            "description": item.get("job_description"),
            "apply_link": item.get("job_apply_link"),
            "employment_type": item.get("job_employment_type"),
            "posted_at": item.get("job_posted_at_datetime_utc"),
        }

        jobs.append(normalize_job(job))

    return jobs


async def search_adzuna_jobs(
    query: str,
    location: str,
):
    if not settings.ADZUNA_APP_ID or not settings.ADZUNA_APP_KEY:
        return []

    url = (
        f"https://api.adzuna.com/v1/api/jobs/"
        f"{settings.DEFAULT_JOB_COUNTRY}/search/1"
    )

    params = {
        "app_id": settings.ADZUNA_APP_ID,
        "app_key": settings.ADZUNA_APP_KEY,
        "what": query,
        "where": location,
        "results_per_page": 10,
        "content-type": "application/json",
    }

    async with httpx.AsyncClient(timeout=25) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    jobs = []

    for item in data.get("results", []):
        job = {
            "source": "Adzuna",
            "title": item.get("title"),
            "company": item.get("company", {}).get("display_name"),
            "location": item.get("location", {}).get("display_name"),
            "country": settings.DEFAULT_JOB_COUNTRY,
            "description": item.get("description"),
            "apply_link": item.get("redirect_url"),
            "employment_type": item.get("contract_type"),
            "posted_at": item.get("created"),
        }

        jobs.append(normalize_job(job))

    return jobs


async def search_remotive_jobs(query: str):
    if not settings.REMOTIVE_API_URL:
        return []

    async with httpx.AsyncClient(timeout=25) as client:
        response = await client.get(
            settings.REMOTIVE_API_URL,
            params={"search": query},
        )
        response.raise_for_status()
        data = response.json()

    jobs = []

    for item in data.get("jobs", [])[:10]:
        job = {
            "source": "Remotive",
            "title": item.get("title"),
            "company": item.get("company_name"),
            "location": "Remote",
            "country": "Remote",
            "description": item.get("description"),
            "apply_link": item.get("url"),
            "employment_type": item.get("job_type"),
            "posted_at": item.get("publication_date"),
        }

        jobs.append(normalize_job(job))

    return jobs


async def search_remoteok_jobs(query: str):
    if not settings.REMOTEOK_API_URL:
        return []

    headers = {
        "User-Agent": "NeuroHire-AI/1.0",
    }

    async with httpx.AsyncClient(timeout=25) as client:
        response = await client.get(settings.REMOTEOK_API_URL, headers=headers)
        response.raise_for_status()
        data = response.json()

    jobs = []

    for item in data[1:]:
        title = item.get("position", "")
        tags = " ".join(item.get("tags", []))

        if query.lower() not in f"{title} {tags}".lower():
            continue

        job = {
            "source": "RemoteOK",
            "title": title,
            "company": item.get("company"),
            "location": item.get("location") or "Remote",
            "country": "Remote",
            "description": item.get("description"),
            "apply_link": item.get("url"),
            "employment_type": "Remote",
            "posted_at": item.get("date"),
        }

        jobs.append(normalize_job(job))

    return jobs[:10]