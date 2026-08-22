from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/grievances", tags=["grievances"])


@router.get("", response_model=list[schemas.GrievanceOut])
def list_grievances(citizen_id: str | None = None, department: str | None = None, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    query = db.query(models.Grievance)
    if citizen_id:
        query = query.filter(models.Grievance.citizen_id == citizen_id)
    if department:
        query = query.filter(models.Grievance.department == department)
    return query.order_by(models.Grievance.submitted_at.desc()).all()


@router.post("", response_model=schemas.GrievanceOut)
def submit_grievance(payload: schemas.GrievanceCreate, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    g = models.Grievance(citizen_id=payload.citizen_id, subject=payload.subject, department=payload.department, status="Submitted")
    db.add(g)
    db.add(models.AuditLog(user=payload.citizen_id, action="Grievance Submitted", purpose=payload.subject, system="GovSync Portal", consent="—", status="SUCCESS"))
    db.commit()
    db.refresh(g)
    return g
