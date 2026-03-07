import os
import json
import firebase_admin
from firebase_admin import credentials, auth

# Get Firebase credentials from Railway environment variable
firebase_json = os.getenv("FIREBASE_CREDENTIALS")

if not firebase_json:
    raise ValueError("FIREBASE_CREDENTIALS environment variable not set")

try:
    cred_dict = json.loads(firebase_json)
    cred = credentials.Certificate(cred_dict)
except Exception as e:
    raise ValueError(f"Invalid Firebase credentials: {e}")

# Initialize Firebase only once
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)


# Function to verify Firebase ID token
def verify_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid Firebase token: {e}")