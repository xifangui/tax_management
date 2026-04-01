from datetime import datetime
from pydantic import BaseModel


class CustomerBase(BaseModel):
    customer_name: str
    company_type: str | None = None
    industry_type: str | None = None
    registration_number: str | None = None
    contact_info: str | None = None
    status: str = "ACTIVE"


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(CustomerBase):
    pass


class CustomerRead(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
