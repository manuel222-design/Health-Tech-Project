import uuid

from repositories.category_repository import CategoryRepository


class CategoryService:
    """Business logic for category operations."""

    def __init__(self, repository: CategoryRepository):
        self.repository = repository

    def get_categories(self):
        categories = self.repository.get_all()

        return [
            {
                "id": str(category.id),
            "name": category.name,
            "slug": category.slug,
            "description": category.description,
            "article_count": article_count,
        }
        for category, article_count in categories
        ]

    def create_category(self, name: str, description: str | None = None):
        name = name.strip()

        if not name:
            raise ValueError("Category name cannot be empty")

        slug = name.lower().replace(" ", "-")

        existing = self.repository.get_by_slug(slug)

        if existing:
            return {
                "id": str(existing.id),
                "name": existing.name,
                "slug": existing.slug,
                "description": existing.description,
            }

        from models import Category

        category = Category(
            id=uuid.uuid4(),
            name=name,
            slug=slug,
            description=description,
            sort_order=0,
        )

        category = self.repository.save(category)

        return {
            "id": str(category.id),
            "name": category.name,
            "slug": category.slug,
            "description": category.description,
        }
