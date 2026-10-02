from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session as DBSession

from backend.app.database import get_db
from backend.app.schemas.enums import RoleEnum
from backend.app.schemas.contracts import (
    SessionCreateRequest, SessionResponse, ParticipantSchema
)
from backend.app.services.session_service import session_service
from backend.app.realtime.manager import ws_manager

router = APIRouter(prefix="/sessions", tags=["Sessions"])

@router.get("", response_model=List[SessionResponse])
def list_sessions(db: DBSession = Depends(get_db)):
    results = []
    for inst in list(session_service._live_sessions.values()):
        db_s = db.query(SessionModel).filter_by(id=inst.session_id).first()
        results.append(session_service._to_response(inst, db_s))
    return results

@router.post("", response_model=SessionResponse)
def create_session(req: SessionCreateRequest, db: DBSession = Depends(get_db)):
    try:
        return session_service.create_session(
            db=db,
            scenario_id=req.scenario_id,
            seed=req.seed,
            session_name=req.session_name
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{session_id}", response_model=SessionResponse)
def get_session(session_id: str):
    instance = session_service.get_live_session(session_id)
    if not instance:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found.")
    return session_service._to_response(instance, None)

@router.post("/{session_id}/join", response_model=ParticipantSchema)
def join_session(
    session_id: str,
    role: RoleEnum,
    display_name: str = "Trainee Commander",
    db: DBSession = Depends(get_db)
):
    try:
        return session_service.join_participant(
            db=db,
            session_id=session_id,
            role=role,
            display_name=display_name
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{session_id}/start", response_model=SessionResponse)
async def start_session(session_id: str, db: DBSession = Depends(get_db)):
    try:
        return await session_service.start_session(db=db, session_id=session_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{session_id}/pause", response_model=SessionResponse)
async def pause_session(session_id: str, db: DBSession = Depends(get_db)):
    try:
        return await session_service.pause_session(db=db, session_id=session_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{session_id}/resume", response_model=SessionResponse)
async def resume_session(session_id: str, db: DBSession = Depends(get_db)):
    try:
        return await session_service.resume_session(db=db, session_id=session_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{session_id}/end", response_model=SessionResponse)
async def end_session(session_id: str, db: DBSession = Depends(get_db)):
    try:
        return await session_service.end_session(db=db, session_id=session_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{session_id}/tick")
async def tick_session(session_id: str, delta: float = 1.0, db: DBSession = Depends(get_db)):
    try:
        emitted = await session_service.tick_simulation(db=db, session_id=session_id, delta_seconds=delta)
        return {"ticked": True, "delta": delta, "emitted_count": len(emitted)}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{session_id}/state")
def get_session_state(session_id: str, role: RoleEnum = RoleEnum.INSTRUCTOR):
    instance = session_service.get_live_session(session_id)
    if not instance:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found.")
    return instance.get_role_view(role)

# WebSocket connection endpoint
@router.websocket("/ws/{session_id}")
async def websocket_session_endpoint(
    websocket: WebSocket,
    session_id: str,
    role: RoleEnum = RoleEnum.INSTRUCTOR,
    participant_id: str = "GUEST"
):
    await ws_manager.connect(websocket, session_id, role, participant_id)
    instance = session_service.get_live_session(session_id)
    if instance:
        # Send initial snapshot
        initial_view = instance.get_role_view(role)
        await websocket.send_json({"type": "INIT_STATE", "payload": initial_view})

    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming ping / messages if needed
            if data == "PING":
                await websocket.send_text("PONG")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, session_id)
