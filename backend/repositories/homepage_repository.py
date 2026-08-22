from sqlalchemy import desc, func
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from models import (
    Article,
    ArticleStatus,
    AuditLog,
    Category,
    SearchLog,
)


class HomepageRepository:
    """Data access layer for homepage content."""

    def __init__(self, db: Session):
        self.db = db

    def get_featured_articles(self, limit: int = 5):
        return (
            self.db.query(Article)
            .filter(Article.status == ArticleStatus.published)
            .order_by(
                desc(Article.published_at),
                desc(Article.created_at),
            )
            .limit(limit)
            .all()
        )

    def get_categories_with_counts(self):
        return (
            self.db.query(
                Category,
                func.count(Article.id).label("article_count"),
            )
            .outerjoin(
                Article,
                (Article.category_id == Category.id)
                & (Article.status == ArticleStatus.published),
            )
            .group_by(Category.id)
            .order_by(Category.sort_order, Category.name)
            .all()
        )

    def get_today_activity(self):
        """Return timestamped activity totals for the current UTC day."""

        now = datetime.now(timezone.utc)
        start_of_day = now.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        searches = (
            self.db.query(func.count(SearchLog.id))
            .filter(SearchLog.searched_at >= start_of_day)
            .scalar()
            or 0
        )

        published_guides = (
            self.db.query(func.count(Article.id))
            .filter(
                Article.status == ArticleStatus.published,
                Article.published_at >= start_of_day,
            )
            .scalar()
            or 0
        )

        system_actions = (
            self.db.query(func.count(AuditLog.id))
            .filter(AuditLog.created_at >= start_of_day)
            .scalar()
            or 0
        )

        return {
            "searches": searches,
            "published_guides": published_guides,
            "system_actions": system_actions,
        }

