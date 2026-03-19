from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.service_request import ServiceRequest, DeliveryUpdate, JobUpdate, JobPhoto
from app.schemas.request import DeliveryStatusUpdate
from app.dependencies.auth import get_current_user, require_role

router = APIRouter()

DELIVERY_TRANSITIONS = {
    "site_visited": "photos_taken",
    "photos_taken": "next_date_given",
    "next_date_given": "service_solved",
}

DELIVERY_STATUS_LABELS = {
    "site_visited": "Site Visited",
    "photos_taken": "Photos Taken",
    "next_date_given": "Next Date Given",
    "service_solved": "Service Solved",
}


def serialize_user(user):
    if not user:
        return None
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


# ─── GET /api/requests/{id}/delivery (Get delivery history) ──
@router.get("/{request_id}/delivery")
def get_delivery_updates(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if current_user.role == "customer" and request.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    updates = (
        db.query(DeliveryUpdate)
        .options(joinedload(DeliveryUpdate.user))
        .filter(DeliveryUpdate.request_id == request_id)
        .order_by(DeliveryUpdate.updated_at.desc())
        .all()
    )

    return [
        {
            "id": u.id,
            "request_id": u.request_id,
            "status": u.status,
            "updated_by": u.updated_by,
            "notes": u.notes,
            "updated_at": u.updated_at.isoformat() if u.updated_at else None,
            "user": serialize_user(u.user),
        }
        for u in updates
    ]


# ─── PATCH /api/requests/{id}/delivery (Update delivery status) ──
@router.patch("/{request_id}/delivery")
def update_delivery_status(
    request_id: int,
    data: DeliveryStatusUpdate,
    current_user: User = Depends(require_role("engineer", "manager", "admin")),
    db: Session = Depends(get_db),
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if request.status not in ("in_progress", "completed"):
        raise HTTPException(
            status_code=400,
            detail="Delivery can only be updated for in-progress or completed jobs",
        )

    current_delivery = request.delivery_status or "site_visited"
    expected_next = DELIVERY_TRANSITIONS.get(current_delivery)
    if not expected_next or data.status != expected_next:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid delivery transition: {current_delivery} -> {data.status}. Expected: {current_delivery} -> {expected_next}",
        )

    # Validation for service_solved: require at least one recent note and one recent photo
    if data.status == "service_solved":
        # Find when "next_date_given" status was last set
        next_date_update = (
            db.query(DeliveryUpdate)
            .filter(
                DeliveryUpdate.request_id == request_id,
                DeliveryUpdate.status == "next_date_given"
            )
            .order_by(DeliveryUpdate.updated_at.desc())
            .first()
        )

        if next_date_update:
            next_date_time = next_date_update.updated_at

            # Check for notes added after next_date_given status
            recent_note_count = (
                db.query(JobUpdate)
                .filter(
                    JobUpdate.request_id == request_id,
                    JobUpdate.created_at > next_date_time
                )
                .count()
            )

            # Check for photos uploaded after next_date_given status
            recent_photo_count = (
                db.query(JobPhoto)
                .filter(
                    JobPhoto.request_id == request_id,
                    JobPhoto.uploaded_at > next_date_time
                )
                .count()
            )
        else:
            # If no next_date_given status found, require both notes and photos exist
            recent_note_count = db.query(JobUpdate).filter(JobUpdate.request_id == request_id).count()
            recent_photo_count = db.query(JobPhoto).filter(JobPhoto.request_id == request_id).count()

        missing = []
        if recent_note_count == 0:
            missing.append("work notes")
        if recent_photo_count == 0:
            missing.append("photos")

        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot mark as Service Solved. Please add {' and '.join(missing)} after the Next Date Given stage.",
            )

    request.delivery_status = data.status
    request.updated_at = datetime.utcnow()

    delivery_update = DeliveryUpdate(
        request_id=request_id,
        status=data.status,
        updated_by=current_user.id,
        notes=data.notes,
    )
    db.add(delivery_update)

    status_label = DELIVERY_STATUS_LABELS.get(data.status, data.status)
    note_text = f'Delivery status updated to "{status_label}" by {current_user.name}.'
    if data.notes:
        note_text += f" Notes: {data.notes}"

    job_update = JobUpdate(
        request_id=request_id,
        user_id=current_user.id,
        notes=note_text,
    )
    db.add(job_update)

    db.commit()
    db.refresh(delivery_update)

    delivery_update = (
        db.query(DeliveryUpdate)
        .options(joinedload(DeliveryUpdate.user))
        .filter(DeliveryUpdate.id == delivery_update.id)
        .first()
    )

    return {
        "id": delivery_update.id,
        "request_id": delivery_update.request_id,
        "status": delivery_update.status,
        "updated_by": delivery_update.updated_by,
        "notes": delivery_update.notes,
        "updated_at": delivery_update.updated_at.isoformat() if delivery_update.updated_at else None,
        "user": serialize_user(delivery_update.user),
    }
