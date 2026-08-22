from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, SessionLocal
from .config import settings
from . import models  # noqa: F401  (ensures models are registered on Base)
from .seed import seed_if_empty

from .routers import (
    auth, citizens, services, applications, consents, connectors,
    monitoring, audit, mock_gov, grievances, dataquality, exceptions,
    workflows, sla, notifications,
)

app = FastAPI(
    title="GovSync Interoperability Platform API",
    description="Integration Hub / middleware API for the GovSync SIH prototype. "
                "All data is fictional demo data.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(citizens.router)
app.include_router(services.router)
app.include_router(applications.router)
app.include_router(consents.router)
app.include_router(connectors.router)
app.include_router(monitoring.router)
app.include_router(audit.router)
app.include_router(mock_gov.router)
app.include_router(grievances.router)
app.include_router(dataquality.router)
app.include_router(exceptions.router)
app.include_router(workflows.router)
app.include_router(sla.router)
app.include_router(notifications.router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "service": "GovSync Integration Hub API",
        "status": "ok",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
