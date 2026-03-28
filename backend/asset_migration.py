#!/usr/bin/env python3
"""
Asset Migration Script - Allow Shared Assets
=============================================

Makes customer_id nullable in assets table to support shared assets.

Usage:
    python asset_migration.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging
from sqlalchemy import text
from app.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def alter_assets_table():
    """Alter assets table to make customer_id nullable."""
    try:
        logger.info("Altering assets table to allow NULL customer_id...")

        with engine.connect() as connection:
            # Make customer_id nullable (allows shared assets)
            connection.execute(text(
                "ALTER TABLE assets ALTER COLUMN customer_id DROP NOT NULL"
            ))
            connection.commit()

        logger.info("✅ Assets table altered successfully!")
        return True
    except Exception as e:
        logger.error(f"Error altering assets table: {e}")
        return False

def verify_migration():
    """Verify the migration was successful."""
    try:
        logger.info("Verifying migration...")

        with engine.connect() as connection:
            # Check if customer_id is now nullable
            result = connection.execute(text("""
                SELECT is_nullable
                FROM information_schema.columns
                WHERE table_name = 'assets'
                AND column_name = 'customer_id'
            """))
            is_nullable = result.scalar()
            logger.info(f"customer_id is_nullable: {is_nullable}")

        return is_nullable == 'YES'
    except Exception as e:
        logger.error(f"Error verifying migration: {e}")
        return False

def main():
    """Run the migration."""
    logger.info("Starting asset migration...")

    try:
        if not alter_assets_table():
            logger.error("Failed to alter assets table")
            return False

        if not verify_migration():
            logger.error("Migration verification failed")
            return False

        logger.info("✅ Asset migration completed successfully!")
        return True

    except Exception as e:
        logger.error(f"Migration failed: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
