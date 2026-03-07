from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from database import Base


class ResaleProduct(Base):
    __tablename__ = "resale_products"

    id = Column(Integer, primary_key=True, index=True)

    # User who wants to sell
    seller_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)

    title = Column(String, nullable=False)
    description = Column(String, nullable=False)

    category = Column(String, nullable=False)
    subcategory = Column(String, nullable=True)

    expected_price = Column(Float, nullable=False)
    admin_price = Column(Float, nullable=True)

    condition = Column(String, nullable=False)  # Like New, Good, Fair

    image_url = Column(String, nullable=True)

    status = Column(String, default="Pending")  
    # Pending | Approved | Rejected | Sold

    is_listed = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())