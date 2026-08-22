"""
Seeds the database with fictional demo data only.
Do NOT put real Aadhaar numbers, bank details, or real personal
information here — see the project README.
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from . import models


def seed_if_empty(db: Session):
    if db.query(models.Citizen).first():
        return  # already seeded

    # --- Citizens ---
    citizens = [
        models.Citizen(id="CIT-10293", name="Rahul Kumar", dob="2004-04-12", mobile="+91 98xxxxx210", gender="Male", address="Sector 21, Noida, Uttar Pradesh", photo_initials="RK"),
        models.Citizen(id="CIT-10294", name="Priya Sharma", dob="2001-11-03", mobile="+91 97xxxxx884", gender="Female", address="Model Town, Ludhiana, Punjab", photo_initials="PS"),
        models.Citizen(id="CIT-10295", name="Aman Verma", dob="1999-06-27", mobile="+91 96xxxxx117", gender="Male", address="Banjara Hills, Hyderabad, Telangana", photo_initials="AV"),
    ]
    db.add_all(citizens)

    # --- Mock registries (deliberately inconsistent field formats) ---
    db.add_all([
        models.IdentityRecord(citizen_id="CIT-10293", full_name="Rahul Kumar", dob="12/04/2004", gender="M", address="Sector 21, Noida, UP", aadhaar_ref="XXXX-XXXX-2931"),
        models.IdentityRecord(citizen_id="CIT-10294", full_name="Priya Sharma", dob="03/11/2001", gender="F", address="Model Town, Ludhiana, PB", aadhaar_ref="XXXX-XXXX-4482"),
        models.IdentityRecord(citizen_id="CIT-10295", full_name="Aman Verma", dob="27/06/1999", gender="M", address="Banjara Hills, Hyderabad, TS", aadhaar_ref="XXXX-XXXX-7719"),
    ])
    db.add_all([
        models.EducationRecord(citizen_id="CIT-10293", institution="Govt. Polytechnic Noida", course="Diploma — Computer Science", year="2024", marks_pct="86.4", status="ONGOING"),
        models.EducationRecord(citizen_id="CIT-10294", institution="Punjab State University", course="B.Sc Nursing", year="2023", marks_pct="79.1", status="COMPLETED"),
        models.EducationRecord(citizen_id="CIT-10295", institution="Osmania University", course="B.Com", year="2021", marks_pct="71.8", status="COMPLETED"),
    ])
    db.add_all([
        models.IncomeRecord(citizen_id="CIT-10293", annual_income="184000", income_certificate_no="IC-UP-88213", issued_by="Revenue Dept, UP", valid_till="2027-03-31"),
        models.IncomeRecord(citizen_id="CIT-10294", annual_income="236000", income_certificate_no="IC-PB-55021", issued_by="Revenue Dept, Punjab", valid_till="2026-12-31"),
        models.IncomeRecord(citizen_id="CIT-10295", annual_income="412000", income_certificate_no="IC-TS-91120", issued_by="Revenue Dept, Telangana", valid_till="2026-09-30"),
    ])
    db.add_all([
        models.DocumentRecord(citizen_id="CIT-10293", type="Identity Proof", name="Aadhaar Card", verified=True),
        models.DocumentRecord(citizen_id="CIT-10293", type="Address Proof", name="Domicile Certificate", verified=True),
        models.DocumentRecord(citizen_id="CIT-10293", type="Academic Record", name="Marksheet — Sem 4", verified=True),
        models.DocumentRecord(citizen_id="CIT-10293", type="Income Proof", name="Income Certificate", verified=True),
        models.DocumentRecord(citizen_id="CIT-10294", type="Identity Proof", name="Aadhaar Card", verified=True),
        models.DocumentRecord(citizen_id="CIT-10294", type="Academic Record", name="Degree Certificate", verified=True),
        models.DocumentRecord(citizen_id="CIT-10294", type="Income Proof", name="Income Certificate", verified=False),
        models.DocumentRecord(citizen_id="CIT-10295", type="Identity Proof", name="Aadhaar Card", verified=True),
        models.DocumentRecord(citizen_id="CIT-10295", type="Business Proof", name="GST Registration", verified=True),
    ])

    # --- Services ---
    db.add_all([
        models.Service(id="scholarship", name="Student Scholarship", category="Education", department="Dept. of Education", processing_time="5–7 days", eligibility="Enrolled student, family income below ₹5L/yr", required_info=["Identity", "Education Record", "Income Details"], required_docs=["Aadhaar Card", "Marksheet", "Income Certificate"], integrated=True),
        models.Service(id="income-cert", name="Income Certificate", category="Certificates", department="Revenue Department", processing_time="2–3 days", eligibility="All residents", required_info=["Identity", "Address"], required_docs=["Aadhaar Card", "Domicile Proof"], integrated=True),
        models.Service(id="residence-cert", name="Residence Certificate", category="Certificates", department="Revenue Department", processing_time="2–3 days", eligibility="Resident for 3+ years", required_info=["Identity", "Address History"], required_docs=["Aadhaar Card", "Utility Bill"], integrated=True),
        models.Service(id="edu-assistance", name="Education Assistance Grant", category="Welfare", department="Dept. of Social Welfare", processing_time="7–10 days", eligibility="Below poverty line students", required_info=["Identity", "Education Record", "Income Details"], required_docs=["Aadhaar Card", "Marksheet", "BPL Card"], integrated=True),
        models.Service(id="employment-reg", name="Employment Registration", category="Employment", department="Labour Department", processing_time="1–2 days", eligibility="Job seekers, 18+ years", required_info=["Identity", "Education Record"], required_docs=["Aadhaar Card", "Qualification Certificate"], integrated=True),
        models.Service(id="business-reg", name="Business Registration", category="Business Services", department="Dept. of Industries", processing_time="4–6 days", eligibility="Proposed or existing business owners", required_info=["Identity", "Business Details"], required_docs=["Aadhaar Card", "PAN Card"], integrated=False),
        models.Service(id="welfare-benefit", name="Welfare Benefit (Pension)", category="Welfare", department="Dept. of Social Welfare", processing_time="10–14 days", eligibility="Senior citizens, 60+ years", required_info=["Identity", "Income Details"], required_docs=["Aadhaar Card", "Age Proof"], integrated=False),
        models.Service(id="health-scheme", name="Health Assistance Scheme", category="Healthcare", department="Dept. of Health", processing_time="3–5 days", eligibility="Below ₹5L/yr household income", required_info=["Identity", "Income Details"], required_docs=["Aadhaar Card", "Income Certificate"], integrated=False),
    ])

    # --- Connectors / connected government systems ---
    now = datetime.utcnow()
    db.add_all([
        models.GovernmentSystem(id="identity", name="Identity Registry", department="Ministry of Electronics & IT", endpoint="/api/identity", auth_type="OAuth 2.0", status="Connected", last_sync=now, requests_today=1342, error_count=1, connector_type="REST API"),
        models.GovernmentSystem(id="education", name="Education Registry", department="Dept. of Education", endpoint="/api/education", auth_type="API Key", status="Connected", last_sync=now, requests_today=988, error_count=0, connector_type="REST API"),
        models.GovernmentSystem(id="income", name="Income Registry", department="Revenue Department", endpoint="/api/income", auth_type="mTLS", status="Connected", last_sync=now, requests_today=1104, error_count=3, connector_type="REST API"),
        models.GovernmentSystem(id="documents", name="Document Service", department="Dept. of Electronics & IT", endpoint="/api/documents", auth_type="OAuth 2.0", status="Connected", last_sync=now, requests_today=2231, error_count=0, connector_type="REST API"),
        models.GovernmentSystem(id="scholarship", name="Scholarship System", department="Dept. of Education", endpoint="/api/scholarship", auth_type="API Key", status="Warning", last_sync=now - timedelta(minutes=18), requests_today=412, error_count=9, connector_type="Webhook"),
        models.GovernmentSystem(id="legacy-labour", name="Labour Dept. Legacy DB", department="Labour Department", endpoint="/connectors/legacy-adapter/labour", auth_type="Legacy Adapter (DB)", status="Connected", last_sync=now - timedelta(minutes=6), requests_today=201, error_count=2, connector_type="Legacy Adapter"),
    ])

    # --- Workflow template (Scholarship) ---
    steps = [
        ("Application Received", "GovSync Portal", "instant"),
        ("Identity Verification", "Identity Registry", "0.6s"),
        ("Education Verification", "Education Registry", "0.8s"),
        ("Income Verification", "Income Registry", "0.9s"),
        ("Document Verification", "Document Service", "1.1s"),
        ("Eligibility Check", "Integration Hub (rules engine)", "0.3s"),
        ("Officer Review", "Dept. of Education", "~1.5 days"),
        ("Approval", "Dept. of Education", "~0.5 days"),
    ]
    for i, (step, system, t) in enumerate(steps):
        db.add(models.WorkflowTemplate(service_id="scholarship", sequence=i, step=step, system=system, avg_time=t, enabled=True))

    # --- Sample historical audit logs, applications, consents, notifications ---
    db.add(models.Consent(id="CNS-4471", citizen_id="CIT-10293", data_requested=["Identity Information", "Education Information", "Income Information", "Required Documents"], purpose="Scholarship Eligibility Verification", department="Dept. of Education", timestamp=now - timedelta(days=2), status="Active", expiry=(now + timedelta(days=88)).date().isoformat()))

    app1 = models.Application(id="GOV-2026-00098", citizen_id="CIT-10293", service_id="income-cert", service_name="Income Certificate", department="Revenue Department", status="Approved", current_stage="Approved", assigned_officer="K. Meena", sla_target_days=3, created_at=now - timedelta(hours=8), updated_at=now - timedelta(hours=1))
    db.add(app1)
    db.flush()
    for i, (step, system, status, dur) in enumerate([
        ("Application Submitted", "GovSync Portal", "done", "—"),
        ("Identity Verified", "Identity Registry", "done", "0.7s"),
        ("Documents Checked", "Document Service", "done", "1.1s"),
        ("Department Review", "Revenue Department", "done", "—"),
        ("Approved", "Revenue Department", "done", "—"),
    ]):
        db.add(models.WorkflowStep(application_id="GOV-2026-00098", sequence=i, step=step, system=system, status=status, timestamp=now - timedelta(hours=8 - i), duration=dur))

    app2 = models.Application(id="GOV-2026-00112", citizen_id="CIT-10293", service_id="employment-reg", service_name="Employment Registration", department="Labour Department", status="Submitted", current_stage="Officer Review", assigned_officer="S. Rathi", sla_target_days=2, created_at=now - timedelta(hours=6), updated_at=now - timedelta(hours=6))
    db.add(app2)
    db.flush()
    for i, (step, system, status, dur) in enumerate([
        ("Application Submitted", "GovSync Portal", "done", "—"),
        ("Identity Verified", "Identity Registry", "done", "0.6s"),
        ("Education Verified", "Education Registry", "done", "0.9s"),
        ("Officer Review", "Labour Department", "active", None),
        ("Approved", "Labour Department", "pending", None),
    ]):
        db.add(models.WorkflowStep(application_id="GOV-2026-00112", sequence=i, step=step, system=system, status=status,
                                    timestamp=(now - timedelta(hours=6 - i)) if status == "done" else None, duration=dur))

    db.add_all([
        models.Notification(citizen_id="CIT-10293", message="Your Income Certificate application (GOV-2026-00098) has been approved.", timestamp=now - timedelta(hours=1), read=False),
        models.Notification(citizen_id="CIT-10293", message="Employment Registration application moved to Officer Review.", timestamp=now - timedelta(hours=6), read=False),
    ])

    db.add(models.Grievance(id="GRV-3301", citizen_id="CIT-10293", subject="Delay in scholarship disbursement last cycle", department="Dept. of Education", status="Resolved", submitted_at=now - timedelta(days=45)))

    db.add_all([
        models.AuditLog(timestamp=now - timedelta(hours=1), user="CIT-10293", action="Approval", purpose="Income Certificate Issuance", system="Revenue Department", consent="Granted", status="SUCCESS"),
        models.AuditLog(timestamp=now - timedelta(hours=6), user="CIT-10293", action="Data Access — Identity", purpose="Employment Registration", system="Identity Registry", consent="Granted", status="SUCCESS"),
        models.AuditLog(timestamp=now - timedelta(days=1), user="admin", action="Connector Configuration Updated", purpose="Maintenance", system="Scholarship System", consent="—", status="SUCCESS"),
    ])

    db.add_all([
        models.IntegrationRequest(api_name="Identity API", status="SUCCESS", detail="124 ms", timestamp=now - timedelta(minutes=5)),
        models.IntegrationRequest(api_name="Education API", status="SUCCESS", detail="187 ms", timestamp=now - timedelta(minutes=5)),
        models.IntegrationRequest(api_name="Income API", status="SUCCESS", detail="201 ms", timestamp=now - timedelta(minutes=4)),
        models.IntegrationRequest(api_name="Document API", status="SUCCESS", detail="165 ms", timestamp=now - timedelta(minutes=4)),
        models.IntegrationRequest(api_name="Scholarship API", status="FAILED", detail="503 Service Unavailable", timestamp=now - timedelta(minutes=3)),
    ])

    db.add_all([
        models.Exception_(id="EXC-9001", api_name="Income API", status="FAILED", error="Service temporarily unavailable", attempts=3, request_id="REQ-77213", citizen_id="CIT-10294", queued=True),
        models.Exception_(id="EXC-9002", api_name="Scholarship API", status="FAILED", error="Upstream timeout after 8000ms", attempts=2, request_id="REQ-77260", citizen_id="CIT-10295", queued=True),
    ])

    db.add_all([
        models.DataQualityIssue(issue_type="duplicate", description="Rahul Kumar / Rahul K. (94% match)", record_a={"name": "Rahul Kumar", "dob": "12-04-2004", "src": "Education Registry"}, record_b={"name": "Rahul K.", "dob": "12-04-2004", "src": "Scholarship System"}, similarity=94, resolved=False),
        models.DataQualityIssue(issue_type="duplicate", description="Priya Sharma / P. Sharma (89% match)", record_a={"name": "Priya Sharma", "dob": "03-11-2001", "src": "Identity Registry"}, record_b={"name": "P. Sharma", "dob": "03-11-2001", "src": "Income Registry"}, similarity=89, resolved=False),
        models.DataQualityIssue(issue_type="missing", description="annual_income missing for CIT-10422", resolved=False),
        models.DataQualityIssue(issue_type="invalid", description='Invalid dob format "31/13/2003" rejected by validator', resolved=False),
        models.DataQualityIssue(issue_type="conflicting", description="Mobile number mismatch across registries", resolved=False),
    ])

    db.add_all([
        models.SLARecord(service_name="Income Certificate", target_days=3, average_days=1.8, compliance_pct=94),
        models.SLARecord(service_name="Residence Certificate", target_days=3, average_days=2.1, compliance_pct=91),
        models.SLARecord(service_name="Student Scholarship", target_days=7, average_days=5.2, compliance_pct=88),
        models.SLARecord(service_name="Employment Registration", target_days=2, average_days=1.6, compliance_pct=96),
    ])

    db.commit()
