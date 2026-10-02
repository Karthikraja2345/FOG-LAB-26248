from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from backend.app.database import get_db
from backend.app.schemas.enums import RoleEnum, DeliveryStatus, DegradationType
from backend.app.schemas.contracts import (
    DegradationInjectRequest, DegradationActiveItem,
    AsymmetryMatrixEntry, ContradictionItem
)
from backend.app.services.session_service import session_service

router = APIRouter(prefix="/sessions/{session_id}/instructor", tags=["Instructor"])

@router.post("/inject", response_model=DegradationActiveItem)
async def inject_degradation(
    session_id: str,
    req: DegradationInjectRequest,
    actor_id: str = "INSTRUCTOR_LEAD",
    db: DBSession = Depends(get_db)
):
    try:
        return await session_service.inject_degradation(
            db=db,
            session_id=session_id,
            request=req,
            actor_id=actor_id
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/recover/{inject_id}")
async def recover_degradation(
    session_id: str,
    inject_id: str,
    actor_id: str = "INSTRUCTOR_LEAD",
    db: DBSession = Depends(get_db)
):
    try:
        success = await session_service.recover_degradation(
            db=db,
            session_id=session_id,
            inject_id=inject_id,
            actor_id=actor_id
        )
        return {"recovered": success, "inject_id": inject_id}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/asymmetry", response_model=List[AsymmetryMatrixEntry])
def get_asymmetry_matrix(session_id: str):
    instance = session_service.get_live_session(session_id)
    if not instance:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found.")
    return instance.engine.degradation_engine.get_asymmetry_matrix(
        instance.engine.package.information_sources,
        instance.engine.scenario_time
    )

@router.get("/contradictions", response_model=List[ContradictionItem])
def get_contradictions(session_id: str):
    instance = session_service.get_live_session(session_id)
    if not instance:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found.")
    return instance.engine.degradation_engine.conflicts

@router.post("/preview")
def preview_inject(session_id: str, req: DegradationInjectRequest):
    """Previews which roles and information streams will be affected before committing."""
    instance = session_service.get_live_session(session_id)
    if not instance:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found.")

    target_source = next((s for s in instance.engine.package.information_sources if s.source_id == req.source_id), None)
    if not target_source:
        raise HTTPException(status_code=400, detail=f"Unknown source {req.source_id}")

    affected_roles = []
    unaffected_roles = []
    for r in [RoleEnum.TEAM_LEAD, RoleEnum.COORDINATION, RoleEnum.INFORMATION]:
        if r in req.target_roles and r in target_source.default_assigned_roles:
            affected_roles.append(r.value)
        else:
            unaffected_roles.append(r.value)

    return {
        "source_name": target_source.name,
        "degradation_mode": req.degradation_type.value,
        "intensity": req.intensity,
        "duration_seconds": req.duration_seconds,
        "affected_roles": affected_roles,
        "unaffected_roles": unaffected_roles,
        "impact_summary": f"Injecting {req.degradation_type.value} on {target_source.name} will impact {len(affected_roles)} roles for {req.duration_seconds}s."
    }
