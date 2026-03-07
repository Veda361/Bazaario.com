import os
import json
import base64
import firebase_admin
from firebase_admin import credentials, auth

firebase_base64 = os.getenv("FIREBASE_CREDENTIALS_BASE64")

if not firebase_base64:
    raise ValueError("FIREBASE_CREDENTIALS_BASE64 environment variable not set")

# Decode Base64 → JSON
firebase_json = base64.b64decode(firebase_base64).decode("utf-8")
cred_dict = json.loads(firebase_json)

cred = credentials.Certificate(cred_dict)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

def verify_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid Firebase token: {e}")