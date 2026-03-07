from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    amount = Column(Float, nullable=False)

    status = Column(String, default="Pending")  
    # Pending | Success | Failed

    payment_id = Column(String, nullable=True)

    failure_reason = Column(String, nullable=True)
    payment_method = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 🔥 Relationship
    order = relationship("Order", back_populates="payments")