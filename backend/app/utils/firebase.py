import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from app.config import settings

_firebase_app = None


def get_firebase_app():
    """Lazy-initialize the Firebase Admin SDK."""
    global _firebase_app
    if _firebase_app is None:
        if not settings.FIREBASE_PROJECT_ID:
            return None
        cred = None
        if settings.FIREBASE_SERVICE_ACCOUNT_PATH:
            cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
        _firebase_app = firebase_admin.initialize_app(
            credential=cred,
            options={"projectId": settings.FIREBASE_PROJECT_ID},
        )
    return _firebase_app


def verify_firebase_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token and return the decoded claims.
    Returns dict with keys like: uid, email, name, email_verified, picture, etc.
    Raises firebase_admin.auth.InvalidIdTokenError on failure.
    """
    app = get_firebase_app()
    if app is None:
        raise RuntimeError("Firebase is not configured")
    decoded = firebase_auth.verify_id_token(id_token)
    return decoded
