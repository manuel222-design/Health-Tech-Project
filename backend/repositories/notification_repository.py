from sqlalchemy.orm import Session
from sqlalchemy import func

from models import Article, ArticleFeedback


class NotificationRepository:
    """Data access layer for low-rated article notifications."""

    def __init__(self, db: Session):
        self.db = db

    def get_low_rated_articles_by_author(self, user_id: str):
        return (
            self.db.query(
                Article.title,
                Article.slug,
                func.avg(ArticleFeedback.rating).label("avg_rating"),
                func.count(ArticleFeedback.id).label("rating_count")
            )
            .join(
                ArticleFeedback,
                ArticleFeedback.article_id == Article.id
            )
            .filter(Article.author_id == user_id)
            .group_by(Article.id)
            .having(func.avg(ArticleFeedback.rating) <= 2)
            .all()
        )
