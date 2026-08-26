from sqlalchemy.orm import Session

from models import SupportRequest, User


class SupportRepository:
    """Data access layer for support requests."""

    def __init__(self, db: Session):
        self.db = db

    def save(self, request):
        self.db.add(request)
        self.db.commit()
        self.db.refresh(request)
        return request

    def get_by_id(self, request_id):
        return (
            self.db.query(SupportRequest)
            .filter(SupportRequest.id == request_id)
            .first()
        )

    def list_all(self, limit=200):
        return (
            self.db.query(SupportRequest)
            .order_by(SupportRequest.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_request_with_user(self, request_id):
        return (
            self.db.query(SupportRequest)
            .join(User, User.id == SupportRequest.user_id)
            .filter(SupportRequest.id == request_id)
            .first()
        )
