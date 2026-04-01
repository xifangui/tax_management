from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlmodel import Session, select

from app.core.dependencies import get_current_active_user
from app.core.db import get_session
from app.models.file import File as FileModel
from app.schemas.file import FileRead

router = APIRouter()
UPLOAD_DIR = Path(__file__).resolve().parents[4] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload/", response_model=List[FileRead], status_code=status.HTTP_201_CREATED)
def upload_files(
    customer_id: int = Form(...),
    source_type: str = Form("MANUAL"),
    files: List[UploadFile] = File(...),
    current_user=Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    saved_files = []
    if not files:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No files provided")

    customer_upload_dir = UPLOAD_DIR / str(customer_id)
    customer_upload_dir.mkdir(parents=True, exist_ok=True)

    for upload in files:
        filename = Path(upload.filename).name
        target_path = customer_upload_dir / filename
        with target_path.open("wb") as buffer:
            buffer.write(upload.file.read())

        file_record = FileModel(
            customer_id=customer_id,
            source_type=source_type,
            original_filename=filename,
            storage_path=str(target_path.relative_to(Path(__file__).resolve().parents[4])),
            file_type=upload.content_type or "application/octet-stream",
            file_size=target_path.stat().st_size,
            upload_status="PENDING",
            uploaded_by=current_user.id,
        )
        session.add(file_record)
        session.commit()
        session.refresh(file_record)
        saved_files.append(file_record)

    return saved_files


@router.get("/", response_model=List[FileRead])
def list_files(customer_id: int | None = None, current_user=Depends(get_current_active_user), session: Session = Depends(get_session)):
    statement = select(FileModel)
    if customer_id is not None:
        statement = statement.where(FileModel.customer_id == customer_id)
    files = session.exec(statement).all()
    return files


@router.get("/{file_id}/download")
def download_file(file_id: int, current_user=Depends(get_current_active_user), session: Session = Depends(get_session)):
    file_record = session.get(FileModel, file_id)
    if not file_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    file_path = Path(__file__).resolve().parents[4] / file_record.storage_path
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stored file not found")
    return FileResponse(path=file_path, filename=file_record.original_filename)


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(file_id: int, current_user=Depends(get_current_active_user), session: Session = Depends(get_session)):
    file_record = session.get(FileModel, file_id)
    if not file_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    file_path = Path(__file__).resolve().parents[4] / file_record.storage_path
    if file_path.exists():
        file_path.unlink()
    session.delete(file_record)
    session.commit()
    return None
