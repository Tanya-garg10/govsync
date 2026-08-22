from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import require_role

router = APIRouter(prefix="/api/connectors", tags=["connectors"])


@router.get("", response_model=list[schemas.ConnectorOut])
def list_connectors(db: Session = Depends(get_db), user: dict = Depends(require_role("admin"))):
    return db.query(models.GovernmentSystem).all()


@router.post("", response_model=schemas.ConnectorOut)
def register_connector(payload: schemas.ConnectorCreate, db: Session = Depends(get_db), user: dict = Depends(require_role("admin"))):
    cid = payload.id or payload.name.lower().replace(" ", "-")
    if db.query(models.GovernmentSystem).get(cid):
        raise HTTPException(400, "A connector with this id already exists")
    conn = models.GovernmentSystem(
        id=cid, name=payload.name, department=payload.department, endpoint=payload.endpoint,
        auth_type=payload.auth_type, connector_type=payload.connector_type,
        status="Connected", last_sync=datetime.utcnow(), requests_today=0, error_count=0,
    )
    db.add(conn)
    db.add(models.AuditLog(
        user="admin", action=f"System Registered: {payload.name}", purpose="Onboarding",
        system=payload.name, consent="—", status="SUCCESS",
    ))
    db.commit()
    db.refresh(conn)
    return conn
