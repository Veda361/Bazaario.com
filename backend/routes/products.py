from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models.product import Product
from dependencies.auth import get_current_user, admin_required
from schemas.product import ProductOut, ProductUpdate
from database import get_db
import cloudinary.uploader
import math

router = APIRouter()


# =========================
# CREATE PRODUCT (WITH IMAGE UPLOAD)
# =========================
@router.post("/", response_model=ProductOut)
async def create_product(
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    category: str = Form(...),
    subcategory: str = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user.role not in ["admin", "seller"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    image_url = None

    if image:
        upload_result = cloudinary.uploader.upload(
            image.file, folder="bazaario/products"
        )
        image_url = upload_result.get("secure_url")

    product = Product(
        title=title,
        description=description,
        price=price,
        stock=stock,
        category=category,
        subcategory=subcategory,
        seller_id=user.id,
        image_url=image_url,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


# =========================
# GET PRODUCTS (Search + Filters + Pagination)
# =========================
@router.get("/")
def get_products(
    search: str | None = Query(None),
    category: str | None = Query(None),
    subcategory: str | None = Query(None),
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    in_stock: bool | None = Query(None),
    min_stock: int | None = Query(None, ge=0),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sort_by: str = Query("id", pattern="^(id|price|stock|title)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    query = db.query(Product)

    if search:
        query = query.filter(
            or_(
                Product.title.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%"),
            )
        )

    if category:
        query = query.filter(Product.category == category)

    if subcategory:
        query = query.filter(Product.subcategory == subcategory)

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if in_stock:
        query = query.filter(Product.stock > 0)

    if min_stock is not None:
        query = query.filter(Product.stock >= min_stock)

    sort_column = getattr(Product, sort_by)
    query = query.order_by(
        sort_column.desc() if order == "desc" else sort_column.asc()
    )

    total = query.count()
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "items": products,
    }


# =========================
# ADMIN – GET RESALE PRODUCTS
# =========================
@router.get("/admin/resale-products")
def get_resale_products(
    db: Session = Depends(get_db),
    current_user=Depends(admin_required)
):
    from models.resale_product import ResaleProduct

    products = db.query(ResaleProduct)\
        .order_by(ResaleProduct.id.desc())\
        .all()

    return products


# =========================
# GET PRODUCT BY ID
# =========================
@router.get("/{product_id}", response_model=ProductOut)
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


# =========================
# UPDATE PRODUCT
# =========================
@router.put("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: int,
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    stock: int = Form(...),
    category: str = Form(...),
    subcategory: str = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.seller_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    product.title = title
    product.description = description
    product.price = price
    product.stock = stock
    product.category = category
    product.subcategory = subcategory

    if image:
        upload_result = cloudinary.uploader.upload(
            image.file, folder="bazaario/products"
        )
        product.image_url = upload_result.get("secure_url")

    db.commit()
    db.refresh(product)

    return product


# =========================
# DELETE PRODUCT
# =========================
@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.seller_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    db.delete(product)
    db.commit()

    return {"detail": "Product deleted"}