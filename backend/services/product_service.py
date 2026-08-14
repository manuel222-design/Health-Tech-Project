import uuid

from repositories.product_repository import ProductRepository


class ProductService:
    """Business logic for product operations."""

    def __init__(self, repository: ProductRepository):
        self.repository = repository

    def get_products(self):
        products = self.repository.get_all()

        return [
            {
                "id": str(product.id),
                "name": product.name,
                "slug": product.slug,
                "description": product.description,
                "version": product.version,
                "icon": product.icon,
                "article_count": article_count,
            }
            for product, article_count in products
        ]

    def get_product_details(self, slug: str):
        result = self.repository.get_by_slug_with_articles(slug)

        if not result:
            return None

        product, articles = result

        return {
            "id": str(product.id),
            "name": product.name,
            "slug": product.slug,
            "description": product.description,
            "version": product.version,
            "icon": product.icon,
            "article_count": len(articles),
            "articles": [
                {
                    "id": str(article.id),
                    "title": article.title,
                    "slug": article.slug,
                    "status": article.status.value,
                    "content_type": article.content_type.value,
                    "product_version": article.product_version,
                    "created_at": (
                        article.created_at.isoformat()
                        if article.created_at
                        else None
                    ),
                }
                for article in articles
            ],
        }

    def create_product(
        self,
        name: str,
        description: str | None = None,
        version: str | None = None,
        icon: str | None = None,
    ):
        name = name.strip()

        if not name:
            raise ValueError("Product name cannot be empty")

        slug = name.lower().replace(" ", "-")

        existing = self.repository.get_by_slug(slug)

        if existing:
            return {
                "id": str(existing.id),
                "name": existing.name,
                "slug": existing.slug,
                "description": existing.description,
                "version": existing.version,
                "icon": existing.icon,
            }

        from models import Product

        product = Product(
            id=uuid.uuid4(),
            name=name,
            slug=slug,
            description=description,
            version=version,
            icon=icon,
            is_active=True,
            sort_order=0,
        )

        product = self.repository.save(product)

        return {
            "id": str(product.id),
            "name": product.name,
            "slug": product.slug,
            "description": product.description,
            "version": product.version,
            "icon": product.icon,
        }
