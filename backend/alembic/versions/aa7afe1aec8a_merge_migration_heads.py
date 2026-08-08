"""merge migration heads

Revision ID: aa7afe1aec8a
Revises: 59bdb6e4fd25, 8b597c4e3bcb
Create Date: 2026-08-08 17:45:38.870918

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aa7afe1aec8a'
down_revision: Union[str, Sequence[str], None] = ('59bdb6e4fd25', '8b597c4e3bcb')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
