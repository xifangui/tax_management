from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import FileResponse
from sqlmodel import Session, select
from datetime import datetime, timedelta
import csv
import io
import json

from app.core.db import get_session
from app.core.dependencies import get_current_active_user
from app.models.export_log import ExportLog
from app.models.export_template import ExportTemplate
from app.models.ocr_result import OCRResult
from app.models.file import File
from app.models.user import User

router = APIRouter()


@router.post("/csv", status_code=status.HTTP_200_OK)
def export_csv(
    customer_id: int,
    date_from: str,
    date_to: str,
    template_id: int,
    encoding: str = "UTF-8",
    include_status: Optional[List[str]] = None,
    classified_subject_ids: Optional[List[int]] = None,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """CSV出力"""
    # テンプレート取得
    template = session.get(ExportTemplate, template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="テンプレートが見つかりません"
        )

    # OCR結果取得
    statement = select(OCRResult).join(File, OCRResult.file_id == File.id)
    statement = statement.where(File.customer_id == customer_id)

    if date_from:
        statement = statement.where(OCRResult.transaction_date >= date_from)
    if date_to:
        statement = statement.where(OCRResult.transaction_date <= date_to)

    if include_status:
        statement = statement.where(OCRResult.review_status.in_(include_status))

    if classified_subject_ids:
        statement = statement.where(OCRResult.classified_subject_id.in_(classified_subject_ids))

    ocr_results = session.exec(statement).all()

    # CSV作成
    column_mapping = json.loads(template.column_mapping)
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=column_mapping.keys(), encoding=encoding)
    writer.writeheader()

    for result in ocr_results:
        row = {}
        for csv_field, db_field in column_mapping.items():
            value = getattr(result, db_field, "")
            if isinstance(value, datetime):
                value = value.strftime("%Y-%m-%d")
            row[csv_field] = value
        writer.writerow(row)

    # エクスポートログ作成
    csv_content = output.getvalue()
    export_log = ExportLog(
        customer_id=customer_id,
        template_id=template_id,
        filename=f"export_customer{customer_id}_{datetime.now().strftime('%Y%m%d')}.csv",
        file_path=f"/exports/export_{datetime.now().strftime('%Y%m%d%H%M%S')}.csv",
        record_count=len(ocr_results),
        file_size=len(csv_content.encode(encoding)),
        encoding=encoding,
        export_params=json.dumps({
            "date_from": date_from,
            "date_to": date_to,
            "include_status": include_status,
            "classified_subject_ids": classified_subject_ids
        }),
        exported_by=current_user.id,
        expires_at=datetime.now() + timedelta(days=7)
    )
    session.add(export_log)
    session.commit()

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={export_log.filename}",
            "Content-Encoding": encoding
        }
    )


@router.get("/templates", response_model=List[ExportTemplate])
def list_export_templates(
    template_type: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """出力テンプレート一覧取得"""
    statement = select(ExportTemplate)

    if template_type:
        statement = statement.where(ExportTemplate.template_type == template_type)

    return session.exec(statement).all()


@router.get("/templates/{template_id}", response_model=ExportTemplate)
def get_export_template(
    template_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """出力テンプレート詳細取得"""
    template = session.get(ExportTemplate, template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="テンプレートが見つかりません"
        )
    return template


@router.post("/templates", response_model=ExportTemplate, status_code=status.HTTP_201_CREATED)
def create_export_template(
    template: ExportTemplate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """出力テンプレート作成(ADMINのみ)"""
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="権限がありません"
        )

    template.created_by = current_user.id
    session.add(template)
    session.commit()
    session.refresh(template)
    return template


@router.put("/templates/{template_id}", response_model=ExportTemplate)
def update_export_template(
    template_id: int,
    template: ExportTemplate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """出力テンプレート更新(ADMINのみ)"""
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="権限がありません"
        )

    db_template = session.get(ExportTemplate, template_id)
    if not db_template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="テンプレートが見つかりません"
        )

    template_data = template.dict(exclude_unset=True)
    for key, value in template_data.items():
        setattr(db_template, key, value)

    session.add(db_template)
    session.commit()
    session.refresh(db_template)
    return db_template


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_export_template(
    template_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """出力テンプレート削除(ADMINのみ)"""
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="権限がありません"
        )

    template = session.get(ExportTemplate, template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="テンプレートが見つかりません"
        )

    session.delete(template)
    session.commit()
    return None


@router.get("/logs", response_model=List[ExportLog])
def list_export_logs(
    customer_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """エクスポートログ一覧取得"""
    statement = select(ExportLog)

    if customer_id:
        statement = statement.where(ExportLog.customer_id == customer_id)

    # 非管理者の場合、自分のエクスポートのみ表示
    if current_user.role != "ADMIN":
        statement = statement.where(ExportLog.exported_by == current_user.id)

    return session.exec(statement).all()


@router.get("/logs/{export_id}/download")
def download_export_file(
    export_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """エクスポートファイルダウンロード"""
    export_log = session.get(ExportLog, export_id)
    if not export_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="エクスポートログが見つかりません"
        )

    # 権限チェック
    if export_log.exported_by != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="このファイルへのアクセス権限がありません"
        )

    # 有効期限チェック
    if export_log.expires_at < datetime.now():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="ダウンロードリンクの有効期限が切れています"
        )

    try:
        return FileResponse(
            path=export_log.file_path,
            filename=export_log.filename,
            media_type="text/csv"
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ファイルが見つかりません"
        )
