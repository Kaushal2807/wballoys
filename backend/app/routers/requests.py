from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.service_request import (
    ServiceRequest,
    JobAssignment,
    JobUpdate,
    JobPhoto,
    Asset,
)
from app.schemas.request import RequestCreate, JobUpdateCreate
from app.dependencies.auth import get_current_user, require_role

router = APIRouter()


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


def serialize_asset(asset):
    if not asset:
        return None
    return {
        "id": asset.id,
        "customer_id": asset.customer_id,
        "asset_name": asset.asset_name,
        "model": asset.model,
        "serial_number": asset.serial_number,
        "location": asset.location,
    }


def serialize_assignment(assignment):
    if not assignment:
        return None
    return {
        "id": assignment.id,
        "request_id": assignment.request_id,
        "engineer_id": assignment.engineer_id,
        "assigned_by": assignment.assigned_by,
        "assigned_at": assignment.assigned_at.isoformat() if assignment.assigned_at else None,
        "accepted_at": assignment.accepted_at.isoformat() if assignment.accepted_at else None,
        "status": assignment.status,
        "engineer": serialize_user(assignment.engineer),
        "assigner": serialize_user(assignment.assigner),
    }


def serialize_request(req):
    return {
        "id": req.id,
        "ticket_number": req.ticket_number,
        "customer_id": req.customer_id,
        "asset_id": req.asset_id,
        "description": req.description,
        "urgency": req.urgency,
        "preferred_date": req.preferred_date,
        "preferred_time": req.preferred_time,
        "status": req.status,
        "delivery_status": req.delivery_status,
        "rejected_by_engineers": req.rejected_by_engineers or [],
        "created_at": req.created_at.isoformat() if req.created_at else None,
        "updated_at": req.updated_at.isoformat() if req.updated_at else None,
        "customer": serialize_user(req.customer),
        "asset": serialize_asset(req.asset),
        "assignment": serialize_assignment(req.assignment),
    }


def _base_query(db: Session):
    return db.query(ServiceRequest).options(
        joinedload(ServiceRequest.customer),
        joinedload(ServiceRequest.asset),
        joinedload(ServiceRequest.assignment).joinedload(JobAssignment.engineer),
        joinedload(ServiceRequest.assignment).joinedload(JobAssignment.assigner),
    )


def generate_ticket_number(db: Session) -> str:
    count = db.query(ServiceRequest).count() + 1
    return f"REQ-2024-{str(count).zfill(4)}"


# ─── GET /api/requests (Role-based filtering) ──────────
@router.get("/")
def get_requests(
    status: str = None,
    urgency: str = None,
    search: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = _base_query(db)

    if current_user.role == "customer":
        query = query.filter(ServiceRequest.customer_id == current_user.id)
    elif current_user.role == "engineer":
        # Engineer's assigned jobs only
        query = query.join(JobAssignment).filter(
            JobAssignment.engineer_id == current_user.id,
            JobAssignment.status != "rejected",
        )
    # Manager/Admin sees all

    if status and status != "all":
        query = query.filter(ServiceRequest.status == status)
    if urgency and urgency != "all":
        query = query.filter(ServiceRequest.urgency == urgency)
    if search:
        query = query.filter(
            ServiceRequest.ticket_number.ilike(f"%{search}%")
            | ServiceRequest.description.ilike(f"%{search}%")
        )

    requests = query.order_by(ServiceRequest.created_at.desc()).all()
    return [serialize_request(r) for r in requests]


# ─── GET /api/requests/all (ALL requests - visible to engineers) ────
@router.get("/all")
def get_all_requests(
    status: str = None,
    urgency: str = None,
    current_user: User = Depends(require_role("engineer", "manager", "admin")),
    db: Session = Depends(get_db),
):
    query = _base_query(db)

    if status and status != "all":
        query = query.filter(ServiceRequest.status == status)
    if urgency and urgency != "all":
        query = query.filter(ServiceRequest.urgency == urgency)

    requests = query.order_by(ServiceRequest.created_at.desc()).all()
    return [serialize_request(r) for r in requests]


# ─── GET /api/requests/{id} (Details) ──────────────────
@router.get("/{request_id}")
def get_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    request = _base_query(db).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if current_user.role == "customer" and request.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return serialize_request(request)


# ─── POST /api/requests (Customer creates) ─────────────
@router.post("/", status_code=201)
def create_request(
    data: RequestCreate,
    current_user: User = Depends(require_role("customer")),
    db: Session = Depends(get_db),
):
    ticket = generate_ticket_number(db)
    request = ServiceRequest(
        ticket_number=ticket,
        customer_id=current_user.id,
        asset_id=data.asset_id,
        description=data.description,
        urgency=data.urgency,
        preferred_date=data.preferred_date,
        preferred_time=data.preferred_time,
        status="new",
    )
    db.add(request)
    db.commit()
    db.refresh(request)

    # Re-query with joins
    request = _base_query(db).filter(ServiceRequest.id == request.id).first()
    return serialize_request(request)


# ─── PATCH /api/requests/{id}/status (Update status) ───
@router.patch("/{request_id}/status")
def update_status(
    request_id: int,
    status_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    new_status = status_data.get("status")
    valid_transitions = {
        "new": ["assigned"],
        "assigned": ["in_progress"],
        "in_progress": ["completed"],
        "completed": ["closed"],
    }

    if request.status in valid_transitions and new_status in valid_transitions[request.status]:
        request.status = new_status
        request.updated_at = datetime.utcnow()
        db.commit()

        request = _base_query(db).filter(ServiceRequest.id == request.id).first()
        return serialize_request(request)

    raise HTTPException(
        status_code=400,
        detail=f"Cannot transition from {request.status} to {new_status}",
    )


# ─── POST /api/requests/{id}/self-accept (Engineer self-accepts) ───
@router.post("/{request_id}/self-accept")
def self_accept(
    request_id: int,
    current_user: User = Depends(require_role("engineer")),
    db: Session = Depends(get_db),
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if request.status != "new":
        raise HTTPException(status_code=400, detail="Can only self-accept new requests")

    # Create assignment
    assignment = JobAssignment(
        request_id=request_id,
        engineer_id=current_user.id,
        assigned_by=current_user.id,
        status="accepted",
        accepted_at=datetime.utcnow(),
    )
    db.add(assignment)

    request.status = "in_progress"
    request.updated_at = datetime.utcnow()

    # Add timeline note
    update = JobUpdate(
        request_id=request_id,
        user_id=current_user.id,
        notes=f"Engineer {current_user.name} self-accepted this job.",
    )
    db.add(update)

    db.commit()

    request = _base_query(db).filter(ServiceRequest.id == request.id).first()
    return serialize_request(request)


# ─── POST /api/requests/{id}/reject-new (Engineer rejects new request) ───
@router.post("/{request_id}/reject-new")
def reject_new(
    request_id: int,
    current_user: User = Depends(require_role("engineer")),
    db: Session = Depends(get_db),
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    rejected = request.rejected_by_engineers or []
    if current_user.id not in rejected:
        rejected.append(current_user.id)
        request.rejected_by_engineers = rejected
        request.updated_at = datetime.utcnow()

    db.commit()

    request = _base_query(db).filter(ServiceRequest.id == request.id).first()
    return serialize_request(request)


# ─── PATCH /api/requests/{id}/start (Engineer starts work) ───
@router.patch("/{request_id}/start")
def start_work(
    request_id: int,
    current_user: User = Depends(require_role("engineer")),
    db: Session = Depends(get_db),
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if request.status != "assigned":
        raise HTTPException(status_code=400, detail="Can only start assigned requests")

    request.status = "in_progress"
    request.updated_at = datetime.utcnow()

    update = JobUpdate(
        request_id=request_id,
        user_id=current_user.id,
        notes=f"Engineer {current_user.name} started work on this job.",
    )
    db.add(update)

    db.commit()

    request = _base_query(db).filter(ServiceRequest.id == request.id).first()
    return serialize_request(request)


# ─── PATCH /api/requests/{id}/complete (Engineer marks complete) ───
@router.patch("/{request_id}/complete")
def mark_complete(
    request_id: int,
    current_user: User = Depends(require_role("engineer")),
    db: Session = Depends(get_db),
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if request.status != "in_progress":
        raise HTTPException(status_code=400, detail="Can only complete in-progress requests")

    request.status = "completed"
    request.updated_at = datetime.utcnow()

    update = JobUpdate(
        request_id=request_id,
        user_id=current_user.id,
        notes=f"Engineer {current_user.name} marked this job as completed.",
    )
    db.add(update)

    db.commit()

    request = _base_query(db).filter(ServiceRequest.id == request.id).first()
    return serialize_request(request)


# ─── PATCH /api/requests/{id}/close (Close request) ───
@router.patch("/{request_id}/close")
def close_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if request.status != "completed":
        raise HTTPException(status_code=400, detail="Can only close completed requests")

    request.status = "closed"
    request.updated_at = datetime.utcnow()

    update = JobUpdate(
        request_id=request_id,
        user_id=current_user.id,
        notes=f"Request closed by {current_user.name}.",
    )
    db.add(update)

    db.commit()

    request = _base_query(db).filter(ServiceRequest.id == request.id).first()
    return serialize_request(request)


# ─── POST /api/requests/{id}/updates (Add notes) ───────
@router.post("/{request_id}/updates")
def add_update(
    request_id: int,
    data: JobUpdateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    update = JobUpdate(
        request_id=request_id,
        user_id=current_user.id,
        notes=data.notes,
    )
    db.add(update)
    db.commit()
    db.refresh(update)

    # Load user relationship
    update = (
        db.query(JobUpdate)
        .options(joinedload(JobUpdate.user))
        .filter(JobUpdate.id == update.id)
        .first()
    )

    return {
        "id": update.id,
        "request_id": update.request_id,
        "user_id": update.user_id,
        "notes": update.notes,
        "created_at": update.created_at.isoformat() if update.created_at else None,
        "user": serialize_user(update.user),
    }


# ─── GET /api/requests/{id}/updates (Get history) ──────
@router.get("/{request_id}/updates")
def get_updates(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updates = (
        db.query(JobUpdate)
        .options(joinedload(JobUpdate.user))
        .filter(JobUpdate.request_id == request_id)
        .order_by(JobUpdate.created_at.desc())
        .all()
    )
    return [
        {
            "id": u.id,
            "request_id": u.request_id,
            "user_id": u.user_id,
            "notes": u.notes,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "user": serialize_user(u.user),
        }
        for u in updates
    ]


# ─── POST /api/requests/{id}/photos (Upload) ───────────
@router.post("/{request_id}/photos")
def upload_photo(
    request_id: int,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    photo = JobPhoto(
        request_id=request_id,
        uploaded_by=current_user.id,
        photo_url=data.get("photo_url", ""),
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)

    photo = (
        db.query(JobPhoto)
        .options(joinedload(JobPhoto.uploader))
        .filter(JobPhoto.id == photo.id)
        .first()
    )

    return {
        "id": photo.id,
        "request_id": photo.request_id,
        "uploaded_by": photo.uploaded_by,
        "photo_url": photo.photo_url,
        "uploaded_at": photo.uploaded_at.isoformat() if photo.uploaded_at else None,
        "uploader": serialize_user(photo.uploader),
    }


# ─── GET /api/requests/{id}/photos (List) ──────────────
@router.get("/{request_id}/photos")
def get_photos(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    photos = (
        db.query(JobPhoto)
        .options(joinedload(JobPhoto.uploader))
        .filter(JobPhoto.request_id == request_id)
        .all()
    )
    return [
        {
            "id": p.id,
            "request_id": p.request_id,
            "uploaded_by": p.uploaded_by,
            "photo_url": p.photo_url,
            "uploaded_at": p.uploaded_at.isoformat() if p.uploaded_at else None,
            "uploader": serialize_user(p.uploader),
        }
        for p in photos
    ]
