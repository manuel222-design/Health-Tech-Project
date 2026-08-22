from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text(
        "ALTER TYPE articlestatus ADD VALUE IF NOT EXISTS 'pending_review'"
    ))
    conn.execute(text(
        "ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'sme'"
    ))
    conn.commit()

print("Enums updated!")
