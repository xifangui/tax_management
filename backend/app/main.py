import asyncio
import logging
from fastapi import FastAPI, Request
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.api.api_v1.api import api_router
from app.core.config import settings
from app.core.db import init_db
from app.services.scheduler import scheduler

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # アプリケーション起動時
    for attempt in range(1, 6):
        try:
            init_db()
            break
        except Exception:
            logger.exception("DB初期化に失敗しました (attempt=%s/5)", attempt)
            if attempt == 5:
                raise
            await asyncio.sleep(3)

    await scheduler.start()
    yield
    # アプリケーション終了時
    await scheduler.stop()

app = FastAPI(
    title="Auto Bookkeeping",
    description="税理士向け自動記帳サービス API",
    version="0.1.0",
    lifespan=lifespan
)

# CORS設定 - 開発環境ではすべてのオリジンを許可
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Expose-Headers"] = "*"
    
    if request.method == "OPTIONS":
        response.status_code = 200
        return response
    
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

frontend_dir = Path(__file__).resolve().parents[2] / "frontend"
if frontend_dir.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_dir)), name="static")
else:
    logger.warning("frontendディレクトリが見つからないため、/staticのマウントをスキップします: %s", frontend_dir)

app.include_router(api_router, prefix=f"{settings.API_V1_STR}")

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}