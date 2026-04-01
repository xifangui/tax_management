from datetime import datetime
from sqlmodel import SQLModel, Field, ForeignKey


class ClassificationRule(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    customer_id: int | None = Field(default=None, foreign_key="customer.id")
    industry_type: str | None = None
    keyword: str
    match_type: str = "PARTIAL"
    target_subject_id: int = Field(foreign_key="account_subject.id")
    priority: int = 100
    status: str = "ACTIVE"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
