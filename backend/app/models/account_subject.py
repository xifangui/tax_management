from datetime import datetime
from sqlmodel import SQLModel, Field, ForeignKey


class AccountSubject(SQLModel, table=True):
    __tablename__ = "account_subject"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int | None = Field(default=None, foreign_key="customer.id")
    industry_type: str | None = None
    subject_code: str
    subject_name: str
    subject_type: str
    tax_category: str | None = None
    status: str = "ACTIVE"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
