import uuid

from repositories.feedback_repository import FeedbackRepository
from models import ArticleFeedback


class FeedbackService:
    """Business logic for article feedback operations."""

    def __init__(self, repository: FeedbackRepository):
        self.repository = repository

    def submit_feedback(self, slug: str, rating: int, comment: str | None = None):
        if rating < 1 or rating > 5:
            raise ValueError("Rating must be between 1 and 5")

        article = self.repository.get_article_by_slug(slug)

        if not article:
            raise LookupError("Article not found")

        feedback = ArticleFeedback(
            id=uuid.uuid4(),
            article_id=article.id,
            rating=rating,
            comment=comment
        )

        self.repository.save(feedback)

        return {"message": "Feedback submitted successfully"}

    def get_feedback_summary(self, slug: str):
        article = self.repository.get_article_by_slug(slug)

        if not article:
            raise LookupError("Article not found")

        avg_rating, count = self.repository.get_summary(article.id)

        return {
            "average_rating": round(float(avg_rating), 1) if avg_rating else None,
            "total_ratings": count
        }
