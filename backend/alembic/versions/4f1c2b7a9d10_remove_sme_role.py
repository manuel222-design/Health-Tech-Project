"""Remove SME role and migrate SME users to Editor.

Revision ID: 4f1c2b7a9d10
Revises: 37e8e015e15c
"""

from alembic import op


revision = "4f1c2b7a9d10"
down_revision = "37e8e015e15c"
branch_labels = None
depends_on = None


def upgrade():
    # Migrate the existing SME account(s) to Editor before changing
    # the PostgreSQL enum definition.
    op.execute(
        """
        UPDATE users
        SET role = 'editor'
        WHERE role = 'sme'
        """
    )

    # PostgreSQL enums do not safely support removing an existing value
    # directly. Recreate the enum without the SME value.
    op.execute("ALTER TYPE userrole RENAME TO userrole_old")

    op.execute(
        """
        CREATE TYPE userrole AS ENUM (
            'viewer',
            'editor',
            'admin'
        )
        """
    )

    op.execute(
        """
        ALTER TABLE users
        ALTER COLUMN role TYPE userrole
        USING role::text::userrole
        """
    )

    op.execute("DROP TYPE userrole_old")


def downgrade():
    op.execute("ALTER TYPE userrole RENAME TO userrole_new")

    op.execute(
        """
        CREATE TYPE userrole AS ENUM (
            'viewer',
            'editor',
            'admin',
            'sme'
        )
        """
    )

    op.execute(
        """
        ALTER TABLE users
        ALTER COLUMN role TYPE userrole
        USING role::text::userrole
        """
    )

    op.execute("DROP TYPE userrole_new")
