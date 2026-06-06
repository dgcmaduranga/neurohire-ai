from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import ping_database

from app.auth.routes import router as auth_router
from app.users.routes import router as users_router
from app.jobs.routes import router as jobs_router
from app.ats.routes import router as ats_router
from app.resumes.routes import router as resumes_router
from app.interviews.routes import router as interviews_router
from app.dashboard.routes import router as dashboard_router
from app.notifications.routes import router as notifications_router

app = FastAPI(
    title="NeuroHire AI Backend",
    version="1.0.0",
    description="AI Career Preparation, Resume Optimization, Job Discovery and Interview Practice Backend",
)

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://neurohire-ai-alpha.vercel.app",
]

if settings.FRONTEND_URL:
    allowed_origins.append(settings.FRONTEND_URL.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(allowed_origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(jobs_router)
app.include_router(ats_router)
app.include_router(resumes_router)
app.include_router(interviews_router)
app.include_router(dashboard_router)
app.include_router(notifications_router)


@app.on_event("startup")
async def startup_event():
    try:
        mongo = await ping_database()

        if mongo.get("ok") == 1.0:
            print("✅ MongoDB connected successfully")
        else:
            print("⚠️ MongoDB connection response:", mongo)

    except Exception as e:
        print("❌ MongoDB connection failed:", str(e))


@app.get("/", tags=["System"])
async def root():
    return {
        "message": "NeuroHire AI Backend is running",
        "status": "success",
        "docs": "/docs",
    }


@app.get("/health", tags=["System"])
async def health_check():
    try:
        mongo = await ping_database()

        return {
            "backend": "running",
            "mongodb": mongo,
            "status": "healthy" if mongo.get("ok") == 1.0 else "warning",
        }

    except Exception as e:
        return {
            "backend": "running",
            "mongodb": "failed",
            "error": str(e),
            "status": "unhealthy",
        }