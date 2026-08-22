from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/sla", tags=["sla"])


@router.get("", response_model=list[schemas.SLAOut])
def list_sla(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    return db.query(models.SLARecord).all()
