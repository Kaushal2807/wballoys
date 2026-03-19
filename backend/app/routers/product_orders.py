from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.service_request import ProductOrder
from app.dependencies.auth import get_current_user, require_role
from app.utils.tracking import generate_tracking_id, validate_tracking_id
from app.schemas.product_order import (
    ProductOrderCreate,
    ProductOrderStatusUpdate,
    ProductOrderTrackByIdRequest,
)

router = APIRouter()

DELIVERY_TRANSITIONS = {
    "pending": "dispatched",
    "dispatched": "in_transit",
    "in_transit": "delivered",
    "delivered": None,
}


def serialize_order(order):
    return {
        "id": order.id,
        "order_number": order.order_number,
        "tracking_id": order.tracking_id,
        "product_name": order.product_name,
        "model": order.model,
        "quantity": order.quantity,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "delivery_address": order.delivery_address,
        "order_date": order.order_date,
        "expected_delivery_date": order.expected_delivery_date,
        "delivery_status": order.delivery_status,
        "notes": order.notes,
        "created_by": order.created_by,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None,
    }


def generate_order_number(db: Session) -> str:
    count = db.query(ProductOrder).count() + 1
    return f"ORD-2024-{str(count).zfill(4)}"


# ─── POST /api/product-orders/track (Public - no auth) ──
@router.post("/track")
def track_product_order(
    data: ProductOrderTrackByIdRequest,
    db: Session = Depends(get_db),
):
    # Validate tracking ID format
    if not validate_tracking_id(data.tracking_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid tracking ID format. Please check your tracking ID.",
        )

    order = (
        db.query(ProductOrder)
        .filter(ProductOrder.tracking_id == data.tracking_id.upper())
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found. Please check your tracking ID.",
        )
    return serialize_order(order)


# ─── GET /api/product-orders (List all) ──
@router.get("/")
def get_all_product_orders(
    current_user: User = Depends(require_role("manager", "admin")),
    db: Session = Depends(get_db),
):
    orders = db.query(ProductOrder).order_by(ProductOrder.created_at.desc()).all()
    return [serialize_order(o) for o in orders]


# ─── GET /api/product-orders/{id} (Get single) ──
@router.get("/{order_id}")
def get_product_order(
    order_id: int,
    current_user: User = Depends(require_role("manager", "admin")),
    db: Session = Depends(get_db),
):
    order = db.query(ProductOrder).filter(ProductOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Product order not found")
    return serialize_order(order)


# ─── POST /api/product-orders (Create) ──
@router.post("/", status_code=201)
def create_product_order(
    data: ProductOrderCreate,
    current_user: User = Depends(require_role("manager", "admin")),
    db: Session = Depends(get_db),
):
    new_order = ProductOrder(
        order_number=generate_order_number(db),
        tracking_id=generate_tracking_id(db),  # Auto-generate tracking ID
        product_name=data.product_name,
        model=data.model,
        quantity=data.quantity,
        customer_name=data.customer_name,
        customer_email=data.customer_email.lower(),
        delivery_address=data.delivery_address,
        order_date=data.order_date,
        expected_delivery_date=data.expected_delivery_date,
        delivery_status="pending",
        notes=data.notes,
        created_by=current_user.id,
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return serialize_order(new_order)


# ─── PATCH /api/product-orders/{id}/status (Update delivery status) ──
@router.patch("/{order_id}/status")
def update_product_order_status(
    order_id: int,
    data: ProductOrderStatusUpdate,
    current_user: User = Depends(require_role("manager", "admin")),
    db: Session = Depends(get_db),
):
    order = db.query(ProductOrder).filter(ProductOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Product order not found")

    current_status = order.delivery_status or "pending"
    expected_next = DELIVERY_TRANSITIONS.get(current_status)
    if not expected_next or data.status != expected_next:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid delivery transition: {current_status} -> {data.status}. Expected: {current_status} -> {expected_next}",
        )

    order.delivery_status = data.status
    order.updated_at = datetime.utcnow()
    if data.notes is not None:
        order.notes = data.notes

    db.commit()
    db.refresh(order)
    return serialize_order(order)
