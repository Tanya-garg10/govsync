# GovSync — Government Interoperability Platform (SIH Prototype)

**"One Citizen. Connected Government Services."**

GovSync demonstrates how fragmented government digital platforms — identity,
education, income, documents, scholarship, labour, revenue systems — can be
made interoperable through a central **Integration Hub / middleware**,
*without replacing any existing system*.

This is a real, runnable two-tier application:

- **Backend:** FastAPI + PostgreSQL + SQLAlchemy + JWT auth — a working
  Integration Hub that calls mock government registries, normalizes their
  data into a common model, checks eligibility, and orchestrates the
  workflow across departments.
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS — three
  role-based experiences (Citizen, Government Official, System
  Administrator) that call the real backend over HTTP.

All data is **fictional demo data** (see `backend/app/seed.py`). No real
Aadhaar numbers, bank details, or personal information are used anywhere.

---

## Quick start with Docker (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API docs (Swagger): http://localhost:8000/docs

The database is created and seeded automatically on first backend startup.

---

## Manual setup (without Docker)

### 1. PostgreSQL

Install PostgreSQL locally, then:

```sql
CREATE USER govsync WITH PASSWORD 'govsync';
CREATE DATABASE govsync OWNER govsync;
```

### 2. Backend (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # edit DATABASE_URL if needed
uvicorn app.main:app --reload --port 8000
```

Visit http://localhost:8000/docs to explore and try the API directly —
tables are created and seeded with demo data automatically on startup.

### 3. Frontend (Next.js)

In a second terminal:

```bash
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Visit http://localhost:3000.

---

## Demo walkthrough

1. Open the landing page and click **▶ Run Interoperability Demo** — this
   runs the full Student Scholarship flow for demo citizen Rahul Kumar
   (`CIT-10293`) against the real backend: consent → identity verification
   → education verification → income verification → document retrieval →
   common-data-model normalization → eligibility check → submission.
2. Sign in as **Citizen** (pick any of the three demo citizens) to browse
   the service marketplace, apply for a service yourself, track
   applications with a live timeline, manage consents, and view documents,
   notifications, and grievances.
3. Sign in as **Government Official** to review and approve/reject
   applications, request additional documents, and see the citizen's full
   verification results, consent, and audit trail.
4. Sign in as **System Administrator** to explore the Integration Hub
   (connector cards + register new systems), API Monitoring, the Common
   Data Model mapping demo, Master Data + duplicate detection, Workflow
   Orchestration, System Connectors (REST/SOAP/DB/CSV/Webhook/Legacy
   Adapter patterns), Audit & Compliance, Data Quality, Integration
   Exceptions (retry/queue), System Health, SLA Compliance, and Users &
   Roles.

Everything you do as one role is visible to the others through the same
backend state — e.g. an official's approval immediately shows up as a
citizen notification and an audit log entry.

---

## Project structure

```
govsync/
├── backend/
│   ├── app/
│   │   ├── main.py            FastAPI app, router registration, startup seeding
│   │   ├── config.py          Settings (env vars)
│   │   ├── database.py        SQLAlchemy engine/session
│   │   ├── models.py          All ORM models (Users, Citizens, Applications, …)
│   │   ├── schemas.py         Pydantic request/response schemas
│   │   ├── auth.py            JWT issuance/verification, role guards
│   │   ├── hub.py             The Integration Hub: the core cross-system flow
│   │   ├── seed.py            Fictional demo data
│   │   └── routers/           One router per feature area (14 total)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/                   Next.js App Router pages (citizen/official/admin/...)
│   ├── components/            Shared UI, shells, the Integration Hub live-run modal
│   ├── lib/                   API client, auth context, shared types
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Key design principle

The architecture deliberately mirrors the SIH problem statement: existing
systems are never replaced.

```
Existing Government System
        ↓
  Connector / Adapter
        ↓
   Integration Hub
        ↓
 Common Data Model
        ↓
  Unified Services
```

`GovernmentSystem` records in the database represent these connectors;
`hub.py` is the middleware logic that calls out to each mock registry
(`routers/mock_gov.py`) rather than a source system being rewritten to
know about GovSync.

## Notes on the prototype's simplifications

- The "mock government APIs" (Identity/Education/Income/Document/
  Scholarship registries) live in the same PostgreSQL database as GovSync
  for simplicity, but are exposed as their own versioned API endpoints
  with intentionally inconsistent field names/formats — exactly what the
  Common Data Model page normalizes. In a real deployment these would be
  separate systems reached over the connectors shown in the Integration
  Hub.
- Auth is a simplified JWT flow with no passwords (you pick a role and,
  for citizens, a demo identity) — appropriate for an SIH prototype, not
  production-ready authentication.
- The frontend stores its JWT in `localStorage` for simplicity; a
  production deployment would typically use httpOnly session cookies.
