import razorpay
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import hmac
import hashlib

load_dotenv()

router = APIRouter()

razorpay_client = razorpay.Client(
    auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET"))
)


class OrderRequest(BaseModel):
    amount: int   # in rupees


class VerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/create-order")
def create_order(data: OrderRequest):
    order = razorpay_client.order.create({
        "amount": data.amount * 100,  # convert to paise
        "currency": "INR",
        "payment_capture": 1
    })
    return order


@router.post("/verify-payment")
def verify_payment(data: VerifyRequest):
    order_payment = (
        data.razorpay_order_id + "|" + data.razorpay_payment_id
    )
    generated_signature = hmac.new(
        bytes(os.getenv("RAZORPAY_KEY_SECRET"), 'utf-8'),
        bytes(order_payment, 'utf-8'),
        hashlib.sha256
    ).hexdigest()

    if generated_signature != data.razorpay_signature:
        raise HTTPException(status_code=400, detail="Invalid Signature")

    return {"status": "Payment Verified"}