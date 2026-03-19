"""
One-time migration to add tracking_id field to product_orders table.
This replaces the email + tracking_password system with secure tracking IDs.

Run: python migrate_tracking_id.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine
from sqlalchemy import text


def migrate():
    with engine.connect() as conn:
        print("Starting tracking_id migration...")

        # Step 1: Add tracking_id column as nullable initially
        print("Adding tracking_id column...")
        conn.execute(
            text("ALTER TABLE product_orders ADD COLUMN IF NOT EXISTS tracking_id VARCHAR")
        )

        # Step 2: Generate tracking IDs for existing orders
        print("Generating tracking IDs for existing orders...")
        result = conn.execute(text("""
            UPDATE product_orders
            SET tracking_id = 'TRK-' || UPPER(SUBSTR(md5(random()::text || id::text), 1, 6))
            WHERE tracking_id IS NULL
        """))
        print(f"Updated {result.rowcount} existing orders with tracking IDs")

        # Step 3: Drop tracking_password column if it exists
        print("Removing tracking_password column...")
        conn.execute(text("""
            ALTER TABLE product_orders DROP COLUMN IF EXISTS tracking_password
        """))

        # Step 4: Add constraints and make NOT NULL
        print("Adding constraints and indexes...")
        conn.execute(
            text("ALTER TABLE product_orders ALTER COLUMN tracking_id SET NOT NULL")
        )

        # Step 5: Add unique constraint (check if exists first)
        conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint
                    WHERE conname = 'unique_tracking_id'
                ) THEN
                    ALTER TABLE product_orders ADD CONSTRAINT unique_tracking_id UNIQUE (tracking_id);
                END IF;
            END $$;
        """))

        # Step 6: Add index for performance (if not already exists from unique constraint)
        conn.execute(
            text("CREATE INDEX IF NOT EXISTS idx_product_orders_tracking_id ON product_orders(tracking_id)")
        )

        # Commit all changes
        conn.commit()

    print("Migration complete!")
    print("- tracking_id column added to product_orders table")
    print("- tracking_password column removed")
    print("- Existing orders populated with random tracking IDs")
    print("- Unique constraint and index added")
    print("- Ready for tracking ID-only system")


if __name__ == "__main__":
    migrate()