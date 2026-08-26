from datetime import datetime, timezone
import uuid

from models import SupportRequest
from repositories.support_repository import SupportRepository


ALLOWED_CATEGORIES = {
    "Account & Login",
    "Technical Issue",
    "Knowledge Base",
    "AI Assistant",
    "Other",
}

ALLOWED_STATUSES = {
    "open",
    "in_progress",
    "resolved",
}


class SupportService:
    """Business logic for support requests."""

    def __init__(self, repository: SupportRepository):
        self.repository = repository

    def create_request(
        self,
        user_id: str,
        subject: str,
        category: str,
        message: str,
    ):
        subject = subject.strip()
        category = category.strip()
        message = message.strip()

        if len(subject) < 3:
            raise ValueError("Subject must be at least 3 characters long.")

        if len(subject) > 180:
            raise ValueError("Subject is too long.")

        if category not in ALLOWED_CATEGORIES:
            raise ValueError("Invalid support category.")

        if len(message) < 10:
            raise ValueError("Please provide at least 10 characters describing the issue.")

        if len(message) > 5000:
            raise ValueError("Support message is too long.")

        request = SupportRequest(
            id=uuid.uuid4(),
            user_id=user_id,
            subject=subject,
            category=category,
            message=message,
            status="open",
            priority="normal",
        )

        saved = self.repository.save(request)

        return {
            "id": str(saved.id),
            "message": "Support request submitted successfully.",
            "status": saved.status,
        }

    def list_requests(self, limit=200):
        items = self.repository.list_all(limit=limit)

        return [
            {
                "id": str(item.id),
                "subject": item.subject,
                "category": item.category,
                "message": item.message,
                "status": item.status,
                "priority": item.priority,
                "created_at": (
                    item.created_at.isoformat()
                    if item.created_at
                    else None
                ),
                "updated_at": (
                    item.updated_at.isoformat()
                    if item.updated_at
                    else None
                ),
                "resolved_at": (
                    item.resolved_at.isoformat()
                    if item.resolved_at
                    else None
                ),
                "requester": {
                    "id": str(item.user.id) if item.user else None,
                    "username": item.user.username if item.user else "Unknown",
                    "email": item.user.email if item.user else "",
                    "department": item.user.department if item.user else None,
                },
            }
            for item in items
        ]

    def update_status(self, request_id: str, status: str):
        if status not in ALLOWED_STATUSES:
            raise ValueError("Invalid support request status.")

        request = self.repository.get_by_id(request_id)

        if not request:
            raise LookupError("Support request not found.")

        request.status = status

        if status == "resolved":
            request.resolved_at = datetime.now(timezone.utc)
        else:
            request.resolved_at = None

        self.repository.db.commit()
        self.repository.db.refresh(request)

        return {
            "id": str(request.id),
            "status": request.status,
            "message": "Support request status updated successfully.",
        }
