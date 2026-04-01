from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.db import get_session
from app.core.dependencies import get_current_active_user
from app.models.account_subject import AccountSubject
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[AccountSubject])
def list_account_subjects(
    customer_id: Optional[int] = None,
    industry_type: Optional[str] = None,
    subject_type: Optional[str] = None,
    status: Optional[str] = None,
    include_common: bool = True,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """勘定科目一覧取得"""
    statement = select(AccountSubject)

    if customer_id is not None:
        statement = statement.where(AccountSubject.customer_id == customer_id)
    elif include_common:
        # 共通科目(customer_idがNULL)も含める
        pass

    if industry_type is not None:
        statement = statement.where(AccountSubject.industry_type == industry_type)

    if subject_type is not None:
        statement = statement.where(AccountSubject.subject_type == subject_type)

    if status is not None:
        statement = statement.where(AccountSubject.status == status)

    return session.exec(statement).all()


@router.get("/{subject_id}", response_model=AccountSubject)
def get_account_subject(
    subject_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """勘定科目詳細取得"""
    subject = session.get(AccountSubject, subject_id)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="勘定科目が見つかりません"
        )
    return subject


@router.post("/", response_model=AccountSubject, status_code=status.HTTP_201_CREATED)
def create_account_subject(
    subject: AccountSubject,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """勘定科目作成(ADMINのみ)"""
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="権限がありません"
        )

    session.add(subject)
    session.commit()
    session.refresh(subject)
    return subject


@router.put("/{subject_id}", response_model=AccountSubject)
def update_account_subject(
    subject_id: int,
    subject: AccountSubject,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """勘定科目更新(ADMINのみ)"""
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="権限がありません"
        )

    db_subject = session.get(AccountSubject, subject_id)
    if not db_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="勘定科目が見つかりません"
        )

    subject_data = subject.dict(exclude_unset=True)
    for key, value in subject_data.items():
        setattr(db_subject, key, value)

    session.add(db_subject)
    session.commit()
    session.refresh(db_subject)
    return db_subject


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account_subject(
    subject_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """勘定科目削除(ADMINのみ)"""
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="権限がありません"
        )

    subject = session.get(AccountSubject, subject_id)
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="勘定科目が見つかりません"
        )

    session.delete(subject)
    session.commit()
    return None
