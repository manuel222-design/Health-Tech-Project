"""remove icon field from categories

Revision ID: 22f30a6ad408
Revises: d8773e1ca493
Create Date: 2026-08-10 16:51:00.619315

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '22f30a6ad408'
down_revision: Union[str, Sequence[str], None] = 'd8773e1ca493'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('categories', 'icon')


def downgrade() -> None:
    op.add_column(
        'categories',
        sa.Column('icon', sa.String(length=50), nullable=True)
    )
