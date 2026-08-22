from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/services", tags=["services"])


@router.get("", response_model=list[schemas.ServiceOut])
def list_services(category: str | None = None, q: str | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Service)
    if category and category != "All":
        query = query.filter(models.Service.category == category)
    if q:
        query = query.filter(models.Service.name.ilike(f"%{q}%"))
    return query.all()


@router.get("/{service_id}", response_model=schemas.ServiceOut)
def get_service(service_id: str, db: Session = Depends(get_db)):
    s = db.query(models.Service).get(service_id)
    if not s:
        raise HTTPException(404, "Service not found")
    return s
