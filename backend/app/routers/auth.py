from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import jwt
from datetime import datetime, timedelta
from app.database import get_db
from app.config import settings
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.utils.security import hash_password, verify_password
from app.schemas.user import LoginRequest, RegisterRequest, GoogleAuthRequest
from app.utils.firebase import verify_firebase_token

router = APIRouter()


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _user_response(user: User, token: str) -> dict:
    """Build the standard {token, user} auth response."""
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        },
    }


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        name=data.name,
        role=data.role,
        auth_provider="local",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return _user_response(user, token)


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not user.password_hash or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return _user_response(user, token)


@router.post("/google")
def google_auth(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Authenticate via Google (Firebase).
    - Receives Firebase ID token from frontend
    - Verifies it with Firebase Admin SDK
    - Finds or creates user in local DB
    - Returns our JWT + user (same format as /login)
    """
    try:
        decoded = verify_firebase_token(data.id_token)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=401,
            detail=f"Invalid Google token: {str(e)}",
        )

    email = decoded.get("email")
    name = decoded.get("name", email.split("@")[0] if email else "Google User")

    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    # Check if user exists (account linking: same email = same account)
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Create new user with role='customer', no password
        user = User(
            email=email,
            password_hash=None,
            name=name,
            role="customer",
            auth_provider="google",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return _user_response(user, token)


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }
