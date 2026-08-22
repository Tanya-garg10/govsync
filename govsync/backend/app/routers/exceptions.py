from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import require_role

router = APIRouter(prefix="/api/exceptions", tags=["exceptions"])


@router.get("", response_model=list[schemas.ExceptionOut])
def list_exceptions(db: Session = Depends(get_db), user: dict = Depends(require_role("admin"))):
    return db.query(models.Exception_).order_by(models.Exception_.created_at.desc()).all()


@router.post("/{exception_id}/retry")
def retry_exception(exception_id: str, db: Session = Depends(get_db), user: dict = Depends(require_role("admin"))):
    exc = db.query(models.Exception_).get(exception_id)
    if not exc:
        raise HTTPException(404, "Exception not found")
    db.add(models.IntegrationRequest(api_name=exc.api_name, status="SUCCESS", detail="Recovered on retry", citizen_id=exc.citizen_id))
    db.add(models.AuditLog(user="admin", action="Exception Retried — Success", purpose="Recovery", system=exc.api_name, consent="—", status="SUCCESS"))
    db.delete(exc)
    db.commit()
    return {"ok": True}


@router.post("/{exception_id}/queue")
def queue_exception(exception_id: str, db: Session = Depends(get_db), user: dict = Depends(require_role("admin"))):
    exc = db.query(models.Exception_).get(exception_id)
    if not exc:
        raise HTTPException(404, "Exception not found")
    exc.attempts += 1
    exc.queued = True
    db.commit()
    return {"ok": True, "attempts": exc.attempts}
