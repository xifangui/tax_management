from fastapi import APIRouter
from app.api.api_v1.endpoints import (
    auth, customers, files, health, ocr_results, users,
    account_subjects, classification_rules, export, system
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(customers.router, prefix="/customers", tags=["Customers"])
api_router.include_router(files.router, prefix="/files", tags=["Files"])
api_router.include_router(ocr_results.router, prefix="/ocr/results", tags=["OCR Results"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(account_subjects.router, prefix="/account-subjects", tags=["Account Subjects"])
api_router.include_router(classification_rules.router, prefix="/classification-rules", tags=["Classification Rules"])
api_router.include_router(export.router, prefix="/export", tags=["Export"])
api_router.include_router(system.router, prefix="/system", tags=["System"])
