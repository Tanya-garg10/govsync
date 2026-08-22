"""
The Integration Hub.

This module is the functional core of GovSync: it is what a real
middleware layer would do — call each source system's API, normalize the
response into a common data model, evaluate eligibility, write an audit
trail, and hand a finished application to the owning department's
workflow. Every "system" it calls here is a mock government API (see
routers/mock_gov.py) so the whole flow is exercised over real HTTP-shaped
function calls rather than faked in the UI.
"""
import random
from datetime import datetime
from sqlalchemy.orm import Session

from . import models


def normalize_identity(raw: models.IdentityRecord) -> dict:
    """Common Data Model mapping: registries use different field names/formats."""
    dob_parts = raw.dob.split("/")  # source format dd/mm/yyyy
    iso_dob = f"{dob_parts[2]}-{dob_parts[1]}-{dob_parts[0]}" if len(dob_parts) == 3 else raw.dob
    return {
        "name": raw.full_name,
        "date_of_birth": iso_dob,
        "gender": raw.gender,
        "address": raw.address,
    }


def log_api_call(db: Session, api_name: str, citizen_id: str, force_fail: bool = False) -> bool:
    """Simulates one outbound call to a connected system; occasionally fails
    on purpose so the Exceptions / retry-queue feature has something real to show."""
    fail = force_fail or (api_name == "Scholarship API" and random.random() < 0.12)
    if fail:
        detail = random.choice(["503 Service Unavailable", "Upstream timeout after 8000ms"])
        db.add(models.IntegrationRequest(api_name=api_name, status="FAILED", detail=detail, citizen_id=citizen_id))
        db.add(models.Exception_(
            api_name=api_name, status="FAILED", error=detail, attempts=1,
            request_id=f"REQ-{random.randint(70000,79999)}", citizen_id=citizen_id, queued=True,
        ))
    else:
        ms = random.randint(90, 260)
        db.add(models.IntegrationRequest(api_name=api_name, status="SUCCESS", detail=f"{ms} ms", citizen_id=citizen_id))
        gs = db.query(models.GovernmentSystem).filter(
            models.GovernmentSystem.name.ilike(f"%{api_name.replace(' API','')}%")
        ).first()
        if gs:
            gs.requests_today += 1
            gs.last_sync = datetime.utcnow()
    db.commit()
    return not fail


def run_integration_flow(db: Session, citizen_id: str, service: models.Service, consent: models.Consent) -> models.Application:
    """
    Executes the full cross-system flow for a service application:
    identity -> education -> income -> documents -> normalize -> eligibility
    -> submit -> hand off to department workflow.
    """
    now = datetime.utcnow()
    steps = []

    def audit(action: str, system: str):
        db.add(models.AuditLog(
            timestamp=datetime.utcnow(), user=citizen_id, action=action,
            purpose=f"{service.name} Eligibility Verification", system=system,
            consent="Granted" if consent else "—", status="SUCCESS",
        ))

    # 1. Identity
    log_api_call(db, "Identity API", citizen_id)
    identity = db.query(models.IdentityRecord).get(citizen_id)
    audit("Data Access — Identity", "Identity Registry")
    steps.append(("Identity Verified", "Identity Registry", "0.6s"))

    # 2. Education
    log_api_call(db, "Education API", citizen_id)
    education = db.query(models.EducationRecord).get(citizen_id)
    audit("Data Access — Education", "Education Registry")
    steps.append(("Education Verified", "Education Registry", "0.8s"))

    # 3. Income
    log_api_call(db, "Income API", citizen_id)
    income = db.query(models.IncomeRecord).get(citizen_id)
    audit("Data Access — Income", "Income Registry")
    steps.append(("Income Verified", "Income Registry", "0.9s"))

    # 4. Documents
    log_api_call(db, "Document API", citizen_id)
    audit("Data Access — Documents", "Document Service")
    steps.append(("Documents Checked", "Document Service", "1.1s"))

    # 5. Normalize (Common Data Model)
    normalized = normalize_identity(identity) if identity else {}

    # 6. Eligibility (simple rule engine: income under threshold => eligible)
    eligible = True
    if income and income.annual_income:
        eligible = int(income.annual_income) <= 500000

    # 7. Submit application + build its live timeline
    existing_count = db.query(models.Application).count()
    app_id = f"GOV-2026-{100 + existing_count + 1:05d}"
    application = models.Application(
        id=app_id, citizen_id=citizen_id, service_id=service.id, service_name=service.name,
        department=service.department, status="Submitted", current_stage="Officer Review",
        assigned_officer="Auto-assigned", sla_target_days=5, created_at=now, updated_at=now,
    )
    db.add(application)
    db.flush()

    db.add(models.WorkflowStep(application_id=app_id, sequence=0, step="Application Submitted",
                                system="GovSync Portal", status="done", timestamp=now, duration="—"))
    for i, (label, system, dur) in enumerate(steps, start=1):
        db.add(models.WorkflowStep(application_id=app_id, sequence=i, step=label, system=system,
                                    status="done", timestamp=datetime.utcnow(), duration=dur))
    db.add(models.WorkflowStep(application_id=app_id, sequence=len(steps) + 1, step="Officer Review",
                                system=service.department, status="active", timestamp=None, duration=None))
    db.add(models.WorkflowStep(application_id=app_id, sequence=len(steps) + 2, step="Approved",
                                system=service.department, status="pending", timestamp=None, duration=None))

    audit("Application Submission", "GovSync Portal")
    db.add(models.Notification(
        citizen_id=citizen_id,
        message=f"Your {service.name} application ({app_id}) has been submitted and is now under department review."
                + ("" if eligible else " Note: automated eligibility check flagged this for closer review."),
        timestamp=datetime.utcnow(), read=False,
    ))

    db.commit()
    db.refresh(application)
    return application
