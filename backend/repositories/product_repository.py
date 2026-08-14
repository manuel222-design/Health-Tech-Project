from sqlalchemy import func
from sqlalchemy.orm import Session

from models import Article, Product


class ProductRepository:
    """Data access layer for Product persistence operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return (
            self.db.query(
                Product,
                func.count(Article.id).label("article_count")
            )
            .outerjoin(
                Article,
                Article.product_id == Product.id
            )
            .filter(Product.is_active == True)
            .group_by(Product.id)
            .order_by(Product.sort_order, Product.name)
            .all()
        )

    def get_by_slug(self, slug: str):
        return (
            self.db.query(Product)
            .filter(Product.slug == slug)
            .first()
        )
    
    def get_by_slug_with_articles(self, slug: str):
        product = (
            self.db.query(Product)
            .filter(
                Product.slug == slug,
                Product.is_active == True
            )
            .first()
        )

        if not product:
            return None

        articles = (
            self.db.query(Article)
            .filter(Article.product_id == product.id)
            .order_by(Article.created_at.desc())
            .all()
        )

        return product, articles

    def save(self, product):
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product
