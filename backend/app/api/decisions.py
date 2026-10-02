from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from backend.app.database import get_db
from backend.app.schemas.contracts import (
    DecisionSubmitRequest, DecisionContextCardSchema
)
from backend.app.services.session_service import session_service

router = APIRouter(prefix="/sessions/{session_id}/decisions", tags=["Decisions"])

@router.post("", response_model=DecisionContextCardSchema)
async def submit_decision(
    session_id: str,
    req: DecisionSubmitRequest,
    db: DBSession = Depends(get_db)
):
    try:
        return await session_service.record_decision(
            db=db,
            session_id=session_id,
            request=req
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("", response_model=List[DecisionContextCardSchema])
def list_decisions(session_id: str):
    instance = session_service.get_live_session(session_id)
    if not instance:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found.")
    return instance.engine.decisions_ledger
