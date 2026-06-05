from datetime import datetime

from fastapi import HTTPException
from google.auth.transport import requests
from google.oauth2 import id_token

from app.auth.utils import create_access_token, hash_password, verify_password
from app.config import settings
from app.database import users_collection


def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user.get("name"),
        "email": user.get("email"),
        "auth_provider": user.get("auth_provider"),
        "profile_picture": user.get("profile_picture"),
        "created_at": str(user.get("created_at")),
    }


async def register_user(name: str, email: str, password: str):
    email = email.lower().strip()

    existing_user = await users_collection.find_one({"email": email})

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = {
        "name": name.strip(),
        "email": email,
        "password": hash_password(password),
        "auth_provider": "email",
        "profile_picture": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await users_collection.insert_one(new_user)
    new_user["_id"] = result.inserted_id

    token = create_access_token({"sub": str(result.inserted_id)})

    return {
        "message": "User registered successfully",
        "token": token,
        "user": serialize_user(new_user),
    }


async def login_user(email: str, password: str):
    email = email.lower().strip()

    user = await users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.get("auth_provider") == "google":
        raise HTTPException(
            status_code=400,
            detail="This account uses Google Sign-In. Please continue with Google.",
        )

    if not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"])})

    return {
        "message": "Login successful",
        "token": token,
        "user": serialize_user(user),
    }


async def google_login_user(token: str):
    try:
        google_user = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = google_user.get("email", "").lower().strip()
    name = google_user.get("name")
    picture = google_user.get("picture")

    if not email:
        raise HTTPException(status_code=400, detail="Google email not found")

    user = await users_collection.find_one({"email": email})

    if not user:
        new_user = {
            "name": name,
            "email": email,
            "password": None,
            "auth_provider": "google",
            "profile_picture": picture,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        result = await users_collection.insert_one(new_user)
        new_user["_id"] = result.inserted_id
        user = new_user

    else:
        await users_collection.update_one(
            {"email": email},
            {
                "$set": {
                    "name": name or user.get("name"),
                    "profile_picture": picture or user.get("profile_picture"),
                    "updated_at": datetime.utcnow(),
                }
            },
        )

        user = await users_collection.find_one({"email": email})

    access_token = create_access_token({"sub": str(user["_id"])})

    return {
        "message": "Google login successful",
        "token": access_token,
        "user": serialize_user(user),
    }