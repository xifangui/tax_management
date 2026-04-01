from datetime import datetime
from sqlmodel import SQLModel, Field, ForeignKey


class File(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customer.id")
    source_type: str = "MANUAL"
    original_filename: str
    storage_path: str
    file_type: str
    file_size: int
    upload_status: str = "PENDING"
    uploaded_by: int | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
