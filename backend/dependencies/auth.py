from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from core.firebase import verify_token
from database import SessionLocal
from models.user import User

security = HTTPBearer()

ADMIN_EMAILS = [
    "devrajesh@gmail.com",
    "devranjeet@gmail.com"
]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        decoded = verify_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    firebase_uid = decoded.get("uid")
    email = decoded.get("email")

    if not firebase_uid:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()

    # Determine admin status
    is_admin = email in ADMIN_EMAILS if email else False

    # If user does not exist → create
    if not user:
        user = User(
            firebase_uid=firebase_uid,
            email=email,
            role="admin" if is_admin else "buyer",
            is_admin=is_admin
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    # If user exists but should be admin → update role
    if is_admin and user.role != "admin":
        user.role = "admin"
        user.is_admin = True
        db.commit()

    return user

def admin_required(user: User = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin required")
    return user