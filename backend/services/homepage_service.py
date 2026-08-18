from repositories.homepage_repository import HomepageRepository


class HomepageService:
    """Business logic for homepage content."""

    def __init__(self, repository: HomepageRepository):
        self.repository = repository

    def get_homepage(self):
        articles = self.repository.get_featured_articles()
        categories = self.repository.get_categories_with_counts()

        today_activity = self.repository.get_today_activity()

        return {
            "featured_articles": [
                {
                    "id": str(article.id),
                    "title": article.title,
                    "slug": article.slug,
                    "category_id": (
                        str(article.category_id)
                        if article.category_id
                        else None
                    ),
                    "content_type": (
                        article.content_type.value
                        if article.content_type
                        else None
                    ),
                    "view_count": article.view_count,
                    "published_at": (
                        str(article.published_at)
                        if article.published_at
                        else None
                    ),
                }
                for article in articles
            ],
            "categories": [
                {
                    "id": str(category.id),
                    "name": category.name,
                    "slug": category.slug,
                    "description": category.description,
                    "article_count": article_count,
                }
                for category, article_count in categories
            ],
            "today_activity": today_activity,
        }
