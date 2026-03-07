from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class OrderResponse(BaseModel):
    id: int
    status: str
    payment_id: Optional[str]
    transaction_time: Optional[datetime]

    class Config:
        orm_mode = True


class PaymentResponse(BaseModel):
    id: int
    order_id: int
    amount: float
    status: str
    failure_reason: Optional[str]

    class Config:
        orm_mode = True


class DashboardStats(BaseModel):
    total_orders: int
    paid_orders: int
    pending_orders: int
    failed_payments: int
    total_spent: float


class DashboardResponse(BaseModel):
    user_id: int
    email: str
    stats: DashboardStats
    orders: List[OrderResponse]
    failed_payments: List[PaymentResponse]