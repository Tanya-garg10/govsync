from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    if payload.role == "citizen":
        if not payload.citizen_id:
            raise HTTPException(400, "citizen_id is required for role=citizen")
        citizen = db.query(models.Citizen).get(payload.citizen_id)
        if not citizen:
            raise HTTPException(404, "Unknown demo citizen")
        claims = {"sub": citizen.id, "role": "citizen", "citizen_id": citizen.id, "name": citizen.name}
    elif payload.role == "official":
        dept = payload.department or "Dept. of Education"
        claims = {"sub": f"official:{dept}", "role": "official", "department": dept, "name": "Dept. Reviewer"}
    elif payload.role == "admin":
        claims = {"sub": "admin", "role": "admin", "name": "System Administrator"}
    else:
        raise HTTPException(400, "role must be citizen, official, or admin")

    token = create_access_token(claims)
    user = schemas.UserOut(
        id=claims["sub"], name=claims["name"], role=claims["role"],
        citizen_id=claims.get("citizen_id"), department=claims.get("department"),
    )
    return schemas.TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=schemas.UserOut)
def me(user: dict = Depends(get_current_user)):
    return schemas.UserOut(
        id=user["sub"], name=user.get("name", ""), role=user["role"],
        citizen_id=user.get("citizen_id"), department=user.get("department"),
    )
