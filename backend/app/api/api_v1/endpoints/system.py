from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.db import get_session
from app.core.dependencies import get_current_active_user
from app.models.audit_log import AuditLog
from app.models.user import User

router = APIRouter()


@router.get("/dashboard")
def get_system_dashboard(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """システムダッシュボード統計情報取得"""
    # ユーザー統計
    from app.models.user import User
    users = session.exec(select(User)).all()
    total_users = len(users)
    active_users = len([u for u in users if u.status == "ACTIVE"])

    # 顧客統計
    from app.models.customer import Customer
    customers = session.exec(select(Customer)).all()
    total_customers = len(customers)

    # ファイル統計
    from app.models.file import File
    files = session.exec(select(File)).all()
    total_files = len(files)
    storage_used = sum(f.file_size for f in files)

    # OCR結果統計
    from app.models.ocr_result import OCRResult
    ocr_results = session.exec(select(OCRResult)).all()
    pending_ocr = len([o for o in ocr_results if o.review_status == "PENDING"])
    completed_ocr = len([o for o in ocr_results if o.review_status == "APPROVED"])
    failed_ocr = len([o for o in ocr_results if o.review_status == "REJECTED"])

    # エクスポート統計
    from app.models.export_log import ExportLog
    export_logs = session.exec(select(ExportLog)).all()
    total_exports = len(export_logs)

    # OCRトレンドデータ（過去7日間）
    from datetime import datetime, timedelta
    ocr_trend = []
    for i in range(7):
        date = datetime.utcnow() - timedelta(days=6-i)
        date_str = date.strftime("%m/%d")
        daily_count = len([
            o for o in ocr_results 
            if o.created_at.date() == date.date()
        ])
        ocr_trend.append({"date": date_str, "count": daily_count})

    return {
        "totalUsers": total_users,
        "activeUsers": active_users,
        "totalCustomers": total_customers,
        "totalFiles": total_files,
        "pendingOcr": pending_ocr,
        "completedOcr": completed_ocr,
        "failedOcr": failed_ocr,
        "totalExports": total_exports,
        "storageUsage": {
            "total": 10 * 1024 * 1024 * 1024,  # 10GB
            "used": storage_used,
            "percentage": round((storage_used / (10 * 1024 * 1024 * 1024)) * 100, 2)
        },
        "ocrTrend": ocr_trend,
        "ocrStats": {
            "approved": completed_ocr,
            "pending": pending_ocr,
            "rejected": failed_ocr
        }
    }


@router.get("/settings")
def get_system_settings(
    current_user: User = Depends(get_current_active_user),
):
    """システム設定取得(ADMINのみ)"""
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="権限がありません"
        )

    # TODO: 実際の設定をデータベースから取得
    return {
        "ocr": {
            "provider": "Azure Document Intelligence",
            "apiEndpoint": "https://xxxxx.cognitiveservices.azure.com/",
            "maxConcurrency": 5,
            "timeout": 30
        },
        "file": {
            "maxFileSize": 10485760,
            "allowedExtensions": ["jpg", "jpeg", "png", "pdf"],
            "storageType": "NAS",
            "storagePath": "/var/www/storage"
        },
        "export": {
            "defaultEncoding": "UTF-8",
            "linkExpirationDays": 7
        },
        "security": {
            "jwtExpiration": 3600,
            "refreshTokenExpiration": 604800,
            "maxLoginAttempts": 5,
            "lockoutDuration": 1800
        }
    }


@router.put("/settings")
def update_system_settings(
    settings: dict,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """システム設定更新(ADMINのみ)"""
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="権限がありません"
        )

    # TODO: 実際の設定をデータベースに保存
    updated_fields = []

    if "ocr" in settings:
        updated_fields.extend(["ocr.maxConcurrency", "ocr.timeout"])
    if "file" in settings:
        updated_fields.extend(["file.maxFileSize", "file.allowedExtensions"])
    if "export" in settings:
        updated_fields.extend(["export.defaultEncoding", "export.linkExpirationDays"])
    if "security" in settings:
        updated_fields.extend([
            "security.jwtExpiration",
            "security.refreshTokenExpiration",
            "security.maxLoginAttempts",
            "security.lockoutDuration"
        ])

    return {
        "message": "設定を更新しました",
        "updatedFields": updated_fields
    }


@router.get("/audit-logs")
def list_audit_logs(
    page: int = 1,
    limit: int = 50,
    operator_id: Optional[int] = None,
    module: Optional[str] = None,
    action: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """監査ログ一覧取得(ADMINのみ)"""
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="権限がありません"
        )

    statement = select(AuditLog)

    if operator_id:
        statement = statement.where(AuditLog.operator_id == operator_id)
    if module:
        statement = statement.where(AuditLog.module == module)
    if action:
        statement = statement.where(AuditLog.action == action)
    if date_from:
        statement = statement.where(AuditLog.created_at >= date_from)
    if date_to:
        statement = statement.where(AuditLog.created_at <= date_to)

    # ページネーション
    offset = (page - 1) * limit
    statement = statement.offset(offset).limit(limit)

    logs = session.exec(statement).all()
    total = len(logs)

    return {
        "items": logs,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit,
            "hasNext": page * limit < total,
            "hasPrev": page > 1
        }
    }
