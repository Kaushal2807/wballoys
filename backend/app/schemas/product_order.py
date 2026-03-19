from pydantic import BaseModel
from typing import Optional


class ProductOrderCreate(BaseModel):
    product_name: str
    model: str
    quantity: int
    customer_name: str
    customer_email: str  # Keep for admin contact purposes
    delivery_address: str
    order_date: str
    expected_delivery_date: str
    notes: Optional[str] = None


class ProductOrderStatusUpdate(BaseModel):
    status: str  # pending, dispatched, in_transit, delivered
    notes: Optional[str] = None


class ProductOrderTrackByIdRequest(BaseModel):
    tracking_id: str
