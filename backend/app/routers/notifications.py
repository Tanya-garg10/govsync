from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=list[schemas.NotificationOut])
def list_notifications(citizen_id: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    return (
        db.query(models.Notification)
        .filter(models.Notification.citizen_id == citizen_id)
        .order_by(models.Notification.timestamp.desc())
        .all()
    )


@router.post("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    n = db.query(models.Notification).get(notification_id)
    if not n:
        raise HTTPException(404, "Notification not found")
    n.read = True
    db.commit()
    return {"ok": True}


@router.post("/read-all")
def mark_all_read(citizen_id: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    db.query(models.Notification).filter(models.Notification.citizen_id == citizen_id).update({"read": True})
    db.commit()
    return {"ok": True}
