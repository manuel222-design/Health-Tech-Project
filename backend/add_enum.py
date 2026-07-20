
from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TYPE articlestatus ADD VALUE IF NOT EXISTS 'pending_review'"))
    conn.commit()

print("Enum updated!")