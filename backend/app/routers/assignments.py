from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.service_request import ServiceRequest, JobAssignment, JobUpdate
from app.schemas.request import AssignmentCreate
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


def serialize_assignment(a):
    return {
        "id": a.id,
        "request_id": a.request_id,
        "engineer_id": a.engineer_id,
        "assigned_by": a.assigned_by,
        "assigned_at": a.assigned_at.isoformat() if a.assigned_at else None,
        "accepted_at": a.accepted_at.isoformat() if a.accepted_at else None,
        "status": a.status,
        "engineer": serialize_user(a.engineer),
        "assigner": serialize_user(a.assigner),
    }


# ─── POST /api/assignments (Manager assigns engineer) ──
@router.post("/", status_code=201)
def assign_engineer(
    data: AssignmentCreate,
    current_user: User = Depends(require_role("manager", "admin")),
    db: Session = Depends(get_db),
):
    request = db.query(ServiceRequest).filter(ServiceRequest.id == data.request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    engineer = db.query(User).filter(User.id == data.engineer_id, User.role == "engineer").first()
    if not engineer:
        raise HTTPException(status_code=404, detail="Engineer not found")

    existing = db.query(JobAssignment).filter(
        JobAssignment.request_id == data.request_id,
        JobAssignment.status != "rejected",
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Request already has an active assignment")

    assignment = JobAssignment(
        request_id=data.request_id,
        engineer_id=data.engineer_id,
        assigned_by=current_user.id,
        status="pending",
    )
    db.add(assignment)

    request.status = "assigned"
    request.updated_at = datetime.utcnow()

    if data.note:
        update = JobUpdate(
            request_id=data.request_id,
            user_id=current_user.id,
            notes=f"Assigned to {engineer.name}. Note: {data.note}",
        )
        db.add(update)

    db.commit()
    db.refresh(assignment)

    assignment = (
        db.query(JobAssignment)
        .options(
            joinedload(JobAssignment.engineer),
            joinedload(JobAssignment.assigner),
        )
        .filter(JobAssignment.id == assignment.id)
        .first()
    )

    return serialize_assignment(assignment)


# ─── PATCH /api/assignments/{id}/accept (Engineer accepts) ─
@router.patch("/{assignment_id}/accept")
def accept_assignment(
    assignment_id: int,
    current_user: User = Depends(require_role("engineer")),
    db: Session = Depends(get_db),
):
    assignment = db.query(JobAssignment).filter(JobAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if assignment.engineer_id != current_user.id:
        raise HTTPException(status_code=403, detail="This job is not assigned to you")

    assignment.status = "accepted"
    assignment.accepted_at = datetime.utcnow()

    request = db.query(ServiceRequest).filter(ServiceRequest.id == assignment.request_id).first()
    if request:
        request.status = "in_progress"
        request.updated_at = datetime.utcnow()

    update = JobUpdate(
        request_id=assignment.request_id,
        user_id=current_user.id,
        notes=f"Engineer {current_user.name} accepted this job.",
    )
    db.add(update)

    db.commit()
    db.refresh(assignment)

    assignment = (
        db.query(JobAssignment)
        .options(
            joinedload(JobAssignment.engineer),
            joinedload(JobAssignment.assigner),
        )
        .filter(JobAssignment.id == assignment.id)
        .first()
    )

    return serialize_assignment(assignment)


# ─── PATCH /api/assignments/{id}/reject (Engineer rejects) ─
@router.patch("/{assignment_id}/reject")
def reject_assignment(
    assignment_id: int,
    current_user: User = Depends(require_role("engineer")),
    db: Session = Depends(get_db),
):
    assignment = db.query(JobAssignment).filter(JobAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if assignment.engineer_id != current_user.id:
        raise HTTPException(status_code=403, detail="This job is not assigned to you")

    assignment.status = "rejected"

    request = db.query(ServiceRequest).filter(ServiceRequest.id == assignment.request_id).first()
    if request:
        request.status = "new"
        request.updated_at = datetime.utcnow()

    update = JobUpdate(
        request_id=assignment.request_id,
        user_id=current_user.id,
        notes=f"Engineer {current_user.name} rejected this job.",
    )
    db.add(update)

    db.commit()
    db.refresh(assignment)

    assignment = (
        db.query(JobAssignment)
        .options(
            joinedload(JobAssignment.engineer),
            joinedload(JobAssignment.assigner),
        )
        .filter(JobAssignment.id == assignment.id)
        .first()
    )

    return serialize_assignment(assignment)


# ─── GET /api/assignments/engineers (List engineers) ────
@router.get("/engineers")
def get_engineers(
    current_user: User = Depends(require_role("manager", "admin")),
    db: Session = Depends(get_db),
):
    engineers = db.query(User).filter(User.role == "engineer").all()
    return [serialize_user(e) for e in engineers]
