import os
import json
import base64
import firebase_admin
from firebase_admin import credentials, auth

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# ================= FIREBASE INIT =================

firebase_base64 = os.getenv("FIREBASE_CREDENTIALS_BASE64")

if firebase_base64:
    firebase_json = base64.b64decode(firebase_base64).decode("utf-8")
    cred_dict = json.loads(firebase_json)
    cred = credentials.Certificate(cred_dict)
else:
    # Local development fallback
    cred = credentials.Certificate(
        "bazario-72c6f-firebase-adminsdk-fbsvc-d1f864ccc5.json"
    )

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

# ================= TOKEN VERIFY =================

def verify_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid Firebase token: {e}")

# ================= FASTAPI AUTH =================

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        token = credentials.credentials
        decoded_token = verify_token(token)
        return decoded_token
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

# ================= ADMIN CHECK =================

async def admin_required(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user