from datetime import datetime
from sqlmodel import SQLModel, Field, ForeignKey


class OCRResult(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    file_id: int = Field(foreign_key="file.id")
    merchant_name: str | None = None
    company_name: str | None = None
    registration_number: str | None = None
    total_amount: float | None = None
    tax_amount: float | None = None
    tax_rate: float | None = None
    transaction_date: str | None = None
    raw_text: str | None = None
    review_status: str = "PENDING"
    reviewed_by: int | None = None
    classified_subject_id: int | None = Field(default=None, foreign_key="account_subject.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
