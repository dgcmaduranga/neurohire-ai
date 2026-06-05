from bson import ObjectId
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import settings
from app.database import users_collection

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    try:
        token = credentials.credentials

        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = await users_collection.find_one({"_id": ObjectId(user_id)})

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        user["_id"] = str(user["_id"])
        user.pop("password", None)

        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")