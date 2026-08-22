from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import require_role

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.get("", response_model=list[schemas.AuditLogOut])
def list_audit_logs(
    user_filter: str | None = None,
    action: str | None = None,
    status_filter: str | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: dict = Depends(require_role("admin", "official")),
):
    query = db.query(models.AuditLog)
    if user_filter:
        query = query.filter(models.AuditLog.user.ilike(f"%{user_filter}%"))
    if action:
        query = query.filter(models.AuditLog.action == action)
    if status_filter:
        query = query.filter(models.AuditLog.status == status_filter)
    return query.order_by(models.AuditLog.timestamp.desc()).limit(limit).all()
