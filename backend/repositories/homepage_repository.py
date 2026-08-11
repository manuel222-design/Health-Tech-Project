from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from models import Article, ArticleStatus, Category


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
