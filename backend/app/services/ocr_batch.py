import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional
from sqlmodel import Session, select

from app.models.file import File
from app.models.ocr_result import OCRResult
from app.models.ocr_task import OcrTask

logger = logging.getLogger(__name__)


class OcrBatchService:
    """OCR処理バッチサービス"""

    def __init__(self, session: Session):
        self.session = session

    def process_pending_files(self, max_concurrent: int = 5):
        """未処理ファイルのOCR処理"""
        logger.info("OCR処理バッチ開始")

        # 未処理ファイル取得
        statement = select(File).where(
            File.upload_status == "UPLOADED"
        ).limit(100)

        pending_files = self.session.exec(statement).all()

        if not pending_files:
            logger.info("処理対象ファイルなし")
            return

        logger.info(f"処理対象: {len(pending_files)}件")

        # 各ファイルの処理
        for file in pending_files:
            try:
                self._process_file(file)
            except Exception as e:
                logger.error(f"ファイル処理エラー: fileId={file.id}", exc_info=True)

        logger.info("OCR処理バッチ完了")

    def _process_file(self, file: File):
        """個別ファイルのOCR処理"""
        logger.info(f"ファイル処理開始: fileId={file.id}")

        # OCRタスク作成
        task = OcrTask(
            file_id=file.id,
            status="PROCESSING",
            started_at=datetime.utcnow()
        )
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        try:
            # TODO: 実際のOCR処理を実装
            # ここではダミーデータを作成
            ocr_result = OCRResult(
                file_id=file.id,
                merchant_name="サンプル店舗",
                company_name="サンプル会社",
                total_amount=1000,
                tax_amount=100,
                tax_rate=10,
                transaction_date=datetime.utcnow().strftime("%Y-%m-%d"),
                review_status="PENDING"
            )

            self.session.add(ocr_result)
            self.session.commit()

            # タスク完了
            task.status = "COMPLETED"
            task.completed_at = datetime.utcnow()
            self.session.add(task)
            self.session.commit()

            logger.info(f"ファイル処理完了: fileId={file.id}, resultId={ocr_result.id}")

        except Exception as e:
            logger.error(f"OCR処理エラー: fileId={file.id}", exc_info=True)

            # リトライ回数チェック
            task.retry_count += 1

            if task.retry_count >= task.max_retries:
                task.status = "FAILED"
                task.error_message = str(e)
            else:
                task.status = "PENDING"
                task.next_retry_at = datetime.utcnow() + timedelta(minutes=5)

            self.session.add(task)
            self.session.commit()

    def cleanup_old_tasks(self, days: int = 7):
        """古いOCRタスクのクリーンアップ"""
        threshold = datetime.utcnow() - timedelta(days=days)

        statement = select(OcrTask).where(
            OcrTask.completed_at < threshold
        )

        old_tasks = self.session.exec(statement).all()

        for task in old_tasks:
            self.session.delete(task)

        self.session.commit()
        logger.info(f"古いOCRタスクを削除: {len(old_tasks)}件")
