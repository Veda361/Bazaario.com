import razorpay
import os
import hmac
import csv
import hashlib
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy import extract
from fastapi import Query
from database import SessionLocal
from models.order import Order
from models.payment import Payment
from dependencies.auth import admin_required, get_current_user   # ✅ Auth required
from datetime import datetime, date
from fastapi.responses import StreamingResponse
from models.user import User
from io import StringIO
from datetime import timedelta
from models.resale_product import ResaleProduct

load_dotenv()

router = APIRouter()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise RuntimeError("❌ Razorpay keys not found in environment variables")

razorpay_client = razorpay.Client(
    auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
)

# ---------------------------
# DB Dependency
# ---------------------------


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------
# Request Models
# ---------------------------


class OrderRequest(BaseModel):
    amount: int | None = None
    cart: list  | None = None
    resale_product_id: int | None = None


class VerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class FailedRequest(BaseModel):
    razorpay_order_id: str
    reason: str = "Payment cancelled by user"


class RefundRequest(BaseModel):
    reason: str


# ============================================================
# CREATE ORDER
# ============================================================
# ============================================================
# CREATE ORDER
# ============================================================
@router.post("/create-order")
def create_payment(
    data: OrderRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    user_id = current_user["id"]
    user_email = current_user["email"]

    try:

        # ---------------- NORMAL CART ----------------
        if data.cart:

            razorpay_order = razorpay_client.order.create({
                "amount": data.amount,
                "currency": "INR",
                "payment_capture": 1
            })

            new_order = Order(
                user_id=user_id,
                user_email=user_email,
                razorpay_order_id=razorpay_order["id"],
                amount=data.amount / 100,
                status="Pending",
                items=data.cart
            )

            db.add(new_order)
            db.commit()
            db.refresh(new_order)

            payment = Payment(
                order_id=new_order.id,
                user_id=user_id,
                amount=data.amount / 100,
                status="Pending",
                payment_method="Razorpay"
            )

            db.add(payment)
            db.commit()

            return razorpay_order
        
# ---------------- RESALE PRODUCT ----------------
        if data.resale_product_id:

            resale_item = db.query(ResaleProduct).filter(
                ResaleProduct.id == data.resale_product_id,
                ResaleProduct.is_listed == True
            ).first()

            if not resale_item:
                raise HTTPException(status_code=404, detail="Resale item not available")

            razorpay_order = razorpay_client.order.create({
                "amount": int(resale_item.admin_price * 100),
                "currency": "INR",
                "payment_capture": 1
            })

            new_order = Order(
                user_id=user_id,
                user_email=user_email,
                razorpay_order_id=razorpay_order["id"],
                amount=resale_item.admin_price,
                status="Pending",
                items=[{
                    "type": "resale",
                    "resale_product_id": resale_item.id,
                    "title": resale_item.title,
                    "price": resale_item.admin_price
                }]
            )

            db.add(new_order)
            db.commit()
            db.refresh(new_order)

            payment = Payment(
                order_id=new_order.id,
                user_id=user_id,
                amount=resale_item.admin_price,
                status="Pending",
                payment_method="Razorpay"
            )

            db.add(payment)
            db.commit()

            return razorpay_order

        raise HTTPException(status_code=400, detail="Invalid order request")

    except razorpay.errors.BadRequestError as e:
        raise HTTPException(status_code=400, detail=f"Razorpay error: {str(e)}")

    except Exception as e:
        print("🔥 CREATE ORDER ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
    
    
# ============================================================
# VERIFY PAYMENT
# ============================================================
@router.post("/verify-payment")
def verify_payment(
    data: VerifyRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    user_id = current_user["id"]

    # 🔑 Generate Razorpay signature
    order_payment = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"

    generated_signature = hmac.new(
        bytes(os.getenv("RAZORPAY_KEY_SECRET"), "utf-8"),
        bytes(order_payment, "utf-8"),
        hashlib.sha256
    ).hexdigest()

    if generated_signature != data.razorpay_signature:
        raise HTTPException(status_code=400, detail="Invalid Signature")

    # 🔎 Find order
    order = db.query(Order).filter(
        Order.razorpay_order_id == data.razorpay_order_id,
        Order.user_id == user_id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # 🚫 Prevent duplicate verification
    if order.payment_id:
        return {"status": "already_processed"}

    # ✅ Mark order as paid
    order.payment_id = data.razorpay_payment_id
    order.status = "Paid"
    order.transaction_time = datetime.utcnow()

    # ✅ Update payment record
    payment = db.query(Payment).filter(
        Payment.order_id == order.id
    ).order_by(Payment.id.desc()).first()

    if payment:
        payment.status = "Success"
        payment.payment_id = data.razorpay_payment_id

    # =========================================================
    # 🔥 RESALE LOGIC (IMPORTANT PART)
    # =========================================================

    if order.items and isinstance(order.items, list):
        first_item = order.items[0]

        # Check if this is resale purchase
        if first_item.get("type") == "resale":
            from models.resale_product import ResaleProduct

            resale_item = db.query(ResaleProduct).filter(
                ResaleProduct.id == first_item.get("resale_product_id")
            ).first()

            if resale_item:

                # 🛑 Prevent double sell
                if resale_item.status == "Sold":
                    raise HTTPException(
                        status_code=400,
                        detail="Item already sold"
                    )

                resale_item.status = "Sold"
                resale_item.is_listed = False

    db.commit()

    return {"status": True}

# ============================================================
# HANDLE FAILED PAYMENT
# ============================================================
@router.post("/payment-failed")
def payment_failed(
    data: FailedRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)   # ✅ normal auth
):

    order = db.query(Order).filter(
        Order.razorpay_order_id == data.razorpay_order_id,
        Order.user_id == current_user["id"]
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = "Failed"

    payment = db.query(Payment).filter(
        Payment.order_id == order.id
    ).order_by(Payment.id.desc()).first()

    if payment:
        payment.status = "Failed"
        payment.failure_reason = data.reason

    db.commit()

    return {"status": "failed_recorded"}


# ============================================================
# RETRY PAYMENT
# ============================================================
@router.post("/retry-payment")
def retry_payment(
    razorpay_order_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    order = db.query(Order).filter(
        Order.razorpay_order_id == razorpay_order_id,
        Order.user_id == current_user["id"]
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Create new Razorpay order
    razorpay_order = razorpay_client.order.create({
        "amount": int(order.amount * 100),
        "currency": "INR",
        "payment_capture": 1
    })

    order.razorpay_order_id = razorpay_order["id"]
    order.status = "Pending"

    # Create NEW Payment attempt
    new_payment = Payment(
        order_id=order.id,
        user_id=order.user_id,   # ✅ FIXED
        amount=order.amount,
        status="Pending",
        payment_method="Razorpay"
    )

    db.add(new_payment)
    db.commit()

    return razorpay_order


# ============================================================
# ADMIN ROUTES (UNCHANGED LOGIC)
# ============================================================
@router.get("/admin/all-payments")
def get_all_payments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    return db.query(Payment).order_by(Payment.id.desc()).all()


@router.get("/admin/failed-payments")
def get_failed_payments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    return db.query(Payment)\
        .filter(Payment.status == "Failed")\
        .order_by(Payment.id.desc())\
        .all()


@router.get("/admin/success-payments")
def get_success_payments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    return db.query(Payment)\
        .filter(Payment.status == "Success")\
        .order_by(Payment.id.desc())\
        .all()


@router.get("/admin/dashboard")
def admin_dashboard(
    start_date: str = Query(None),
    end_date: str = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):

    # 🔹 Base query (only successful payments)
    revenue_query = db.query(Payment).filter(
        Payment.status == "Success"
    )

    # 🔹 Apply date range filter if provided
    if start_date and end_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")

            revenue_query = revenue_query.filter(
                Payment.created_at.between(start, end)
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")

    # 🔹 Revenue Calculations
    total_revenue = revenue_query.with_entities(
        func.sum(Payment.amount)
    ).scalar() or 0

    total_success = revenue_query.with_entities(
        func.count(Payment.id)
    ).scalar() or 0

    total_failed = db.query(func.count(Payment.id))\
        .filter(Payment.status == "Failed")\
        .scalar() or 0

    total_transactions = db.query(func.count(Payment.id)).scalar() or 0

    # 🔹 Monthly Revenue (Current Month)
    current_month = datetime.utcnow().month

    monthly_revenue = db.query(func.sum(Payment.amount))\
        .filter(
            Payment.status == "Success",
            extract('month', Payment.created_at) == current_month
        ).scalar() or 0

    # 🔹 Today's Revenue
    today = date.today()

    today_revenue = db.query(func.sum(Payment.amount))\
        .filter(
            Payment.status == "Success",
            func.date(Payment.created_at) == today
        ).scalar() or 0

    avg_order_value = (
        float(total_revenue) / total_success
        if total_success > 0 else 0
    )

    # 🔹 Orders + Users
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0

    # 🔹 Latest 5 Payments
    latest_payments = db.query(Payment)\
        .order_by(Payment.created_at.desc())\
        .limit(5)\
        .all()

    latest_data = [
        {
            "id": p.id,
            "amount": p.amount,
            "status": p.status,
            "method": p.payment_method,
            "created_at": p.created_at
        }
        for p in latest_payments
    ]

    return {
        "total_revenue": float(total_revenue),
        "monthly_revenue": float(monthly_revenue),
        "today_revenue": float(today_revenue),
        "total_success": total_success,
        "total_failed": total_failed,
        "total_transactions": total_transactions,
        "avg_order_value": round(avg_order_value, 2),
        "total_orders": total_orders,
        "total_users": total_users,
        "latest_payments": latest_data
    }


@router.get("/admin/export-payments")
def export_payments(
    start_date: str = Query(None),
    end_date: str = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):

    query = db.query(Payment)

    if start_date and end_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(Payment.created_at.between(start, end))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")

    payments = query.order_by(Payment.created_at.desc()).all()

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow(["ID", "User ID", "Amount", "Status", "Method", "Date"])

    for p in payments:
        writer.writerow([
            p.id,
            p.user_id,
            p.amount,
            p.status,
            p.payment_method,
            p.created_at
        ])

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=payments.csv"}
    )
    
# ============================================================ #
# ADDED SHIPPING ROUTES 
# ============================================================ #

@router.put("/admin/update-shipping/{order_id}")
def update_shipping_status(
    order_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.shipping_status = new_status

    if new_status == "Shipped":
        order.estimated_delivery = datetime.utcnow() + timedelta(days=4)

    if new_status == "Delivered":
        order.delivered_at = datetime.utcnow()
        order.return_deadline = datetime.utcnow() + timedelta(days=7)

    db.commit()

    return {"message": "Shipping status updated"}

@router.get("/orders/{order_id}")
def get_order_details(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user["id"]
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "id": order.id,
        "amount": order.amount,
        "shipping_status": order.shipping_status,
        "estimated_delivery": order.estimated_delivery,
        "delivered_at": order.delivered_at,
        "return_deadline": order.return_deadline,
        "is_refunded": order.is_refunded
    }
    
    
# ============================================================ #
# ADDED SHIPPING ROUTES (IMPROVED VERSION)
# ============================================================ #

VALID_SHIPPING_STATUSES = [
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered"
]


@router.put("/admin/update-shipping/{order_id}")
def update_shipping_status(
    order_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    if new_status not in VALID_SHIPPING_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid shipping status")

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.shipping_status = new_status

    # 🔥 Auto business logic
    if new_status == "Shipped":
        order.estimated_delivery = datetime.utcnow() + timedelta(days=4)

    if new_status == "Delivered":
        order.delivered_at = datetime.utcnow()
        order.return_deadline = datetime.utcnow() + timedelta(days=7)

    db.commit()

    return {"message": "Shipping status updated successfully"}


# ============================================================ #
# USER: GET ORDER DETAILS
# ============================================================ #
@router.get("/orders/{order_id}")
def get_order_details(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user["id"]
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "id": order.id,
        "user_email": order.user_email,
        "amount": order.amount,
        "status": order.status,
        "shipping_status": order.shipping_status,
        "estimated_delivery": order.estimated_delivery,
        "delivered_at": order.delivered_at,
        "return_deadline": order.return_deadline,
        "is_refunded": order.is_refunded,
        "refund_reason": order.refund_reason,
        "items": order.items,
        "created_at": order.created_at
    }

# ============================================================ #
# ADMIN: FETCH ALL ORDERS (IMPROVED)
# ============================================================ #

@router.get("/admin/orders")
def get_all_orders(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    orders = db.query(Order).order_by(Order.id.desc()).all()

    return [
        {
            "id": o.id,
            "amount": o.amount,
            "status": o.status,
            "shipping_status": o.shipping_status,
            "user_id": o.user_id,
            "user_email": o.user_email,
            "created_at": o.created_at,
            "estimated_delivery": o.estimated_delivery,
            "delivered_at": o.delivered_at,
            "return_deadline": o.return_deadline,
        }
        for o in orders
    ]
    
    
# ============================================================
# USER CANCEL + AUTO REFUND
# ============================================================

@router.post("/cancel-order/{order_id}")
def cancel_and_refund(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user["id"]
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # ❌ Already refunded
    if order.is_refunded:
        raise HTTPException(status_code=400, detail="Order already refunded")

    # ❌ Cannot cancel after shipped
    if order.shipping_status in ["Shipped", "Out for Delivery", "Delivered"]:
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel after shipment"
        )

    # ❌ If not paid
    if order.status != "Paid":
        order.status = "Cancelled"
        db.commit()
        return {"message": "Order cancelled"}

    # 🔥 REFUND LOGIC
    try:
        refund = razorpay_client.payment.refund(order.payment_id, {
            "amount": int(order.amount * 100)
        })

        order.status = "Cancelled"
        order.is_refunded = True
        order.shipping_status = "Cancelled"

        db.commit()

        return {
            "message": "Order cancelled & refunded successfully",
            "refund_id": refund.get("id")
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Refund failed: {str(e)}"
        )
        
        

# ============================================================
# USER REQUEST REFUND
# ============================================================


@router.post("/request-refund/{order_id}")
def request_refund(
    order_id: int,
    data: RefundRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user["id"]
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.is_refunded:
        raise HTTPException(status_code=400, detail="Already refunded")

    if order.shipping_status != "Delivered":
        raise HTTPException(status_code=400, detail="Return only after delivery")

    order.status = "Refund Requested"
    order.refund_reason = data.reason
    order.refund_requested_at = datetime.utcnow()

    db.commit()

    return {"message": "Refund request submitted"}


# ============================================================
# ADMIN APPROVE REFUND
# ============================================================

@router.post("/admin/approve-refund/{order_id}")
def approve_refund(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != "Refund Requested":
        raise HTTPException(status_code=400, detail="No refund request found")

    if order.is_refunded:
        raise HTTPException(status_code=400, detail="Already refunded")

    # 🔥 Get successful payment record
    payment = db.query(Payment).filter(
        Payment.order_id == order.id,
        Payment.status == "Success"
    ).first()

    if not payment:
        raise HTTPException(status_code=400, detail="Payment not found")

    try:
        refund = razorpay_client.payment.refund(payment.payment_id, {
            "amount": int(payment.amount * 100)
        })

        order.is_refunded = True
        order.status = "Refunded"
        order.refund_approved_at = datetime.utcnow()
        order.refund_id = refund.get("id")

        db.commit()

        return {
            "message": "Refund approved successfully",
            "refund_id": refund.get("id")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# ===============================
# ADMIN – GET REFUND REQUESTS
# ===============================
@router.get("/admin/refund-requests")
def get_refund_requests(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    orders = db.query(Order).filter(
        Order.status == "Refund Requested"
    ).all()

    return [
        {
            "id": o.id,
            "user_email": o.user_email,
            "amount": o.amount,
            "reason": o.refund_reason,
            "shipping_status": o.shipping_status,
            "created_at": o.created_at
        }
        for o in orders
    ]

@router.get("/admin/refund-history")
def refund_history(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    orders = db.query(Order).filter(
        Order.is_refunded == True
    ).order_by(Order.refund_approved_at.desc()).all()

    return [
        {
            "id": o.id,
            "user_email": o.user_email,
            "amount": o.amount,
            "refund_id": o.refund_id,
            "approved_at": o.refund_approved_at
        }
        for o in orders
    ]
    

# ============================================================
# ADMIN DASHBOARD (🔥 UPDATED WITH RESALE STATS)
# ============================================================

@router.get("/admin/dashboard")
def admin_dashboard(
    start_date: str = Query(None),
    end_date: str = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):

    revenue_query = db.query(Payment).filter(Payment.status == "Success")

    if start_date and end_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
            revenue_query = revenue_query.filter(
                Payment.created_at.between(start, end)
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")

    total_revenue = revenue_query.with_entities(
        func.sum(Payment.amount)
    ).scalar() or 0

    total_success = revenue_query.with_entities(
        func.count(Payment.id)
    ).scalar() or 0

    total_failed = db.query(func.count(Payment.id))\
        .filter(Payment.status == "Failed")\
        .scalar() or 0

    total_transactions = db.query(func.count(Payment.id)).scalar() or 0

    current_month = datetime.utcnow().month

    monthly_revenue = db.query(func.sum(Payment.amount))\
        .filter(
            Payment.status == "Success",
            extract('month', Payment.created_at) == current_month
        ).scalar() or 0

    today_revenue = db.query(func.sum(Payment.amount))\
        .filter(
            Payment.status == "Success",
            func.date(Payment.created_at) == date.today()
        ).scalar() or 0

    avg_order_value = (
        float(total_revenue) / total_success
        if total_success > 0 else 0
    )

    # 🔥 ORDERS + USERS
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0

    # 🔥 RESALE STATS (NEW)
    total_resale_listed = db.query(ResaleProduct)\
        .filter(ResaleProduct.is_listed == True)\
        .count()

    total_resale_sold = db.query(ResaleProduct)\
        .filter(ResaleProduct.status == "Sold")\
        .count()

    latest_payments = db.query(Payment)\
        .order_by(Payment.created_at.desc())\
        .limit(5)\
        .all()

    latest_data = [
        {
            "id": p.id,
            "amount": p.amount,
            "status": p.status,
            "method": p.payment_method,
            "created_at": p.created_at
        }
        for p in latest_payments
    ]

    return {
        "total_revenue": float(total_revenue),
        "monthly_revenue": float(monthly_revenue),
        "today_revenue": float(today_revenue),
        "total_success": total_success,
        "total_failed": total_failed,
        "total_transactions": total_transactions,
        "avg_order_value": round(avg_order_value, 2),
        "total_orders": total_orders,
        "total_users": total_users,

        # 🔥 NEW FIELDS
        "total_resale_listed": total_resale_listed,
        "total_resale_sold": total_resale_sold,

        "latest_payments": latest_data
    }