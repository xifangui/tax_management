from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Any, Optional
from sqlalchemy import Column, JSON
import json


class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"

    id: int | None = Field(default=None, primary_key=True)
    operator_id: int = Field(foreign_key="user.id")
    operator_name: str | None = None
    module: str
    action: str
    target_id: int | None = None
    target_name: str | None = None
    detail: dict | None = Field(default=None, sa_column=Column(JSON))
    ip_address: str | None = None
    user_agent: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    def get_detail_data(self) -> dict | None:
        return self.detail

    def set_detail_data(self, value: dict | None):
        self.detail = value
