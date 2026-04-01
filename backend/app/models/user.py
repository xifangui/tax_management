from datetime import datetime
from sqlmodel import SQLModel, Field


class UserBase(SQLModel):
    name: str
    email: str
    role: str = "GENERAL"
    status: str = "ACTIVE"


class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(UserBase):
    password: str
