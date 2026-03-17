from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.security import hash_password
from app.dependencies.auth import get_current_user, require_role
from app.schemas.user import UserCreate

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
