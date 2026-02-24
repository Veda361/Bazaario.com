from fastapi import FastAPI, Header, HTTPException, Depends
from firebase_admin_setup import verify_token
from fastapi.middleware.cors import CORSMiddleware
from razorpay_payment import router as razorpay_router
from database import Base, engine
from sqlalchemy.orm import Session
from database import SessionLocal
from models.user import User
from routes import products

app = FastAPI()


origins = [
    "http://localhost:5173",  # Vite frontend
    "http://127.0.0.1:5173",  # Alternative localhost
]

# Create tables
Base.metadata.create_all(bind=engine)

app.include_router(razorpay_router, prefix="/api/payment")
app.include_router(products.router, prefix="/products")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")

    token = authorization.split(" ")[1]
    decoded = verify_token(token)

    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid token")

    db: Session = SessionLocal()

    # Check if user already exists
    user = db.query(User).filter(User.firebase_uid == decoded["uid"]).first()

    # If not exists → create new user
    if not user:
        user = User(
            firebase_uid=decoded["uid"], email=decoded.get("email"), role="buyer"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


@app.get("/protected")
def protected_route(user=Depends(get_current_user)):
    return {
        "email": user.email,
        "role": user.role
    }