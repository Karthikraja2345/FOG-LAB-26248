from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from backend.app.database import get_db
from backend.app.schemas.contracts import (
    MessageSendRequest, MessageRecordSchema
)
from backend.app.services.session_service import session_service

router = APIRouter(prefix="/sessions/{session_id}/messages", tags=["Messages"])

@router.post("", response_model=MessageRecordSchema)
async def send_message(
    session_id: str,
    req: MessageSendRequest,
    db: DBSession = Depends(get_db)
):
    try:
        return await session_service.record_message(
            db=db,
            session_id=session_id,
            request=req
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("", response_model=List[MessageRecordSchema])
def list_messages(session_id: str):
    instance = session_service.get_live_session(session_id)
    if not instance:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found.")
    return instance.messages
