# Auto-Bookkeeping

税理士向け自動記帳サービスの PoC/プロトタイプとして、FastAPI バックエンドと静的フロントエンドの骨組みを構築します。

## 構成

- `backend/` - FastAPI アプリケーション
- `frontend/` - プロトタイプ HTML ビュー

## 実行

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

`frontend/index.html` をブラウザで開きます。
