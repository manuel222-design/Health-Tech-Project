from sqlalchemy.orm import Session

from models import User


class UserRepository:
    """Data access layer for User persistence operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str):
        return (
            self.db.query(User)
            .filter(User.email == email)
            .first()
        )

    def save(self, user):
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
