from fastapi import APIRouter, Depends
from dependencies.auth import get_current_user

router = APIRouter()


@router.get("/protected")
def protected_route(user=Depends(get_current_user)):
    return {
        "message": "User authenticated",
        "email": user.email,
        "role": user.role
    }