from sqlalchemy.orm import Session

from models import ArticleSMEReview


class SMEReviewRepository:
    """Data access layer for SME article reviews."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, review: ArticleSMEReview):
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        return review

    def get_for_article(self, article_id):
        return (
            self.db.query(ArticleSMEReview)
            .filter(ArticleSMEReview.article_id == article_id)
            .order_by(ArticleSMEReview.reviewed_at.desc())
            .all()
        )
