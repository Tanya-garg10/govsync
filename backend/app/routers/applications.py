from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user
from ..hub import run_integration_flow

router = APIRouter(prefix="/api/applications", tags=["applications"])


@router.get("", response_model=list[schemas.ApplicationOut])
def list_applications(
    citizen_id: str | None = None,
    department: str | None = None,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    query = db.query(models.Application)
    if citizen_id:
        query = query.filter(models.Application.citizen_id == citizen_id)
    if department:
        query = query.filter(models.Application.department == department)
    return query.order_by(models.Application.created_at.desc()).all()


@router.get("/{application_id}", response_model=schemas.ApplicationOut)
def get_application(application_id: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    a = db.query(models.Application).get(application_id)
    if not a:
        raise HTTPException(404, "Application not found")
    return a


@router.post("", response_model=schemas.ApplicationOut)
def create_application(payload: schemas.ApplicationCreate, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """
    This is the Integration Hub entry point: given a citizen + service,
    it calls every connected mock government API, normalizes the data,
    checks eligibility, and produces a fully-timestamped application —
    the same request a real Next.js "Apply" button, or the Demo Mode
    runner, both call.
    """
    service = db.query(models.Service).get(payload.service_id)
    if not service:
        raise HTTPException(404, "Service not found")

    consent = None
    if payload.consent_id:
        consent = db.query(models.Consent).get(payload.consent_id)
    else:
        consent = (
            db.query(models.Consent)
            .filter(models.Consent.citizen_id == payload.citizen_id, models.Consent.status == "Active")
            .order_by(models.Consent.timestamp.desc())
            .first()
        )
    if not consent:
        raise HTTPException(400, "No active consent found — grant consent before applying")

    application = run_integration_flow(db, payload.citizen_id, service, consent)
    return application


@router.post("/{application_id}/decision", response_model=schemas.ApplicationOut)
def decide_application(application_id: str, payload: schemas.DecisionRequest, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    if user.get("role") != "official":
        raise HTTPException(403, "Only department officials can approve or reject")
    app_ = db.query(models.Application).get(application_id)
    if not app_:
        raise HTTPException(404, "Application not found")
    if payload.decision not in ("Approved", "Rejected"):
        raise HTTPException(400, "decision must be Approved or Rejected")

    app_.status = payload.decision
    app_.current_stage = payload.decision
    app_.updated_at = datetime.utcnow()
    for step in app_.timeline:
        if step.status == "active":
            step.status = "done"
            step.timestamp = datetime.utcnow()
    db.add(models.WorkflowStep(
        application_id=app_.id, sequence=len(app_.timeline) + 1, step=payload.decision,
        system=app_.department, status="done", timestamp=datetime.utcnow(), duration="—",
    ))
    db.add(models.Notification(
        citizen_id=app_.citizen_id,
        message=f"Your {app_.service_name} application ({app_.id}) has been {payload.decision.lower()}.",
        timestamp=datetime.utcnow(), read=False,
    ))
    db.add(models.AuditLog(
        user=app_.citizen_id, action=payload.decision, purpose=app_.service_name,
        system=app_.department, consent="Granted", status="SUCCESS",
    ))
    db.commit()
    db.refresh(app_)
    return app_


@router.post("/{application_id}/request-docs")
def request_documents(application_id: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    if user.get("role") != "official":
        raise HTTPException(403, "Only department officials can request documents")
    app_ = db.query(models.Application).get(application_id)
    if not app_:
        raise HTTPException(404, "Application not found")
    db.add(models.Notification(
        citizen_id=app_.citizen_id,
        message=f"Additional document required for your {app_.service_name} application ({app_.id}).",
        timestamp=datetime.utcnow(), read=False,
    ))
    db.add(models.AuditLog(
        user=app_.citizen_id, action="Additional Document Requested", purpose=app_.service_name,
        system=app_.department, consent="Granted", status="SUCCESS",
    ))
    db.commit()
    return {"ok": True}
