from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.review import Review
from pydantic import BaseModel

router = APIRouter(prefix="/reviews", tags=["reviews"])


class ReviewCreate(BaseModel):
    product_id: int
    user_id: str
    username: str
    rating: int
    comment: str


@router.get("/{product_id}")
def get_reviews(product_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Review)
        .filter(Review.product_id == product_id)
        .order_by(Review.id.desc())
        .all()
    )


@router.post("/")
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    new_review = Review(**review.dict())

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return new_review