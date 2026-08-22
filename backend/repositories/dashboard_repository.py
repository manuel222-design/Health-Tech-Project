from sqlalchemy import func
from sqlalchemy.orm import Session

from models import (
    Article,
    ArticleFeedback,
    ArticleStatus,
    Category,
    User,
)


class DashboardRepository:
    """Data access layer for admin dashboard statistics."""

    def __init__(self, db: Session):
        self.db = db

    def get_article_counts(self):
        rows = (
            self.db.query(
                Article.status,
                func.count(Article.id),
            )
            .group_by(Article.status)
            .all()
        )

        return {status.value: count for status, count in rows}

    def get_user_counts(self):
        total = self.db.query(User).count()
        active = (
            self.db.query(User)
            .filter(User.is_active.is_(True))
            .count()
        )

        return {
            "total": total,
            "active": active,
            "inactive": total - active,
        }

    def get_category_count(self):
        return self.db.query(Category).count()

    def get_feedback_stats(self):
        total = self.db.query(ArticleFeedback).count()

        average = self.db.query(
            func.avg(ArticleFeedback.rating)
        ).scalar()

        return {
            "total": total,
            "average_rating": (
                round(float(average), 1)
                if average is not None
                else None
            ),
        }
