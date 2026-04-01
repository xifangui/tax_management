import logging
from datetime import datetime, timedelta
from pathlib import Path
from sqlmodel import Session, select

from app.models.file import File
from app.models.export_log import ExportLog

logger = logging.getLogger(__name__)


class CleanupBatchService:
    """ファイルクリーンアップバッチサービス"""

    def __init__(self, session: Session, upload_dir: str = "uploads"):
        self.session = session
        self.upload_dir = Path(upload_dir)

    def cleanup_deleted_files(self, days: int = 90):
        """90日以上前の削除済みファイルを物理削除"""
        threshold = datetime.utcnow() - timedelta(days=days)

        statement = select(File).where(
            File.upload_status == "DELETED"
        ).where(
            File.created_at < threshold
        )

        deleted_files = self.session.exec(statement).all()

        for file in deleted_files:
            try:
                file_path = self.upload_dir / file.storage_path
                if file_path.exists():
                    file_path.unlink()
                    logger.info(f"削除済みファイル物理削除: fileId={file.id}")

                self.session.delete(file)
            except Exception as e:
                logger.error(f"ファイル削除エラー: fileId={file.id}", exc_info=True)

        self.session.commit()
        logger.info(f"削除済みファイル物理削除完了: {len(deleted_files)}件")

    def cleanup_expired_exports(self):
        """期限切れ出力ファイルを削除"""
        statement = select(ExportLog).where(
            ExportLog.expires_at < datetime.utcnow()
        )

        expired_exports = self.session.exec(statement).all()

        for export in expired_exports:
            try:
                file_path = Path(export.file_path)
                if file_path.exists():
                    file_path.unlink()
                    logger.info(f"期限切れ出力ファイル削除: exportId={export.id}")

                self.session.delete(export)
            except Exception as e:
                logger.error(f"出力ファイル削除エラー: exportId={export.id}", exc_info=True)

        self.session.commit()
        logger.info(f"期限切れ出力ファイル削除完了: {len(expired_exports)}件")

    def cleanup_orphan_files(self):
        """孤立ファイル（DBレコードなし）を削除"""
        # DBに存在するファイルパスを取得
        statement = select(File)
        db_files = self.session.exec(statement).all()
        db_paths = {Path(f.storage_path) for f in db_files}

        # ストレージ内の全ファイルを取得
        orphan_count = 0
        for customer_dir in self.upload_dir.iterdir():
            if not customer_dir.is_dir():
                continue

            for file_path in customer_dir.iterdir():
                if file_path.is_file() and file_path not in db_paths:
                    try:
                        file_path.unlink()
                        orphan_count += 1
                        logger.info(f"孤立ファイル削除: {file_path}")
                    except Exception as e:
                        logger.error(f"孤立ファイル削除エラー: {file_path}", exc_info=True)

        logger.info(f"孤立ファイル削除完了: {orphan_count}件")

    def run_all_cleanup(self):
        """全クリーンアップ処理を実行"""
        logger.info("ファイルクリーンアップバッチ開始")

        self.cleanup_deleted_files()
        self.cleanup_expired_exports()
        self.cleanup_orphan_files()

        logger.info("ファイルクリーンアップバッチ完了")
