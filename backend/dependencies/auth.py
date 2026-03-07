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
        raise HTTPException(status_code=401, detail="Invalid token")

    firebase_uid = decoded["uid"]
    email = decoded.get("email")

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()

    if not user:
        is_admin = email in ADMIN_EMAILS

        user = User(
            firebase_uid=firebase_uid,
            email=email,
            role="admin" if is_admin else "buyer",
            is_admin=is_admin
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    return user


def admin_required(user=Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin required")
    return user