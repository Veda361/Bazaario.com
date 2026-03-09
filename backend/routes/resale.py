from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models.resale_product import ResaleProduct
from dependencies.auth import get_current_user, admin_required
import cloudinary.uploader

router = APIRouter(tags=["Resale"])


# =========================================
# USER: SUBMIT SELL REQUEST
# =========================================
@router.post("/sell")
async def sell_product(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    subcategory: str = Form(None),
    expected_price: float = Form(...),
    condition: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    image_url = None

    # SAFE IMAGE UPLOAD
    if image:
        try:
            upload_result = cloudinary.uploader.upload(
                image.file,
                folder="bazaario/resale",
                resource_type="image"
            )
            image_url = upload_result.get("secure_url")
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Image upload failed: {str(e)}"
            )

    try:
        new_product = ResaleProduct(
            seller_id=current_user["uid"],
            title=title,
            description=description,
            category=category,
            subcategory=subcategory,
            expected_price=expected_price,
            condition=condition,
            image_url=image_url,
            status="Pending",
            is_listed=False
        )

        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        return {"message": "Sell request submitted successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


# =========================================
# USER: GET THEIR RESALE HISTORY
# =========================================
@router.get("/user/history")
def get_user_resale_history(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    resale_items = (
        db.query(ResaleProduct)
        .filter(ResaleProduct.seller_id == current_user["uid"])
        .order_by(ResaleProduct.id.desc())
        .all()
    )

    return resale_items


# =========================================
# ADMIN: GET ALL SELL REQUESTS
# =========================================
@router.get("/admin/requests")
def get_sell_requests(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    return (
        db.query(ResaleProduct)
        .order_by(ResaleProduct.id.desc())
        .all()
    )


# =========================================
# ADMIN: APPROVE PRODUCT
# =========================================
@router.put("/admin/approve/{product_id}")
def approve_product(
    product_id: int,
    admin_price: float,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    product = (
        db.query(ResaleProduct)
        .filter(ResaleProduct.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.status = "Approved"
    product.admin_price = admin_price
    product.is_listed = True

    db.commit()

    return {"message": "Product approved & listed"}


# =========================================
# ADMIN: REJECT PRODUCT
# =========================================
@router.put("/admin/reject/{product_id}")
def reject_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    product = (
        db.query(ResaleProduct)
        .filter(ResaleProduct.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.status = "Rejected"
    product.is_listed = False

    db.commit()

    return {"message": "Product rejected"}


# =========================================
# ADMIN: GET ALL RESALE PRODUCTS
# =========================================
@router.get("/admin/all")
def get_all_resale_products(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_required)
):
    return (
        db.query(ResaleProduct)
        .order_by(ResaleProduct.id.desc())
        .all()
    )


# =========================================
# PUBLIC: GET LISTED RESALE PRODUCTS
# =========================================
@router.get("/")
def get_resale_products(
    db: Session = Depends(get_db)
):
    return (
        db.query(ResaleProduct)
        .filter(ResaleProduct.is_listed == True)
        .order_by(ResaleProduct.id.desc())
        .all()
    )