from fastapi import HTTPException

from models import Article, ArticleSMEReview, ArticleStatus
from repositories.sme_review_repository import SMEReviewRepository


class SMEReviewService:
    """Business logic for SME article review and sign-off."""

    def __init__(self, repository: SMEReviewRepository):
        self.repository = repository

    def submit_review(
        self,
        article: Article,
        reviewer: dict,
        decision: str,
        comments: str | None = None,
    ):
        if reviewer["role"] != "sme":
            raise HTTPException(
                status_code=403,
                detail="Only SME users can review articles"
            )

        if article.status != ArticleStatus.pending_review:
            raise HTTPException(
                status_code=400,
                detail="Article is not pending SME review"
            )

        if decision not in ["approved", "rejected"]:
            raise HTTPException(
                status_code=400,
                detail="Decision must be approved or rejected"
            )

        review = ArticleSMEReview(
            article_id=article.id,
            reviewer_id=reviewer["user_id"],
            decision=decision,
            comments=comments,
        )

        self.repository.create(review)

        if decision == "approved":
            article.status = ArticleStatus.published
        else:
            article.status = ArticleStatus.draft

        self.repository.db.commit()

        return review
