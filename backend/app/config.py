from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str
    APP_ENV: str

    MONGO_URI: str
    MONGO_DB_NAME: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    OPENAI_API_KEY: str = ""

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    ADZUNA_APP_ID: str = ""
    ADZUNA_APP_KEY: str = ""

    RAPIDAPI_KEY: str = ""
    RAPIDAPI_HOST: str = ""

    REMOTIVE_API_URL: str = ""
    REMOTEOK_API_URL: str = ""

    DEFAULT_JOB_COUNTRY: str = "lk"
    DEFAULT_JOB_LOCATION: str = "Sri Lanka"

    class Config:
        env_file = ".env"


settings = Settings()

from dotenv import load_dotenv
load_dotenv()