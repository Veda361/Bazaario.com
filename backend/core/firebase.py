import os
import json
import base64
import firebase_admin
from firebase_admin import credentials, auth

firebase_base64 = os.getenv("FIREBASE_SERVICE_ACCOUNT")

cred = None

if firebase_base64:
    try:
        firebase_json = base64.b64decode(firebase_base64).decode("utf-8")
        cred_dict = json.loads(firebase_json)
        cred = credentials.Certificate(cred_dict)
    except Exception as e:
        raise RuntimeError(f"Invalid Firebase credentials: {e}")
else:
    if os.path.exists("firebase-service-account.json"):
        cred = credentials.Certificate("firebase-service-account.json")
    else:
        raise RuntimeError("Firebase credentials not found")

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)


def verify_token(token: str):
    return auth.verify_id_token(token)