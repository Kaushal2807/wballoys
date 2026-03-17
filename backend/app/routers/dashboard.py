from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.service_request import ServiceRequest, JobAssignment
from app.dependencies.auth import get_current_user

router = APIRouter()


@router.get("/stats")
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(ServiceRequest)

    if current_user.role == "customer":
        query = query.filter(ServiceRequest.customer_id == current_user.id)
    # Engineer and Manager see stats for ALL requests

    requests = query.all()

    return {
        "total_requests": len(requests),
        "new_requests": len([r for r in requests if r.status == "new"]),
        "assigned_requests": len([r for r in requests if r.status == "assigned"]),
        "in_progress_requests": len([r for r in requests if r.status == "in_progress"]),
        "completed_requests": len([r for r in requests if r.status == "completed"]),
        "closed_requests": len([r for r in requests if r.status == "closed"]),
        "urgent_requests": len([r for r in requests if r.urgency == "high"]),
    }
