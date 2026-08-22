from sqlalchemy.orm import Session

from models import Article, ArticleStatus, ArticleTag


class ArticleRepository:
    """Data access layer for Article persistence operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_published_by_slug(self, slug: str):
        return (
            self.db.query(Article)
            .filter(
                Article.slug == slug,
                Article.status == ArticleStatus.published
            )
            .first()
        )

    def get_tag_links(self, article_id):
        return (
            self.db.query(ArticleTag)
            .filter(ArticleTag.article_id == article_id)
            .all()
        )

    def save(self):
        self.db.commit()

    def refresh(self, article):
        self.db.refresh(article)
