from fastapi import FastAPI, Header, HTTPException, Depends
from firebase_admin_setup import verify_token
from fastapi.middleware.cors import CORSMiddleware
from razorpay_payment import router as razorpay_router
from database import Base, engine, SessionLocal
from sqlalchemy.orm import Session
from models.user import User
from routes import products, profile
from models.resale_product import ResaleProduct
from routes import resale
from routes import reviews

app = FastAPI()

# ✅ ADD CORS FIRST
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Then create tables
Base.metadata.create_all(bind=engine)

# ✅ Then include routers
app.include_router(razorpay_router, prefix="/api/payment")
app.include_router(products.router, prefix="/products")
app.include_router(profile.router)
app.include_router(resale.router, prefix="/api/resale", tags=["Resale"])
app.include_router(reviews.router)

# ---------------------------
# AUTH DEPENDENCY
# ---------------------------

def get_current_user(authorization: str = Header(...)):
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")

    token = authorization.split(" ")[1]

    decoded = verify_token(token)

    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid token")

    db: Session = SessionLocal()

    firebase_uid = decoded["uid"]
    email = decoded.get("email")

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()

    # ✅ Auto create user if not found
    if not user:

        # 🔥 Admin emails
        admin_emails = [
            "devrajesh@gmail.com",
            "devranjeet@gmail.com"
        ]

        is_admin = email in admin_emails

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


# ---------------------------
# TEST PROTECTED ROUTE
# ---------------------------

@app.get("/protected")
def protected_route(user=Depends(get_current_user)):
    return {
        "email": user.email,
        "role": user.role
    }