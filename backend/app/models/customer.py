from datetime import datetime
from sqlmodel import SQLModel, Field


class Customer(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    customer_name: str
    company_type: str | None = None
    industry_type: str | None = None
    registration_number: str | None = None
    contact_info: str | None = None
    status: str = "ACTIVE"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
