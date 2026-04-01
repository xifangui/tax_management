from datetime import datetime
from sqlmodel import SQLModel, Field


class ExportLog(SQLModel, table=True):
    __tablename__ = "export_logs"

    id: int | None = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customer.id")
    template_id: int | None = None
    filename: str
    file_path: str
    record_count: int
    file_size: int
    encoding: str = "UTF-8"
    export_params: str | None = None  # JSON string
    exported_by: int = Field(foreign_key="user.id")
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
