"""CocoScan REST API.

Run locally:
    cd backend
    python -m venv .venv && .venv\\Scripts\\activate   (Windows)
    pip install -r requirements.txt
    copy .env.example .env
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Interactive docs: http://localhost:8000/docs
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, diseases, scans, updates
from app.core.config import get_settings
from app.database.base import Base
from app.database.session import SessionLocal, engine
from app.ml.registry import registry
from app.services.seed import seed_diseases

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("cocoscan")


INSECURE_DEFAULT_SECRET = "dev-only-insecure-secret-change-me"


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    if settings.secret_key == INSECURE_DEFAULT_SECRET:
        if settings.environment.lower() != "development":
            raise RuntimeError("SECRET_KEY is still the insecure default. Set a long random SECRET_KEY in .env.")
        log.warning("Using the insecure default SECRET_KEY — fine for local development only.")
    settings.upload_path.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_diseases(db)
    registry.load()
    log.info("Model status: %s", registry.status.detail)
    yield


settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # mobile clients; tighten for production web usage
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(scans.router)
app.include_router(diseases.router)
app.include_router(updates.router)


@app.get("/health", tags=["meta"])
def health() -> dict:
    st = registry.status
    return {
        "status": "ok",
        "environment": settings.environment,
        "active_model": settings.active_model,
        "model_configured": st.configured,
        "model_detail": st.detail,
    }
