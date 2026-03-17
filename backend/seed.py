"""
Seed script to populate the database with demo data matching frontend mock data.
Run: python seed.py (from the backend directory)
Or:  docker compose exec backend python seed.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.service_request import Asset, ServiceRequest, JobAssignment, JobUpdate, ProductOrder
from app.utils.security import hash_password

# Import all models so tables are created
from app.models import (  # noqa: F401
    User as _U, Asset as _A, ServiceRequest as _SR,
    JobAssignment as _JA, JobUpdate as _JU, JobPhoto as _JP,
    DeliveryUpdate as _DU, ProductOrder as _PO,
)


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing = db.query(User).first()
        if existing:
            print("Database already seeded. Skipping.")
            return

        print("Seeding database...")

        # ─── Users (matching frontend DEMO_CREDENTIALS and MOCK_USERS) ───
        users = [
            User(id=1, email="customer@gmail.com", password_hash=hash_password("customer123"), name="John Customer", role="customer"),
            User(id=2, email="engineer@gmail.com", password_hash=hash_password("engineer123"), name="Sarah Engineer", role="engineer"),
            User(id=3, email="manager@gmail.com", password_hash=hash_password("manager123"), name="Mike Manager", role="manager"),
            User(id=4, email="john.smith@company.com", password_hash=hash_password("engineer123"), name="John Smith", role="engineer"),
            User(id=5, email="sarah.lee@company.com", password_hash=hash_password("engineer123"), name="Sarah Lee", role="engineer"),
            User(id=6, email="mike.johnson@company.com", password_hash=hash_password("engineer123"), name="Mike Johnson", role="engineer"),
            User(id=7, email="amy.chen@company.com", password_hash=hash_password("engineer123"), name="Amy Chen", role="engineer"),
            User(id=8, email="admin@gmail.com", password_hash=hash_password("admin123"), name="System Admin", role="admin"),
        ]
        for u in users:
            db.add(u)
        db.flush()
        print(f"  Created {len(users)} users")

        # ─── Assets (matching frontend MOCK_ASSETS) ───
        assets = [
            Asset(id=1, customer_id=1, asset_name="AC Unit - Office 201", model="Daikin FTXM25", serial_number="DK-2024-001", location="Building A, Floor 2"),
            Asset(id=2, customer_id=1, asset_name="AC Unit - Conference Room", model="Daikin FTXM35", serial_number="DK-2024-002", location="Building A, Floor 1"),
            Asset(id=3, customer_id=1, asset_name="Chiller - Main Building", model="Carrier 30XA", serial_number="CR-2024-001", location="Building A, Basement"),
            Asset(id=4, customer_id=1, asset_name="AC Unit - Server Room", model="Mitsubishi PCA-M60", serial_number="MT-2024-001", location="Building B, Floor 1"),
            Asset(id=5, customer_id=1, asset_name="Heat Pump - Warehouse", model="Trane XV20i", serial_number="TR-2024-001", location="Warehouse C"),
            Asset(id=6, customer_id=1, asset_name="AC Unit - Reception", model="LG Dual Inverter", serial_number="LG-2024-001", location="Building A, Ground Floor"),
            Asset(id=7, customer_id=1, asset_name="VRF System - Building D", model="Samsung DVM S2", serial_number="SS-2024-001", location="Building D"),
            Asset(id=8, customer_id=1, asset_name="AC Unit - CEO Office", model="Daikin FTKF50", serial_number="DK-2024-003", location="Building A, Floor 5"),
        ]
        for a in assets:
            db.add(a)
        db.flush()
        print(f"  Created {len(assets)} assets")

        # ─── Service Requests (sample data) ───
        requests_data = [
            ServiceRequest(
                id=1, ticket_number="REQ-2024-0001", customer_id=1, asset_id=1,
                description="AC not cooling properly, making unusual noise",
                urgency="high", preferred_date="2024-03-15", preferred_time="10:00",
                status="in_progress", delivery_status="site_visited",
            ),
            ServiceRequest(
                id=2, ticket_number="REQ-2024-0002", customer_id=1, asset_id=2,
                description="Annual maintenance due for conference room AC",
                urgency="low", preferred_date="2024-03-20", preferred_time="14:00",
                status="new", delivery_status="site_visited",
            ),
            ServiceRequest(
                id=3, ticket_number="REQ-2024-0003", customer_id=1, asset_id=3,
                description="Chiller making grinding noise, needs immediate inspection",
                urgency="high", preferred_date="2024-03-10", preferred_time="09:00",
                status="completed", delivery_status="service_solved",
            ),
            ServiceRequest(
                id=4, ticket_number="REQ-2024-0004", customer_id=1, asset_id=4,
                description="Server room temperature rising, AC not working efficiently",
                urgency="high", preferred_date="2024-03-12", preferred_time="08:00",
                status="assigned", delivery_status="site_visited",
            ),
            ServiceRequest(
                id=5, ticket_number="REQ-2024-0005", customer_id=1, asset_id=5,
                description="Heat pump making clicking sounds",
                urgency="medium", preferred_date="2024-03-18", preferred_time="11:00",
                status="new", delivery_status="site_visited",
            ),
        ]
        for r in requests_data:
            db.add(r)
        db.flush()
        print(f"  Created {len(requests_data)} service requests")

        # ─── Job Assignments ───
        assignments_data = [
            JobAssignment(id=1, request_id=1, engineer_id=2, assigned_by=3, status="accepted"),
            JobAssignment(id=2, request_id=3, engineer_id=4, assigned_by=3, status="accepted"),
            JobAssignment(id=3, request_id=4, engineer_id=5, assigned_by=3, status="pending"),
        ]
        for a in assignments_data:
            db.add(a)
        db.flush()
        print(f"  Created {len(assignments_data)} job assignments")

        # ─── Job Updates ───
        updates_data = [
            JobUpdate(id=1, request_id=1, user_id=3, notes="Assigned to Sarah Engineer."),
            JobUpdate(id=2, request_id=1, user_id=2, notes="Accepted job. Will visit site tomorrow."),
            JobUpdate(id=3, request_id=1, user_id=2, notes="Site visited. Found compressor issue. Parts ordered."),
            JobUpdate(id=4, request_id=3, user_id=3, notes="Assigned to John Smith."),
            JobUpdate(id=5, request_id=3, user_id=4, notes="Chiller repaired. Replaced bearings and lubricated motor."),
        ]
        for u in updates_data:
            db.add(u)
        db.flush()
        print(f"  Created {len(updates_data)} job updates")

        # ─── Product Orders ───
        product_orders = [
            ProductOrder(
                id=1, order_number="ORD-2024-0001",
                product_name="Industrial AC Unit", model="Daikin VRV IV",
                quantity=2, customer_name="ABC Corporation",
                customer_email="orders@abccorp.com", tracking_password="abc@1234",
                delivery_address="123 Industrial Ave, Mumbai",
                order_date="2024-03-01", expected_delivery_date="2024-03-15",
                delivery_status="in_transit", notes="Express delivery requested",
                created_by=3,
            ),
            ProductOrder(
                id=2, order_number="ORD-2024-0002",
                product_name="Split AC Unit", model="Carrier 42KHG012",
                quantity=5, customer_name="XYZ Industries",
                customer_email="purchase@xyzind.com", tracking_password="xyz@5678",
                delivery_address="456 Tech Park, Bangalore",
                order_date="2024-03-05", expected_delivery_date="2024-03-20",
                delivery_status="pending", notes=None,
                created_by=3,
            ),
            ProductOrder(
                id=3, order_number="ORD-2024-0003",
                product_name="Chiller Unit", model="Trane CGAM",
                quantity=1, customer_name="Tech Solutions Ltd",
                customer_email="admin@techsol.com", tracking_password="tech@9012",
                delivery_address="789 Business Hub, Delhi",
                order_date="2024-03-08", expected_delivery_date="2024-03-25",
                delivery_status="dispatched", notes="Handle with care - heavy equipment",
                created_by=3,
            ),
            ProductOrder(
                id=4, order_number="ORD-2024-0004",
                product_name="VRF System", model="Samsung DVM S2",
                quantity=3, customer_name="Global Enterprises",
                customer_email="procurement@globalent.com", tracking_password="global@3456",
                delivery_address="321 Corporate Tower, Pune",
                order_date="2024-03-10", expected_delivery_date="2024-03-28",
                delivery_status="delivered", notes="Installation scheduled for next week",
                created_by=3,
            ),
        ]
        for po in product_orders:
            db.add(po)
        db.flush()
        print(f"  Created {len(product_orders)} product orders")

        # Reset sequences for PostgreSQL
        db.execute(
            db.bind.dialect.statement_compiler(
                db.bind.dialect,
                None
            ).process(None) if False else
            __import__('sqlalchemy').text("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))")
        )
        # Simpler approach - just execute raw SQL for sequence resets
        for table in ['users', 'assets', 'service_requests', 'job_assignments', 'job_updates', 'product_orders']:
            try:
                db.execute(
                    __import__('sqlalchemy').text(
                        f"SELECT setval('{table}_id_seq', (SELECT COALESCE(MAX(id), 1) FROM {table}))"
                    )
                )
            except Exception:
                pass  # Table might not have a sequence

        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
