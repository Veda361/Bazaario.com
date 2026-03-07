from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship
from database import Base
from datetime import timedelta


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_email = Column(String, nullable=False)

    razorpay_order_id = Column(String, index=True)
    payment_id = Column(String, nullable=True)

    amount = Column(Float, nullable=False)
    status = Column(String, default="Pending")

    # 🔥 NEW TRACKING FIELDS
    shipping_status = Column(String, default="Processing")
    estimated_delivery = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    return_deadline = Column(DateTime(timezone=True), nullable=True)
    is_refunded = Column(Boolean, default=False)

    payment_method = Column(String, nullable=True)
    transaction_time = Column(DateTime(timezone=True), nullable=True)

    items = Column(JSON)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    payments = relationship("Payment", back_populates="order", cascade="all, delete")
    
    # 🔥 REFUND FIELDS
    refund_reason = Column(String, nullable=True)
    refund_requested_at = Column(DateTime(timezone=True), nullable=True)
    refund_approved_at = Column(DateTime(timezone=True), nullable=True)
    refund_id = Column(String, nullable=True)
    
    
    #notify by the user from admin
    # notify_status=Column(String, )