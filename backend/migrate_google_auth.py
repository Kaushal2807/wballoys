"""
One-time migration to support Google Auth.
Run: python migrate_google_auth.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine
from sqlalchemy import text


def migrate():
    with engine.connect() as conn:
        # Make password_hash nullable
        conn.execute(
            text("ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL")
        )
        # Add auth_provider column with default 'local'
        conn.execute(
            text(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR NOT NULL DEFAULT 'local'"
            )
        )
        conn.commit()
    print("Migration complete: password_hash is now nullable, auth_provider column added.")


if __name__ == "__main__":
    migrate()
