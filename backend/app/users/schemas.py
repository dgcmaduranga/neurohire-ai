from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserUpdateRequest(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=80,
    )

    username: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=50,
    )

    email: Optional[EmailStr] = None

    phone: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    target_role: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    location: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    bio: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    password: Optional[str] = Field(
        default=None,
        min_length=6,
        max_length=100,
    )

    @field_validator(
        "name",
        "username",
        "email",
        "phone",
        "target_role",
        "location",
        "bio",
        "password",
        mode="before",
    )
    @classmethod
    def empty_string_to_none(cls, value):
        if value is None:
            return None

        if isinstance(value, str) and value.strip() == "":
            return None

        return value