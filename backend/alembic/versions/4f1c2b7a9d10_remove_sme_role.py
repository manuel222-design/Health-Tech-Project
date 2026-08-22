"""Remove SME role and finalize three-role authorization model.

Revision ID: 4f1c2b7a9d10
Revises: 37e8e015e15c
"""

from typing import Sequence, Union

from alembic import op


revision: str = "4f1c2b7a9d10"
down_revision: Union[str, Sequence[str], None] = "37e8e015e15c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Finalize the authorization model as:
        viewer
        editor
        admin

    Fresh installations already create the final enum, so there is
    no SME value to migrate here.
    """
    pass


def downgrade() -> None:
    """
    No automatic downgrade.

    Reintroducing SME safely would require recreating the PostgreSQL
    enum and deliberately migrating existing data.
    """
    pass
