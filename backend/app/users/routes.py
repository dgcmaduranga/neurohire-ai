from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext

from app.database import db
from app.dependencies import get_current_user
from app.users.schemas import UserUpdateRequest

router = APIRouter(prefix="/users", tags=["Users"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def serialize_user(user: dict):
    return {
        "id": str(user.get("_id")),
        "_id": str(user.get("_id")),
        "name": user.get("name", ""),
        "username": user.get("username", ""),
        "email": user.get("email", ""),
        "created_at": user.get("created_at"),
        "updated_at": user.get("updated_at"),
    }


def hash_password(password: str):
    return pwd_context.hash(password)


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    user_id = current_user.get("_id") or current_user.get("id")

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

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authenticated user",
        )

    data = request.model_dump(exclude_unset=True)

    update_data = {}

    if data.get("name") is not None:
        update_data["name"] = data["name"].strip()

    if data.get("username") is not None:
        username = data["username"].strip()

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

    if data.get("email") is not None:
        email = data["email"].lower().strip()

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

    if data.get("password") is not None:
        password = data["password"].strip()

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