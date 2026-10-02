import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.api.health import router as health_router
from backend.app.api.scenarios import router as scenarios_router
from backend.app.api.sessions import router as sessions_router
from backend.app.api.instructor import router as instructor_router
from backend.app.api.decisions import router as decisions_router
from backend.app.api.messages import router as messages_router
from backend.app.api.timeline import router as timeline_router
from backend.app.api.aar import router as aar_router
from backend.app.api.replay import router as replay_router
from backend.app.services.session_service import session_service
from backend.app.realtime.manager import ws_manager
from backend.app.schemas.enums import RoleEnum

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
    session_service.register_broadcaster(ws_manager.broadcast_to_session)
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
app.include_router(scenarios_router, prefix="/api")
app.include_router(sessions_router, prefix="/api")
app.include_router(instructor_router, prefix="/api")
app.include_router(decisions_router, prefix="/api")
app.include_router(messages_router, prefix="/api")
app.include_router(timeline_router, prefix="/api")
app.include_router(aar_router, prefix="/api")
app.include_router(replay_router, prefix="/api")

# Top-level WebSocket route: /ws/sessions/{session_id}
@app.websocket("/ws/sessions/{session_id}")
async def websocket_session_route(
    websocket: WebSocket,
    session_id: str,
    role: RoleEnum = RoleEnum.INSTRUCTOR,
    participant_id: str = "GUEST"
):
    await ws_manager.connect(websocket, session_id, role, participant_id)
    instance = session_service.get_live_session(session_id)
    if instance:
        initial_view = instance.get_role_view(role)
        await websocket.send_json({"type": "INIT_STATE", "payload": initial_view})
    try:
        while True:
            data = await websocket.receive_text()
            if data == "PING":
                await websocket.send_text("PONG")
    except Exception:
        ws_manager.disconnect(websocket, session_id)

@app.get("/")
def root():
    return {
        "message": "FOG-LAB 26248 Simulation Engine Operational",
        "problem_statement": "PS 26248 - Immersive Multi-Domain Decision-Making Trainer for Degraded Communication Environments",
        "organization": "Ministry of Defence (MoD) / Defence Services Staff College",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }
