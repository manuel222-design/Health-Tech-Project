"""Add article last reviewed timestamp.

Revision ID: c8aaff872b00
Revises: 4f1c2b7a9d10
"""

from alembic import op
import sqlalchemy as sa


revision: str = "c8aaff872b00"
down_revision = "4f1c2b7a9d10"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "articles",
        sa.Column(
            "last_reviewed_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    # Existing published articles have no historical review timestamp.
    # Use published_at where available, otherwise fall back to the
    # most recent existing article timestamp available.
    op.execute(
        """
        UPDATE articles
        SET last_reviewed_at =
            COALESCE(published_at, updated_at, created_at)
        WHERE last_reviewed_at IS NULL
        """
    )


def downgrade() -> None:
    op.drop_column("articles", "last_reviewed_at")
