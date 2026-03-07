import os
import json
import firebase_admin
from firebase_admin import credentials, auth

firebase_json = os.getenv("FIREBASE_CREDENTIALS")

if not firebase_json:
    raise ValueError("FIREBASE_CREDENTIALS environment variable not set")

# Convert JSON string to dict
cred_dict = json.loads(firebase_json)

# Fix private key formatting
if "private_key" in cred_dict:
    cred_dict["private_key"] = cred_dict["private_key"].replace("\\n", "\n")

cred = credentials.Certificate(cred_dict)

# Initialize Firebase only once
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)


def verify_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid Firebase token: {e}")