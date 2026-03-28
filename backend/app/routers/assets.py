from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.service_request import Asset, ServiceRequest
from app.dependencies.auth import get_current_user, require_role

router = APIRouter()


class AssetCreate(BaseModel):
    asset_name: str
    model: str
    serial_number: str
    location: str
    customer_id: int = None


class AssetUpdate(BaseModel):
    asset_name: str = None
    model: str = None
    serial_number: str = None
    location: str = None


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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assets = db.query(Asset).all()
    return [serialize_asset(a) for a in assets]


# ─── POST /api/assets (Create asset) ──
@router.post("/", status_code=201)
def create_asset(
    data: AssetCreate,
    current_user: User = Depends(require_role("admin", "manager", "customer")),
    db: Session = Depends(get_db),
):
    # Customers create assets for themselves; admins/managers can create shared assets or assign to customer
    if current_user.role == "customer":
        owner_id = current_user.id
    else:
        # Admin/manager: use provided customer_id or None for shared asset
        owner_id = data.customer_id  # Can be None for shared assets

    asset = Asset(
        customer_id=owner_id,  # Can be None now
        asset_name=data.asset_name,
        model=data.model,
        serial_number=data.serial_number,
        location=data.location,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return serialize_asset(asset)


# ─── PATCH /api/assets/{asset_id} (Update asset - admin) ──
@router.patch("/{asset_id}", status_code=200)
def update_asset(
    asset_id: int,
    data: AssetUpdate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Update fields if provided
    if data.asset_name is not None:
        asset.asset_name = data.asset_name
    if data.model is not None:
        asset.model = data.model
    if data.serial_number is not None:
        asset.serial_number = data.serial_number
    if data.location is not None:
        asset.location = data.location

    db.commit()
    db.refresh(asset)
    return serialize_asset(asset)


# ─── DELETE /api/assets/{asset_id} (Delete asset - admin) ──
@router.delete("/{asset_id}", status_code=200)
def delete_asset(
    asset_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Check for active service requests only
    active_requests = db.query(ServiceRequest).filter(
        ServiceRequest.asset_id == asset_id,
        ServiceRequest.status.in_(["new", "assigned", "in_progress"])
    ).count()

    if active_requests > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete asset. {active_requests} active service request(s) exist. Complete or close them first."
        )

    db.delete(asset)
    db.commit()

    return {"message": f"Asset {asset.asset_name} deleted successfully", "id": asset_id}
