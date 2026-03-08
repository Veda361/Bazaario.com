from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routes import products, profile, resale, reviews
from razorpay_payment import router as razorpay_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://bazaario-frontend.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Bazaario API is running 🚀"}

app.include_router(razorpay_router, prefix="/api/payment")
app.include_router(products.router, prefix="/products")
app.include_router(profile.router)
app.include_router(resale.router, prefix="/api/resale")
app.include_router(reviews.router)