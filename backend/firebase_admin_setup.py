import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models.user import User  # 🔥 make sure you have this model

# ----------------------------------------
# Initialize Firebase
# ----------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
cred_path = os.path.join(BASE_DIR, "firebase_credentials.json")

if not firebase_admin._apps:
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        raise FileNotFoundError(
            "firebase_credentials.json not found in backend directory"
        )

# ----------------------------------------
# DB Dependency
# ----------------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----------------------------------------
# VERIFY FIREBASE TOKEN
# ----------------------------------------

def verify_token(id_token: str):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print("Token verification failed:", str(e))
        return None


# ----------------------------------------
# GET CURRENT USER
# ----------------------------------------

def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):

    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")

    token = authorization.split(" ")[1]
    print("Authorization Header:", authorization)

    decoded_user = verify_token(token)

    if not decoded_user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    firebase_uid = decoded_user.get("uid")
    email = decoded_user.get("email")

    if not firebase_uid or not email:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    # 🔥 Fetch user from your database
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found in database")

    # ✅ Return clean structured object
    return {
        "id": user.id,          # DB user id
        "email": user.email,
        "firebase_uid": firebase_uid
    }


# ----------------------------------------
# ADMIN ONLY DEPENDENCY
# ----------------------------------------


def admin_required(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.id == current_user["id"]).first()

    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    return current_user