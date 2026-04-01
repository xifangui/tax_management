import logging
import asyncio
from datetime import datetime
from pathlib import Path

from app.core.db import get_session
from app.services.ocr_batch import OcrBatchService
from app.services.cleanup_batch import CleanupBatchService

logger = logging.getLogger(__name__)


class BatchScheduler:
    """バッチ処理スケジューラ"""

    def __init__(self):
        self.ocr_interval = 300  # 5分（秒）
        self.cleanup_hour = 3  # 毎日3時
        self.is_running = False

    async def start(self):
        """スケジューラ開始"""
        if self.is_running:
            logger.warning("スケジューラは既に実行中です")
            return

        self.is_running = True
        logger.info("バッチ処理スケジューラ開始")

        # OCR処理バッチ（5分毎）
        asyncio.create_task(self._schedule_ocr_batch())

        # ファイルクリーンアップバッチ（毎日3時）
        asyncio.create_task(self._schedule_cleanup_batch())

    async def stop(self):
        """スケジューラ停止"""
        self.is_running = False
        logger.info("バッチ処理スケジューラ停止")

    async def _schedule_ocr_batch(self):
        """OCR処理バッチのスケジューリング"""
        while self.is_running:
            try:
                with next(get_session()) as session:
                    service = OcrBatchService(session)
                    service.process_pending_files()
            except Exception as e:
                logger.error("OCR処理バッチエラー", exc_info=True)

            await asyncio.sleep(self.ocr_interval)

    async def _schedule_cleanup_batch(self):
        """ファイルクリーンアップバッチのスケジューリング"""
        while self.is_running:
            try:
                now = datetime.utcnow()

                # 毎日3時に実行
                if now.hour == self.cleanup_hour and now.minute < 5:
                    with next(get_session()) as session:
                        upload_dir = Path(__file__).resolve().parents[4] / "uploads"
                        service = CleanupBatchService(session, str(upload_dir))
                        service.run_all_cleanup()

                # 次の実行時間まで待機
                await asyncio.sleep(60)  # 1分毎にチェック
            except Exception as e:
                logger.error("ファイルクリーンアップバッチエラー", exc_info=True)
                await asyncio.sleep(60)


# グローバルスケジューラインスタンス
scheduler = BatchScheduler()
