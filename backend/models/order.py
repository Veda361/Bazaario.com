from sqlalchemy import Column, Integer, Float, String, ForeignKey
from database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_amount = Column(Float)
    payment_id = Column(String)
    status = Column(String, default="pending")