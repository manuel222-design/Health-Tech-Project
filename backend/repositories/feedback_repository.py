from sqlalchemy.orm import Session
from sqlalchemy import func

from models import Article, ArticleFeedback


class FeedbackRepository:
    """Data access layer for ArticleFeedback persistence operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_article_by_slug(self, slug: str):
        return (
            self.db.query(Article)
            .filter(Article.slug == slug)
            .first()
        )

    def save(self, feedback):
        self.db.add(feedback)
        self.db.commit()
        self.db.refresh(feedback)
        return feedback

    def get_summary(self, article_id):
        return (
            self.db.query(
                func.avg(ArticleFeedback.rating),
                func.count(ArticleFeedback.id)
            )
            .filter(ArticleFeedback.article_id == article_id)
            .first()
        )
