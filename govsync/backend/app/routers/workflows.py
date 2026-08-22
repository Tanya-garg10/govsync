from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..auth import require_role

router = APIRouter(prefix="/api/workflows", tags=["workflows"])


@router.get("/{service_id}")
def get_workflow_template(service_id: str, db: Session = Depends(get_db), user: dict = Depends(require_role("admin"))):
    steps = (
        db.query(models.WorkflowTemplate)
        .filter(models.WorkflowTemplate.service_id == service_id)
        .order_by(models.WorkflowTemplate.sequence)
        .all()
    )
    return [{"step": s.step, "system": s.system, "avg_time": s.avg_time, "enabled": s.enabled} for s in steps]
