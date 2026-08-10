from sqlalchemy.orm import Session

from models import Tag


class TagRepository:
    """Data access layer for Tag persistence operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return (
            self.db.query(Tag)
            .order_by(Tag.name)
            .all()
        )

    def get_by_slug(self, slug: str):
        return (
            self.db.query(Tag)
            .filter(Tag.slug == slug)
            .first()
        )

    def save(self, tag):
        self.db.add(tag)
        self.db.commit()
        self.db.refresh(tag)
        return tag
