from datetime import datetime
from pydantic import BaseModel


class FileCreate(BaseModel):
    customer_id: int
    source_type: str = "MANUAL"


class FileRead(BaseModel):
    id: int
    customer_id: int
    source_type: str
    original_filename: str
    storage_path: str
    file_type: str
    file_size: int
    upload_status: str
    uploaded_by: int | None = None
    created_at: datetime

    class Config:
        orm_mode = True
