from pydantic import BaseModel
from typing import Optional
from typing import List


class ProductBase(BaseModel):
    title: str
    description: str
    price: float
    stock: int


class ProductCreate(ProductBase):
    pass


class ProductOut(ProductBase):
    id: int
    seller_id: int

    class Config:
        from_attributes = True   # for SQLAlchemy


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    
    
class PaginatedProducts(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    items: List[ProductOut]