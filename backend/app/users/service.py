from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status
from passlib.context import CryptContext

from app.database import users_collection

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def serialize_user(user: dict):
    if not user:
        return None

    user["_id"] = str(user["_id"])
    user["id"] = user["_id"]

    user.pop("password", None)
    user.pop("hashed_password", None)

    if user.get("created_at"):
        user["created_at"] = str(user["created_at"])

    if user.get("updated_at"):
        user["updated_at"] = str(user["updated_at"])

    return user


def hash_password(password: str):
    return pwd_context.hash(password)


def clean_string(value):
    if value is None:
        return None

    value = str(value).strip()

    if value == "":
        return None

    return value


async def get_user_by_id(user_id: str):
    if not ObjectId.is_valid(str(user_id)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user id",
        )

    user = await users_collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return serialize_user(user)


async def update_user_profile(user_id: str, data: dict):
    if not ObjectId.is_valid(str(user_id)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user id",
        )

    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided",
        )

    update_data = {}

    name = clean_string(data.get("name"))
    if name:
        update_data["name"] = name

    username = clean_string(data.get("username"))
    if username:
        if len(username) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username must be at least 3 characters",
            )

        existing_username = await users_collection.find_one(
            {
                "username": username,
                "_id": {"$ne": ObjectId(user_id)},
            }
        )

        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already taken",
            )

        update_data["username"] = username

    email = clean_string(data.get("email"))
    if email:
        email = email.lower()

        existing_email = await users_collection.find_one(
            {
                "email": email,
                "_id": {"$ne": ObjectId(user_id)},
            }
        )

        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already used by another account",
            )

        update_data["email"] = email

    phone = clean_string(data.get("phone"))
    if phone:
        update_data["phone"] = phone

    target_role = clean_string(data.get("target_role"))
    if target_role:
        update_data["target_role"] = target_role

    location = clean_string(data.get("location"))
    if location:
        update_data["location"] = location

    bio = clean_string(data.get("bio"))
    if bio:
        update_data["bio"] = bio

    password = clean_string(data.get("password"))
    if password:
        if len(password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters",
            )

        update_data["password"] = hash_password(password)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields provided for update",
        )

    update_data["updated_at"] = datetime.now(timezone.utc)

    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    updated_user = await users_collection.find_one({"_id": ObjectId(user_id)})

    return serialize_user(updated_user)