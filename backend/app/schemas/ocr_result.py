from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class OCRResultBase(BaseModel):
    merchant_name: Optional[str] = None
    company_name: Optional[str] = None
    registration_number: Optional[str] = None
    total_amount: Optional[float] = None
    tax_amount: Optional[float] = None
    tax_rate: Optional[float] = None
    transaction_date: Optional[str] = None
    raw_text: Optional[str] = None
    review_status: str = "PENDING"
    classified_subject_id: Optional[int] = None


class OCRResultRead(OCRResultBase):
    id: int
    file_id: int
    reviewed_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class OCRResultUpdate(BaseModel):
    merchant_name: Optional[str] = None
    company_name: Optional[str] = None
    registration_number: Optional[str] = None
    total_amount: Optional[float] = None
    tax_amount: Optional[float] = None
    tax_rate: Optional[float] = None
    transaction_date: Optional[str] = None
    raw_text: Optional[str] = None
    review_status: Optional[str] = None
    classified_subject_id: Optional[int] = None
