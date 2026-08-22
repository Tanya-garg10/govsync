"""Pydantic request/response schemas."""
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel


# ---------- Auth ----------
class LoginRequest(BaseModel):
    role: str  # citizen | official | admin
    citizen_id: Optional[str] = None
    department: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: str
    name: str
    role: str
    citizen_id: Optional[str] = None
    department: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- Citizen / registries ----------
class CitizenOut(BaseModel):
    id: str
    name: str
    dob: Optional[str] = None
    mobile: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    photo_initials: Optional[str] = None

    class Config:
        from_attributes = True


class DocumentOut(BaseModel):
    id: str
    type: str
    name: str
    verified: bool

    class Config:
        from_attributes = True


# ---------- Services ----------
class ServiceOut(BaseModel):
    id: str
    name: str
    category: Optional[str]
    department: Optional[str]
    processing_time: Optional[str]
    eligibility: Optional[str]
    required_info: List[str] = []
    required_docs: List[str] = []
    integrated: bool

    class Config:
        from_attributes = True


# ---------- Consents ----------
class ConsentCreate(BaseModel):
    citizen_id: str
    data_requested: List[str]
    purpose: str
    department: str
    expiry: Optional[str] = None


class ConsentOut(BaseModel):
    id: str
    citizen_id: str
    data_requested: List[str]
    purpose: str
    department: str
    timestamp: datetime
    status: str
    expiry: Optional[str]

    class Config:
        from_attributes = True


# ---------- Applications ----------
class ApplicationCreate(BaseModel):
    citizen_id: str
    service_id: str
    consent_id: Optional[str] = None  # if omitted, one is auto-created


class WorkflowStepOut(BaseModel):
    step: str
    system: str
    status: str
    timestamp: Optional[datetime]
    duration: Optional[str]

    class Config:
        from_attributes = True


class ApplicationOut(BaseModel):
    id: str
    citizen_id: str
    service_id: str
    service_name: str
    department: str
    status: str
    current_stage: str
    assigned_officer: str
    sla_target_days: float
    created_at: datetime
    updated_at: datetime
    timeline: List[WorkflowStepOut] = []

    class Config:
        from_attributes = True


class DecisionRequest(BaseModel):
    decision: str  # Approved | Rejected


# ---------- Connectors ----------
class ConnectorCreate(BaseModel):
    id: Optional[str] = None
    name: str
    department: str
    endpoint: str
    auth_type: str
    connector_type: str = "REST API"


class ConnectorOut(BaseModel):
    id: str
    name: str
    department: Optional[str]
    endpoint: Optional[str]
    auth_type: Optional[str]
    status: str
    last_sync: datetime
    requests_today: int
    error_count: int
    connector_type: str

    class Config:
        from_attributes = True


# ---------- Monitoring / audit ----------
class IntegrationRequestOut(BaseModel):
    api_name: str
    status: str
    detail: str
    timestamp: datetime

    class Config:
        from_attributes = True


class AuditLogOut(BaseModel):
    timestamp: datetime
    user: str
    action: str
    purpose: str
    system: str
    consent: str
    status: str

    class Config:
        from_attributes = True


# ---------- Exceptions ----------
class ExceptionOut(BaseModel):
    id: str
    api_name: str
    status: str
    error: str
    attempts: int
    request_id: str
    citizen_id: Optional[str]
    queued: bool

    class Config:
        from_attributes = True


# ---------- Notifications ----------
class NotificationOut(BaseModel):
    id: int
    citizen_id: str
    message: str
    timestamp: datetime
    read: bool

    class Config:
        from_attributes = True


# ---------- Grievances ----------
class GrievanceCreate(BaseModel):
    citizen_id: str
    subject: str
    department: str


class GrievanceOut(BaseModel):
    id: str
    citizen_id: str
    subject: str
    department: str
    status: str
    submitted_at: datetime

    class Config:
        from_attributes = True


# ---------- Data quality ----------
class DataQualityIssueOut(BaseModel):
    id: int
    issue_type: str
    description: str
    record_a: Optional[Any]
    record_b: Optional[Any]
    similarity: Optional[int]
    resolved: bool

    class Config:
        from_attributes = True


class DataQualitySummary(BaseModel):
    valid_pct: float
    duplicate: int
    missing: int
    invalid: int
    conflicting: int


# ---------- SLA ----------
class SLAOut(BaseModel):
    service_name: str
    target_days: float
    average_days: float
    compliance_pct: float

    class Config:
        from_attributes = True


TokenResponse.model_rebuild()
