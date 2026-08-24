from fastapi import HTTPException

from repositories.article_repository import ArticleRepository


class ArticleService:
    """Business logic for article operations."""

    def __init__(self, repository: ArticleRepository):
        self.repository = repository

    def get_published_article(self, slug: str):
        article = self.repository.get_published_by_slug(slug)

        if not article:
            raise HTTPException(
                status_code=404,
                detail="Article not found"
            )

        article.view_count += 1
        self.repository.save()

        tag_links = self.repository.get_tag_links(article.id)
        tag_ids = [str(link.tag_id) for link in tag_links]

        return {
            "id": str(article.id),
            "title": article.title,
            "slug": article.slug,
            "body_markdown": article.body_markdown,
            "status": article.status.value,
            "category_id": (
                str(article.category_id)
                if article.category_id
                else None
            ),
            "content_type": (
                article.content_type.value
                if article.content_type
                else "how_to"
            ),
            "product_version": article.product_version,
            "tag_ids": tag_ids,
            "view_count": article.view_count,
            "created_at": str(article.created_at),
        }

