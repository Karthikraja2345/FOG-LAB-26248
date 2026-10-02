from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session as DBSession

from backend.app.schemas.enums import RoleEnum
from backend.app.schemas.contracts import EventSchema
from backend.app.services.session_service import session_service

router = APIRouter(prefix="/sessions/{session_id}/timeline", tags=["Timeline"])

@router.get("", response_model=List[EventSchema])
def get_timeline(
    session_id: str,
    role: RoleEnum = RoleEnum.INSTRUCTOR,
    since_seq: Optional[int] = Query(default=0, ge=0)
):
    instance = session_service.get_live_session(session_id)
    if not instance:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found.")

    events = instance.engine.event_sequence
    filtered = []
    for evt in events:
        if evt.sequence_number <= since_seq:
            continue
        # Role visibility enforcement:
        if role == RoleEnum.INSTRUCTOR or role in evt.visibility:
            filtered.append(evt)

    return filtered
