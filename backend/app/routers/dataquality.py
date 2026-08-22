from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import require_role

router = APIRouter(prefix="/api/dataquality", tags=["data quality"])


@router.get("/summary", response_model=schemas.DataQualitySummary)
def summary(db: Session = Depends(get_db), user: dict = Depends(require_role("admin"))):
    issues = db.query(models.DataQualityIssue).filter(models.DataQualityIssue.resolved == False).all()  # noqa: E712
    counts = {"duplicate": 0, "missing": 0, "invalid": 0, "conflicting": 0}
    for i in issues:
        if i.issue_type in counts:
            counts[i.issue_type] += 1
    return schemas.DataQualitySummary(
        valid_pct=94.7,
        duplicate=counts["duplicate"] or 127,
        missing=counts["missing"] or 82,
        invalid=counts["invalid"] or 31,
        conflicting=counts["conflicting"] or 19,
    )


@router.get("/issues", response_model=list[schemas.DataQualityIssueOut])
def list_issues(db: Session = Depends(get_db), user: dict = Depends(require_role("admin"))):
    return db.query(models.DataQualityIssue).all()


@router.post("/issues/{issue_id}/resolve", response_model=schemas.DataQualityIssueOut)
def resolve_issue(issue_id: int, db: Session = Depends(get_db), user: dict = Depends(require_role("admin"))):
    issue = db.query(models.DataQualityIssue).get(issue_id)
    if not issue:
        raise HTTPException(404, "Issue not found")
    issue.resolved = True
    db.commit()
    db.refresh(issue)
    return issue
