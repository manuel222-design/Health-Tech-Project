import uuid

from repositories.tag_repository import TagRepository


class TagService:
    """Business logic for tag operations."""

    def __init__(self, repository: TagRepository):
        self.repository = repository

    def get_tags(self):
        tags = self.repository.get_all()

        return [
            {
                "id": str(t.id),
                "name": t.name,
                "slug": t.slug,
                "color_hex": t.color_hex,
            }
            for t in tags
        ]

    def create_tag(self, name: str):
        name = name.strip()

        if not name:
            raise ValueError("Tag name cannot be empty")

        slug = name.lower().replace(" ", "-")

        existing = self.repository.get_by_slug(slug)

        if existing:
            return {
                "id": str(existing.id),
                "name": existing.name,
                "slug": existing.slug,
                "color_hex": existing.color_hex,
            }

        from models import Tag

        tag = Tag(
            id=uuid.uuid4(),
            name=name,
            slug=slug,
            color_hex="#6B7280",
        )

        tag = self.repository.save(tag)

        return {
            "id": str(tag.id),
            "name": tag.name,
            "slug": tag.slug,
            "color_hex": tag.color_hex,
        }
