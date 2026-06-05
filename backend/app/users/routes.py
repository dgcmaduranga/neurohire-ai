from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext

from app.database import db
from app.dependencies import get_current_user
from app.users.schemas import UserUpdateRequest

router = APIRouter(prefix="/users", tags=["Users"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def serialize_datetime(value):
    if not value:
        return None

    return str(value)


def serialize_user(user: dict):
    if not user:
        return None

    return {
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
    }


def hash_password(password: str):
    return pwd_context.hash(password)


def clean_value(value):
    if value is None:
        return None

    value = str(value).strip()

    if value == "":
        return None

    return value


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    user_id = current_user.get("_id") or current_user.get("id")

    if not user_id or not ObjectId.is_valid(str(user_id)):
      raise HTTPException(
          status_code=status.HTTP_401_UNAUTHORIZED,
          detail="Invalid authenticated user",
      )

    user = await db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "status": "success",
        "user": serialize_user(user),
    }


@router.put("/me")
async def update_me(
    request: UserUpdateRequest,
    current_user=Depends(get_current_user),
):
    user_id = current_user.get("_id") or current_user.get("id")

    if not user_id or not ObjectId.is_valid(str(user_id)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authenticated user",
        )

    data = request.model_dump(exclude_unset=True)

    update_data = {}

    name = clean_value(data.get("name"))
    if name:
        update_data["name"] = name

    username = clean_value(data.get("username"))
    if username:
        existing_username = await db.users.find_one(
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

    email = clean_value(data.get("email"))
    if email:
        email = email.lower()

        existing_email = await db.users.find_one(
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

    phone = clean_value(data.get("phone"))
    if phone:
        update_data["phone"] = phone

    target_role = clean_value(data.get("target_role"))
    if target_role:
        update_data["target_role"] = target_role

    location = clean_value(data.get("location"))
    if location:
        update_data["location"] = location

    bio = clean_value(data.get("bio"))
    if bio:
        update_data["bio"] = bio

    password = clean_value(data.get("password"))
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

    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})

    return {
        "status": "success",
        "message": "Profile updated successfully",
        "user": serialize_user(updated_user),
    }