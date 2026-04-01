from sqlmodel import SQLModel, create_engine, Session, select
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User

engine = create_engine(settings.sqlalchemy_database_url, echo=False)


def init_db():
    from app.models import (
        customer, file, ocr_result, account_subject, classification_rule,
        audit_log, export_log, export_template, ocr_task
    )

    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        statement = select(User).where(User.email == "admin@example.com")
        existing = session.exec(statement).first()
        if not existing:
            user = User(
                name="管理者",
                email="admin@example.com",
                role="ADMIN",
                status="ACTIVE",
                password_hash=get_password_hash("password123"),
            )
            session.add(user)
            session.commit()


def get_session():
    with Session(engine) as session:
        yield session
