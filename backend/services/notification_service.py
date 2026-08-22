from repositories.notification_repository import NotificationRepository


class NotificationService:
    """Business logic for notification operations."""

    def __init__(self, repository: NotificationRepository):
        self.repository = repository

    def get_my_notifications(self, user_id: str):
        results = self.repository.get_low_rated_articles_by_author(user_id)

        return [
            {
                "title": title,
                "slug": slug,
                "avg_rating": round(float(avg_rating), 1),
                "rating_count": rating_count
            }
            for title, slug, avg_rating, rating_count in results
        ]
