from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/consents", tags=["consents"])


@router.get("", response_model=list[schemas.ConsentOut])
def list_consents(citizen_id: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    return (
        db.query(models.Consent)
        .filter(models.Consent.citizen_id == citizen_id)
        .order_by(models.Consent.timestamp.desc())
        .all()
    )


@router.post("", response_model=schemas.ConsentOut)
def create_consent(payload: schemas.ConsentCreate, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    expiry = payload.expiry or (datetime.utcnow() + timedelta(days=90)).date().isoformat()
    consent = models.Consent(
        citizen_id=payload.citizen_id, data_requested=payload.data_requested,
        purpose=payload.purpose, department=payload.department, status="Active", expiry=expiry,
    )
    db.add(consent)
    db.add(models.AuditLog(
        user=payload.citizen_id, action="Consent Granted", purpose=payload.purpose,
        system="GovSync Portal", consent="Granted", status="SUCCESS",
    ))
    db.commit()
    db.refresh(consent)
    return consent


@router.post("/{consent_id}/revoke", response_model=schemas.ConsentOut)
def revoke_consent(consent_id: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    consent = db.query(models.Consent).get(consent_id)
    if not consent:
        raise HTTPException(404, "Consent not found")
    consent.status = "Revoked"
    db.add(models.AuditLog(
        user=consent.citizen_id, action="Consent Revoked", purpose=consent.purpose,
        system="GovSync Portal", consent="Revoked", status="SUCCESS",
    ))
    db.commit()
    db.refresh(consent)
    return consent
