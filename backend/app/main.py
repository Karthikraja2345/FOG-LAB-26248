import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.api.health import router as health_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s (%(filename)s:%(lineno)d) - %(message)s"
)
logger = logging.getLogger("foglab")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing FOG-LAB 26248 database schemas...")
    Base.metadata.create_all(bind=engine)
    logger.info("FOG-LAB 26248 Simulation Platform Initialized successfully.")
    yield
    logger.info("FOG-LAB 26248 Shutting down cleanly.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Immersive Multi-Domain Decision-Making Trainer for Degraded Communication Environments (SIH PS 26248)",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include core routers
app.include_router(health_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "FOG-LAB 26248 Simulation Engine Operational",
        "problem_statement": "PS 26248 - Immersive Multi-Domain Decision-Making Trainer for Degraded Communication Environments",
        "organization": "Ministry of Defence (MoD) / Defence Services Staff College",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }
