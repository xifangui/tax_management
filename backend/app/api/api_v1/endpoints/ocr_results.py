from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlmodel import Session, select

from app.core.db import get_session
from app.core.dependencies import get_current_active_user
from app.models.file import File as FileModel
from app.models.ocr_result import OCRResult
from app.schemas.ocr_result import OCRResultRead, OCRResultUpdate

router = APIRouter()


@router.get("/", response_model=List[OCRResultRead])
def list_ocr_results(
    customer_id: int | None = None,
    review_status: str | None = None,
    current_user=Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    statement = select(OCRResult)
    if customer_id is not None:
        statement = statement.join(FileModel, OCRResult.file_id == FileModel.id).where(FileModel.customer_id == customer_id)
    if review_status is not None:
        statement = statement.where(OCRResult.review_status == review_status)
    return session.exec(statement).all()


@router.get("/{result_id}", response_model=OCRResultRead)
def get_ocr_result(result_id: int, current_user=Depends(get_current_active_user), session: Session = Depends(get_session)):
    result = session.get(OCRResult, result_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="OCR result not found")
    return result


@router.put("/{result_id}", response_model=OCRResultRead)
def update_ocr_result(
    result_id: int,
    result_in: OCRResultUpdate,
    current_user=Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    result = session.get(OCRResult, result_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="OCR result not found")

    update_data = result_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(result, field, value)
    session.add(result)
    session.commit()
    session.refresh(result)
    return result


@router.post("/{result_id}/retry", response_model=OCRResultRead)
def retry_ocr_result(result_id: int, current_user=Depends(get_current_active_user), session: Session = Depends(get_session)):
    result = session.get(OCRResult, result_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="OCR result not found")
    result.review_status = "RETRY"
    session.add(result)
    session.commit()
    session.refresh(result)
    return result
