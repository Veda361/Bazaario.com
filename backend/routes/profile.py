from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.order import Order
from models.payment import Payment
from firebase_admin_setup import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Profile"])


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]

    orders = db.query(Order)\
        .filter(Order.user_id == user_id)\
        .order_by(Order.id.desc())\
        .all()

    payments = db.query(Payment)\
        .filter(Payment.user_id == user_id)\
        .order_by(Payment.id.desc())\
        .all()

    total_orders = len(orders)
    paid_orders = len([o for o in orders if o.status == "Paid"])
    pending_orders = len([o for o in orders if o.status == "Pending"])
    failed_payments = len([p for p in payments if p.status == "Failed"])
    total_spent = sum([p.amount for p in payments if p.status == "Success"])

    orders_data = [
        {
            "id": o.id,
            "amount": o.amount,
            "status": o.status,
            "shipping_status": o.shipping_status,
            "estimated_delivery": o.estimated_delivery,
            "delivered_at": o.delivered_at,
            "return_deadline": o.return_deadline,
            "created_at": o.created_at,
            "items": o.items   # 🔥 IMPORTANT (Resale detection)
        }
        for o in orders
    ]

    failed_payments_data = [
        {
            "id": p.id,
            "order_id": p.order_id,
            "failure_reason": p.failure_reason,
            "created_at": p.created_at,
        }
        for p in payments if p.status == "Failed"
    ]

    return {
        "user_id": user_id,
        "email": current_user["email"],
        "stats": {
            "total_orders": total_orders,
            "paid_orders": paid_orders,
            "pending_orders": pending_orders,
            "failed_payments": failed_payments,
            "total_spent": total_spent,
        },
        "orders": orders_data,
        "failed_payments": failed_payments_data
    }