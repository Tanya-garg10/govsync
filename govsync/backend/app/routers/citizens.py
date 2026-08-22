from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/citizens", tags=["citizens"])


@router.get("/{citizen_id}", response_model=schemas.CitizenOut)
def get_citizen(citizen_id: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    c = db.query(models.Citizen).get(citizen_id)
    if not c:
        raise HTTPException(404, "Citizen not found")
    return c


@router.get("/{citizen_id}/documents", response_model=list[schemas.DocumentOut])
def get_citizen_documents(citizen_id: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    return db.query(models.DocumentRecord).filter(models.DocumentRecord.citizen_id == citizen_id).all()
