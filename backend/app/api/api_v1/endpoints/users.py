from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.db import get_session
from app.core.dependencies import get_current_active_user
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.auth import UserCreate, UserRead

router = APIRouter()


def require_admin(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="管理者権限が必要です")
    return current_user


@router.get("/", response_model=list[UserRead])
def list_users(
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    statement = select(User).where(User.status == "ACTIVE")
    users = session.exec(statement).all()
    return users


@router.post("/", response_model=UserRead)
def create_user(
    user_in: UserCreate,
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    statement = select(User).where(User.email == user_in.email)
    existing = session.exec(statement).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(
        name=user_in.name,
        email=user_in.email,
        role=user_in.role,
        status="ACTIVE",
        password_hash=get_password_hash(user_in.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    user_in: UserCreate,
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.name = user_in.name
    user.email = user_in.email
    user.role = user_in.role
    user.password_hash = get_password_hash(user_in.password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    session: Session = Depends(get_session),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.status = "INACTIVE"
    session.add(user)
    session.commit()
    return {"detail": "User deactivated"}
