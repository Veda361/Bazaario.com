import os
import json
import base64
import firebase_admin
from firebase_admin import credentials, auth

firebase_base64 = os.getenv("FIREBASE_SERVICE_ACCOUNT")

if firebase_base64:
    firebase_json = base64.b64decode(firebase_base64).decode("utf-8")
    cred_dict = json.loads(firebase_json)
    cred = credentials.Certificate(cred_dict)
else:
    cred = credentials.Certificate("firebase-service-account.json")

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)


def verify_token(token: str):
    return auth.verify_id_token(token)