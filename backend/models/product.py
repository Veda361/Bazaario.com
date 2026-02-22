from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database import Base


class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    price = Column(Float)
    stock = Column(Integer)
    seller_id = Column(Integer, ForeignKey("users.id"))
    
    