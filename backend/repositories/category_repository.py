from sqlalchemy.orm import Session

from models import Category


class CategoryRepository:
    """Data access layer for Category persistence operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return (
            self.db.query(Category)
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
