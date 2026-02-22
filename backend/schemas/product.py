from pydantic import BaseModel


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
        from_attributes = True