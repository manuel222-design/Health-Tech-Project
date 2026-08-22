from repositories.dashboard_repository import DashboardRepository


class DashboardService:
    """Business logic for admin dashboard statistics."""

    def __init__(self, repository: DashboardRepository):
        self.repository = repository

    def get_dashboard_stats(self):
        article_counts = self.repository.get_article_counts()
        user_counts = self.repository.get_user_counts()
        category_count = self.repository.get_category_count()
        feedback_stats = self.repository.get_feedback_stats()

        return {
            "articles": {
                "total": sum(article_counts.values()),
                "draft": article_counts.get("draft", 0),
                "pending_review": article_counts.get(
                    "pending_review",
                    0,
                ),
                "published": article_counts.get("published", 0),
                "archived": article_counts.get("archived", 0),
            },
            "users": user_counts,
            "categories": {
                "total": category_count,
            },
            "feedback": feedback_stats,
        }
