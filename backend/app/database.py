from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.MONGO_URI)
db = client[settings.MONGO_DB_NAME]

users_collection = db["users"]
resumes_collection = db["resumes"]
ats_reports_collection = db["ats_reports"]
jobs_collection = db["jobs"]
interviews_collection = db["interviews"]
notifications_collection = db["notifications"]


async def ping_database():
    return await db.command("ping")