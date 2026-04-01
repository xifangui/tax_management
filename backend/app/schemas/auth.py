from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: str | None = None
    exp: int | None = None


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "GENERAL"


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
