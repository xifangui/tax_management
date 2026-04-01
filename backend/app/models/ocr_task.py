from datetime import datetime
from sqlmodel import SQLModel, Field


class OcrTask(SQLModel, table=True):
    __tablename__ = "ocr_tasks"

    id: int | None = Field(default=None, primary_key=True)
    file_id: int = Field(foreign_key="file.id")
    status: str = "PENDING"  # PENDING, PROCESSING, COMPLETED, FAILED
    retry_count: int = 0
    max_retries: int = 3
    error_message: str | None = None
    next_retry_at: datetime | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
