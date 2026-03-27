#!/usr/bin/env python3
"""
Safety Feature Migration Script
===============================

This script applies the database changes needed for safety functionality.
It can be run on existing databases to add safety tables and fields.

Usage:
    python safety_migration.py

Requirements:
    - Run from the backend directory
    - Database connection must be available
    - Ensure all models are imported properly
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging
from sqlalchemy import text
from app.database import engine, Base
from app.models.service_request import SafetyParameter, SafetyChecklistItem, JobPhoto
from app.models.user import User

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_safety_tables():
    """Create safety-related tables using SQLAlchemy models."""
    try:
        logger.info("Creating safety tables...")

        # Create all tables (will only create missing ones)
        Base.metadata.create_all(bind=engine)

        logger.info("Safety tables created successfully!")
        return True
    except Exception as e:
        logger.error(f"Error creating safety tables: {e}")
        return False

def add_safety_columns():
    """Add safety columns to existing job_photos table."""
    try:
        logger.info("Adding safety columns to job_photos table...")

        with engine.connect() as connection:
            # Add safety columns if they don't exist
            safety_columns = [
                "ALTER TABLE job_photos ADD COLUMN IF NOT EXISTS safety_category VARCHAR",
                "ALTER TABLE job_photos ADD COLUMN IF NOT EXISTS safety_notes TEXT",
                "ALTER TABLE job_photos ADD COLUMN IF NOT EXISTS file_id INTEGER"
            ]

            for sql in safety_columns:
                connection.execute(text(sql))
                logger.info(f"Executed: {sql}")

            connection.commit()

        logger.info("Safety columns added successfully!")
        return True
    except Exception as e:
        logger.error(f"Error adding safety columns: {e}")
        return False

def insert_default_safety_parameters():
    """Insert default safety parameters."""
    try:
        logger.info("Inserting default safety parameters...")

        default_parameters = [
            # Personal Protection Equipment
            {"name": "Hard hat/helmet properly fitted", "category": "personal_protection", "is_required": True, "order_index": 1},
            {"name": "Safety glasses/goggles worn", "category": "personal_protection", "is_required": True, "order_index": 2},
            {"name": "Appropriate work boots worn", "category": "personal_protection", "is_required": True, "order_index": 3},
            {"name": "High-visibility clothing if required", "category": "personal_protection", "is_required": False, "order_index": 4},

            # Site Safety
            {"name": "Work area hazards identified", "category": "site_safety", "is_required": True, "order_index": 10},
            {"name": "Emergency exits located", "category": "site_safety", "is_required": True, "order_index": 11},
            {"name": "First aid location identified", "category": "site_safety", "is_required": True, "order_index": 12},
            {"name": "Site-specific safety briefing completed", "category": "site_safety", "is_required": False, "order_index": 13},

            # Equipment Safety
            {"name": "Tools inspected before use", "category": "equipment_safety", "is_required": True, "order_index": 20},
            {"name": "Equipment lockout/tagout verified", "category": "equipment_safety", "is_required": True, "order_index": 21},
            {"name": "Electrical hazards assessed", "category": "equipment_safety", "is_required": True, "order_index": 22},

            # Emergency Procedures
            {"name": "Emergency contact numbers available", "category": "emergency_procedures", "is_required": True, "order_index": 30},
            {"name": "Evacuation procedures understood", "category": "emergency_procedures", "is_required": False, "order_index": 31},
        ]

        with engine.connect() as connection:
            for param in default_parameters:
                # Check if parameter already exists
                result = connection.execute(text(
                    "SELECT COUNT(*) FROM safety_parameters WHERE name = :name"
                ), {"name": param["name"]})

                if result.scalar() == 0:
                    # Insert the parameter
                    connection.execute(text("""
                        INSERT INTO safety_parameters (name, category, is_required, order_index)
                        VALUES (:name, :category, :is_required, :order_index)
                    """), param)
                    logger.info(f"Inserted parameter: {param['name']}")
                else:
                    logger.info(f"Parameter already exists: {param['name']}")

            connection.commit()

        logger.info("Default safety parameters inserted successfully!")
        return True
    except Exception as e:
        logger.error(f"Error inserting default safety parameters: {e}")
        return False

def create_indexes():
    """Create indexes for better query performance."""
    try:
        logger.info("Creating database indexes...")

        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_safety_checklist_request_id ON safety_checklist_items(request_id)",
            "CREATE INDEX IF NOT EXISTS idx_safety_checklist_parameter_id ON safety_checklist_items(safety_parameter_id)",
            "CREATE INDEX IF NOT EXISTS idx_safety_checklist_checked_by ON safety_checklist_items(checked_by)",
            "CREATE INDEX IF NOT EXISTS idx_safety_parameters_category ON safety_parameters(category)",
            "CREATE INDEX IF NOT EXISTS idx_safety_parameters_required ON safety_parameters(is_required)",
            "CREATE INDEX IF NOT EXISTS idx_job_photos_safety_category ON job_photos(safety_category)",
        ]

        with engine.connect() as connection:
            for index_sql in indexes:
                connection.execute(text(index_sql))
                logger.info(f"Created index: {index_sql.split()[3]}")

            connection.commit()

        logger.info("Database indexes created successfully!")
        return True
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        return False

def verify_migration():
    """Verify that the migration was successful."""
    try:
        logger.info("Verifying migration...")

        with engine.connect() as connection:
            # Check safety_parameters table
            result = connection.execute(text("SELECT COUNT(*) FROM safety_parameters"))
            param_count = result.scalar()
            logger.info(f"Safety parameters count: {param_count}")

            # Check safety_checklist_items table exists
            result = connection.execute(text("""
                SELECT COUNT(*) FROM information_schema.tables
                WHERE table_name = 'safety_checklist_items'
            """))
            table_exists = result.scalar() > 0
            logger.info(f"Safety checklist items table exists: {table_exists}")

            # Check job_photos has safety columns
            result = connection.execute(text("""
                SELECT COUNT(*) FROM information_schema.columns
                WHERE table_name = 'job_photos'
                AND column_name IN ('safety_category', 'safety_notes', 'file_id')
            """))
            safety_columns = result.scalar()
            logger.info(f"Safety columns in job_photos: {safety_columns}/3")

        logger.info("Migration verification completed!")
        return param_count > 0 and table_exists and safety_columns == 3
    except Exception as e:
        logger.error(f"Error verifying migration: {e}")
        return False

def main():
    """Run the complete migration."""
    logger.info("Starting safety feature migration...")

    try:
        # Step 1: Create safety tables
        if not create_safety_tables():
            logger.error("Failed to create safety tables")
            return False

        # Step 2: Add safety columns to job_photos
        if not add_safety_columns():
            logger.error("Failed to add safety columns")
            return False

        # Step 3: Insert default safety parameters
        if not insert_default_safety_parameters():
            logger.error("Failed to insert default safety parameters")
            return False

        # Step 4: Create indexes
        if not create_indexes():
            logger.error("Failed to create indexes")
            return False

        # Step 5: Verify migration
        if not verify_migration():
            logger.error("Migration verification failed")
            return False

        logger.info("✅ Safety feature migration completed successfully!")
        return True

    except Exception as e:
        logger.error(f"Migration failed: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)