"""
SQLAlchemy models for GovSync.

Covers: Users, Citizens, Departments, GovernmentSystems (connectors),
Applications, Services, Documents, Consents, AuditLogs, Notifications,
Workflows, WorkflowSteps, IntegrationRequests (API logs), Exceptions,
DataQualityIssues, Grievances.
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from .database import Base


def gen_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"


class Department(Base):
    __tablename__ = "departments"
    id = Column(String, primary_key=True, default=lambda: gen_id("DEPT"))
    name = Column(String, unique=True, nullable=False)


class User(Base):
    """Login-capable account: citizen, official, or admin."""
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: gen_id("USR"))
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # citizen | official | admin
    citizen_id = Column(String, ForeignKey("citizens.id"), nullable=True)
    department = Column(String, nullable=True)
    status = Column(String, default="Active")

    citizen = relationship("Citizen", back_populates="user")


class Citizen(Base):
    __tablename__ = "citizens"
    id = Column(String, primary_key=True)  # e.g. CIT-10293
    name = Column(String, nullable=False)
    dob = Column(String)
    mobile = Column(String)
    gender = Column(String)
    address = Column(String)
    photo_initials = Column(String)

    user = relationship("User", back_populates="citizen", uselist=False)
    applications = relationship("Application", back_populates="citizen")
    consents = relationship("Consent", back_populates="citizen")
    documents = relationship("DocumentRecord", back_populates="citizen")
    notifications = relationship("Notification", back_populates="citizen")
    grievances = relationship("Grievance", back_populates="citizen")


class IdentityRecord(Base):
    """Mock Identity Registry — deliberately uses its own field names."""
    __tablename__ = "registry_identity"
    citizen_id = Column(String, ForeignKey("citizens.id"), primary_key=True)
    full_name = Column(String)
    dob = Column(String)  # dd/mm/yyyy, on purpose, to demo normalization
    gender = Column(String)
    address = Column(String)
    aadhaar_ref = Column(String)


class EducationRecord(Base):
    """Mock Education Registry."""
    __tablename__ = "registry_education"
    citizen_id = Column(String, ForeignKey("citizens.id"), primary_key=True)
    institution = Column(String)
    course = Column(String)
    year = Column(String)
    marks_pct = Column(String)
    status = Column(String)


class IncomeRecord(Base):
    """Mock Income Registry."""
    __tablename__ = "registry_income"
    citizen_id = Column(String, ForeignKey("citizens.id"), primary_key=True)
    annual_income = Column(String)
    income_certificate_no = Column(String)
    issued_by = Column(String)
    valid_till = Column(String)


class DocumentRecord(Base):
    """Mock Document Service holdings for a citizen."""
    __tablename__ = "documents"
    id = Column(String, primary_key=True, default=lambda: gen_id("DOC"))
    citizen_id = Column(String, ForeignKey("citizens.id"))
    type = Column(String)
    name = Column(String)
    verified = Column(Boolean, default=False)

    citizen = relationship("Citizen", back_populates="documents")


class Service(Base):
    __tablename__ = "services"
    id = Column(String, primary_key=True)  # e.g. "scholarship"
    name = Column(String, nullable=False)
    category = Column(String)
    department = Column(String)
    processing_time = Column(String)
    eligibility = Column(String)
    required_info = Column(JSON, default=list)
    required_docs = Column(JSON, default=list)
    integrated = Column(Boolean, default=True)


class Consent(Base):
    __tablename__ = "consents"
    id = Column(String, primary_key=True, default=lambda: gen_id("CNS"))
    citizen_id = Column(String, ForeignKey("citizens.id"))
    data_requested = Column(JSON, default=list)
    purpose = Column(String)
    department = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Active")  # Active | Revoked | Expired
    expiry = Column(String)

    citizen = relationship("Citizen", back_populates="consents")


class Application(Base):
    __tablename__ = "applications"
    id = Column(String, primary_key=True)  # e.g. GOV-2026-00125
    citizen_id = Column(String, ForeignKey("citizens.id"))
    service_id = Column(String, ForeignKey("services.id"))
    service_name = Column(String)
    department = Column(String)
    status = Column(String, default="Submitted")
    current_stage = Column(String, default="Officer Review")
    assigned_officer = Column(String, default="Auto-assigned")
    sla_target_days = Column(Float, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    citizen = relationship("Citizen", back_populates="applications")
    timeline = relationship("WorkflowStep", back_populates="application", order_by="WorkflowStep.sequence")


class WorkflowStep(Base):
    """A single step in an application's live timeline (not the template)."""
    __tablename__ = "workflow_steps"
    id = Column(Integer, primary_key=True, autoincrement=True)
    application_id = Column(String, ForeignKey("applications.id"))
    sequence = Column(Integer, default=0)
    step = Column(String)
    system = Column(String)
    status = Column(String, default="pending")  # done | active | pending
    timestamp = Column(DateTime, nullable=True)
    duration = Column(String, nullable=True)

    application = relationship("Application", back_populates="timeline")


class WorkflowTemplate(Base):
    """Configured step sequence per service (admin-editable)."""
    __tablename__ = "workflow_templates"
    id = Column(Integer, primary_key=True, autoincrement=True)
    service_id = Column(String, ForeignKey("services.id"))
    sequence = Column(Integer, default=0)
    step = Column(String)
    system = Column(String)
    avg_time = Column(String)
    enabled = Column(Boolean, default=True)


class GovernmentSystem(Base):
    """A connected external system / API connector."""
    __tablename__ = "government_systems"
    id = Column(String, primary_key=True)  # e.g. "identity"
    name = Column(String, nullable=False)
    department = Column(String)
    endpoint = Column(String)
    auth_type = Column(String)
    status = Column(String, default="Connected")  # Connected | Warning | Disconnected
    last_sync = Column(DateTime, default=datetime.utcnow)
    requests_today = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    connector_type = Column(String, default="REST API")


class IntegrationRequest(Base):
    """Row-level API call log used by the monitoring dashboard."""
    __tablename__ = "integration_requests"
    id = Column(Integer, primary_key=True, autoincrement=True)
    api_name = Column(String)
    status = Column(String)  # SUCCESS | FAILED
    detail = Column(String)  # e.g. "124 ms" or "503 Service Unavailable"
    citizen_id = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


class Exception_(Base):
    """Failed integration requests awaiting retry (table name avoids the Python keyword)."""
    __tablename__ = "exceptions"
    id = Column(String, primary_key=True, default=lambda: gen_id("EXC"))
    api_name = Column(String)
    status = Column(String, default="FAILED")
    error = Column(String)
    attempts = Column(Integer, default=1)
    request_id = Column(String)
    citizen_id = Column(String, nullable=True)
    queued = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user = Column(String)  # citizen id, "admin", or officer name
    action = Column(String)
    purpose = Column(String)
    system = Column(String)
    consent = Column(String, default="—")
    status = Column(String, default="SUCCESS")


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, autoincrement=True)
    citizen_id = Column(String, ForeignKey("citizens.id"))
    message = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    read = Column(Boolean, default=False)

    citizen = relationship("Citizen", back_populates="notifications")


class Grievance(Base):
    __tablename__ = "grievances"
    id = Column(String, primary_key=True, default=lambda: gen_id("GRV"))
    citizen_id = Column(String, ForeignKey("citizens.id"))
    subject = Column(String)
    department = Column(String)
    status = Column(String, default="Submitted")
    submitted_at = Column(DateTime, default=datetime.utcnow)

    citizen = relationship("Citizen", back_populates="grievances")


class DataQualityIssue(Base):
    __tablename__ = "data_quality_issues"
    id = Column(Integer, primary_key=True, autoincrement=True)
    issue_type = Column(String)  # duplicate | missing | invalid | conflicting
    description = Column(String)
    record_a = Column(JSON, nullable=True)
    record_b = Column(JSON, nullable=True)
    similarity = Column(Integer, nullable=True)
    resolved = Column(Boolean, default=False)


class SLARecord(Base):
    __tablename__ = "sla_records"
    id = Column(Integer, primary_key=True, autoincrement=True)
    service_name = Column(String)
    target_days = Column(Float)
    average_days = Column(Float)
    compliance_pct = Column(Float)
