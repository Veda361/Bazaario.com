from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.product import Product
from dependencies.auth import get_current_user
from schemas.product import ProductCreate
from database import get_db

router = APIRouter()


@router.post("/")
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user.role not in ["admin", "seller"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    product = Product(
        title=data.title,
        description=data.description,
        price=data.price,
        stock=data.stock,
        seller_id=user.id
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product

# fetch products with pagination


@router.get("/")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products