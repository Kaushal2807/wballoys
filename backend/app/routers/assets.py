from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.service_request import Asset
from app.dependencies.auth import get_current_user, require_role

router = APIRouter()


class AssetCreate(BaseModel):
    asset_name: str
    model: str
    serial_number: str
    location: str
    customer_id: int = None


def serialize_asset(asset):
    return {
        "id": asset.id,
        "customer_id": asset.customer_id,
        "asset_name": asset.asset_name,
        "model": asset.model,
        "serial_number": asset.serial_number,
        "location": asset.location,
    }


# ─── GET /api/assets (List assets, filterable by customer_id) ──
@router.get("/")
def get_assets(
    customer_id: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Asset)

    # Customers can only see their own assets
    if current_user.role == "customer":
        query = query.filter(Asset.customer_id == current_user.id)
    elif customer_id:
        query = query.filter(Asset.customer_id == customer_id)

    assets = query.all()
    return [serialize_asset(a) for a in assets]


# ─── POST /api/assets (Create asset) ──
@router.post("/", status_code=201)
def create_asset(
    data: AssetCreate,
    current_user: User = Depends(require_role("admin", "manager", "customer")),
    db: Session = Depends(get_db),
):
    # Customers create assets for themselves; admins/managers can specify customer_id
    if current_user.role == "customer":
        owner_id = current_user.id
    elif data.customer_id:
        owner_id = data.customer_id
    else:
        raise HTTPException(status_code=400, detail="customer_id is required for admin/manager")

    asset = Asset(
        customer_id=owner_id,
        asset_name=data.asset_name,
        model=data.model,
        serial_number=data.serial_number,
        location=data.location,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return serialize_asset(asset)
