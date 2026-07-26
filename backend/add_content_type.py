
from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("""
        DO $$ BEGIN
            CREATE TYPE contenttype AS ENUM (
                'how_to', 'sop', 'faq',
                'feature_reference', 'troubleshooting', 'release_notes'
            );
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
    """))
    conn.execute(text("""
        ALTER TABLE articles
        ADD COLUMN IF NOT EXISTS content_type contenttype DEFAULT 'how_to'
    """))
    conn.commit()

print("content_type column added!")