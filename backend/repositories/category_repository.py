from sqlalchemy import func
from sqlalchemy.orm import Session

from models import Article, Category


class CategoryRepository:
    """Data access layer for Category persistence operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return (
            self.db.query(
                Category,
                func.count(Article.id).label("article_count")
            )
            .outerjoin(
                Article,
                Article.category_id == Category.id
            )
            .group_by(Category.id)
            .order_by(Category.sort_order)
            .all()
        )

    def get_by_slug(self, slug: str):
        return (
            self.db.query(Category)
            .filter(Category.slug == slug)
            .first()
        )

    def save(self, category):
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category
