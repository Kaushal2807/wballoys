from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.security import hash_password
from app.dependencies.auth import get_current_user, require_role
from app.schemas.user import UserCreate, UserRoleUpdate, UserUpdate
from app.models.service_request import ServiceRequest, Asset, JobAssignment
from app.models.file import File

router = APIRouter()


def serialize_user(user):
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


# ─── GET /api/users (List all users, filterable by role) ──
@router.get("/")
def get_users(
    role: str = None,
    current_user: User = Depends(require_role("manager", "admin")),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.order_by(User.created_at.desc()).all()
    return [serialize_user(u) for u in users]


# ─── POST /api/users (Create user - admin) ──
@router.post("/", status_code=201)
def create_user(
    data: UserCreate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        name=data.name,
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return serialize_user(user)


# ─── PATCH /api/users/{user_id}/role (Update user role - admin) ──
@router.patch("/{user_id}/role", status_code=200)
def update_user_role(
    user_id: int,
    data: UserRoleUpdate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    # Validate role value
    valid_roles = ["customer", "engineer", "manager", "admin"]
    if data.role not in valid_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )

    # Find the target user
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent admin from changing their own role
    if current_user.id == user_id:
        raise HTTPException(
            status_code=403,
            detail="Cannot modify your own role"
        )

    # Update the user's role
    target_user.role = data.role
    db.commit()
    db.refresh(target_user)
    return serialize_user(target_user)


# ─── PATCH /api/users/{user_id} (Update user details - admin) ──
@router.patch("/{user_id}", status_code=200)
def update_user(
    user_id: int,
    data: UserUpdate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    # Prevent admin from updating themselves
    if current_user.id == user_id:
        raise HTTPException(
            status_code=403,
            detail="Cannot modify your own account details"
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check email uniqueness if changing
    if data.email and data.email != target_user.email:
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")

    # Update fields
    if data.name is not None:
        target_user.name = data.name
    if data.email is not None:
        target_user.email = data.email

    db.commit()
    db.refresh(target_user)
    return serialize_user(target_user)


# ─── DELETE /api/users/{user_id} (Delete user - admin) ──
@router.delete("/{user_id}", status_code=200)
def delete_user(
    user_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    # Prevent self-deletion
    if current_user.id == user_id:
        raise HTTPException(
            status_code=403,
            detail="Cannot delete your own account"
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check for dependencies
    dependencies = []

    asset_count = db.query(Asset).filter(Asset.customer_id == user_id).count()
    if asset_count > 0:
        dependencies.append(f"{asset_count} asset(s)")

    request_count = db.query(ServiceRequest).filter(ServiceRequest.customer_id == user_id).count()
    if request_count > 0:
        dependencies.append(f"{request_count} service request(s)")

    assignment_count = db.query(JobAssignment).filter(JobAssignment.engineer_id == user_id).count()
    if assignment_count > 0:
        dependencies.append(f"{assignment_count} job assignment(s)")

    file_count = db.query(File).filter(File.user_id == user_id).count()
    if file_count > 0:
        dependencies.append(f"{file_count} file(s)")

    if dependencies:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete user. User has {', '.join(dependencies)}. Please reassign or delete these first."
        )

    db.delete(target_user)
    db.commit()

    return {"message": f"User {target_user.name} deleted successfully", "id": user_id}
