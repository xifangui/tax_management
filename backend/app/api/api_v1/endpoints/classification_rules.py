from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.db import get_session
from app.core.dependencies import get_current_active_user
from app.models.classification_rule import ClassificationRule
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[ClassificationRule])
def list_classification_rules(
    customer_id: Optional[int] = None,
    industry_type: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """分類ルール一覧取得"""
    statement = select(ClassificationRule)

    if customer_id is not None:
        statement = statement.where(ClassificationRule.customer_id == customer_id)

    if industry_type is not None:
        statement = statement.where(ClassificationRule.industry_type == industry_type)

    if status is not None:
        statement = statement.where(ClassificationRule.status == status)

    return session.exec(statement).all()


@router.get("/{rule_id}", response_model=ClassificationRule)
def get_classification_rule(
    rule_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """分類ルール詳細取得"""
    rule = session.get(ClassificationRule, rule_id)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="分類ルールが見つかりません"
        )
    return rule


@router.post("/", response_model=ClassificationRule, status_code=status.HTTP_201_CREATED)
def create_classification_rule(
    rule: ClassificationRule,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """分類ルール作成(ADMINのみ)"""
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="権限がありません"
        )

    session.add(rule)
    session.commit()
    session.refresh(rule)
    return rule


@router.put("/{rule_id}", response_model=ClassificationRule)
def update_classification_rule(
    rule_id: int,
    rule: ClassificationRule,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """分類ルール更新(ADMINのみ)"""
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="権限がありません"
        )

    db_rule = session.get(ClassificationRule, rule_id)
    if not db_rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="分類ルールが見つかりません"
        )

    rule_data = rule.dict(exclude_unset=True)
    for key, value in rule_data.items():
        setattr(db_rule, key, value)

    session.add(db_rule)
    session.commit()
    session.refresh(db_rule)
    return db_rule


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_classification_rule(
    rule_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """分類ルール削除(ADMINのみ)"""
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="権限がありません"
        )

    rule = session.get(ClassificationRule, rule_id)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="分類ルールが見つかりません"
        )

    session.delete(rule)
    session.commit()
    return None


@router.post("/apply", status_code=status.HTTP_202_ACCEPTED)
def apply_classification_rules(
    customer_id: Optional[int] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    ocr_result_ids: Optional[List[int]] = None,
    overwrite: bool = False,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """分類ルールの一括適用(ADMINのみ)"""
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="権限がありません"
        )

    # TODO: 実際のルール適用ロジックを実装
    # ここでは非同期タスクを作成して返す

    return {
        "taskId": "task-uuid-12345",
        "status": "QUEUED",
        "totalRecords": 0,
        "processedRecords": 0,
        "updatedRecords": 0
    }
