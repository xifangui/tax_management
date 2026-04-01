from datetime import datetime
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON


class ExportTemplate(SQLModel, table=True):
    __tablename__ = "export_templates"

    id: int | None = Field(default=None, primary_key=True)
    template_name: str
    description: str | None = None
    template_type: str  # CSV, EXCEL, etc.
    column_mapping: dict | None = Field(default=None, sa_column=Column(JSON))
    encoding: str = "UTF-8"
    is_default: bool = False
    status: str = "ACTIVE"
    created_by: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
