"""
Mock Government APIs.

These endpoints simulate the independent registries GovSync integrates
with (Identity, Education, Income, Documents, Scholarship). In a real
deployment these would be separate systems run by separate departments;
here they live in the same database for the prototype, but are exposed
as their own versioned API surface with their own (deliberately
inconsistent) field names — exactly what the Common Data Model page
normalizes.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..auth import get_current_user
from ..hub import log_api_call

router = APIRouter(prefix="/api", tags=["mock government APIs"])


@router.get("/identity/{citizen_id}")
def get_identity(citizen_id: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    log_api_call(db, "Identity API", citizen_id)
    rec = db.query(models.IdentityRecord).get(citizen_id)
    if not rec:
        raise HTTPException(404, "No identity record for this citizen")
    return {"full_name": rec.full_name, "dob": rec.dob, "gender": rec.gender, "address": rec.address, "aadhaar_ref": rec.aadhaar_ref}


@router.get("/education/{citizen_id}")
def get_education(citizen_id: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    log_api_call(db, "Education API", citizen_id)
    rec = db.query(models.EducationRecord).get(citizen_id)
    if not rec:
        raise HTTPException(404, "No education record for this citizen")
    return {"institution": rec.institution, "course": rec.course, "year": rec.year, "marks_pct": rec.marks_pct, "status": rec.status}


@router.get("/income/{citizen_id}")
def get_income(citizen_id: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    log_api_call(db, "Income API", citizen_id)
    rec = db.query(models.IncomeRecord).get(citizen_id)
    if not rec:
        raise HTTPException(404, "No income record for this citizen")
    return {"annual_income": rec.annual_income, "income_certificate_no": rec.income_certificate_no, "issued_by": rec.issued_by, "valid_till": rec.valid_till}


@router.get("/documents/{citizen_id}")
def get_documents(citizen_id: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    log_api_call(db, "Document API", citizen_id)
    docs = db.query(models.DocumentRecord).filter(models.DocumentRecord.citizen_id == citizen_id).all()
    return [{"type": d.type, "name": d.name, "verified": d.verified} for d in docs]


@router.get("/notifications/{citizen_id}")
def get_notifications_mock(citizen_id: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    notifs = db.query(models.Notification).filter(models.Notification.citizen_id == citizen_id).all()
    return [{"message": n.message, "timestamp": n.timestamp.isoformat(), "read": n.read} for n in notifs]


@router.get("/application/{application_id}")
def get_application_mock(application_id: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    app_ = db.query(models.Application).get(application_id)
    if not app_:
        raise HTTPException(404, "Application not found")
    return {"id": app_.id, "status": app_.status, "current_stage": app_.current_stage}
