from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends
from backend.app.schemas.contracts import (
    CounterfactualRequest, CounterfactualComparison, EventSchema
)
from backend.app.services.session_service import session_service
from backend.app.analytics.counterfactual import CounterfactualEngine

router = APIRouter(prefix="/sessions/{session_id}", tags=["Replay & Counterfactual"])

@router.get("/replay")
def get_replay_data(session_id: str):
    instance = session_service.get_live_session(session_id)
    if not instance:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found.")

    return {
        "session_id": instance.session_id,
        "scenario_id": instance.engine.package.scenario_id,
        "scenario_title": instance.engine.package.title,
        "seed": instance.engine.seed,
        "duration_seconds": instance.engine.package.duration_seconds,
        "total_scenario_time": round(instance.engine.scenario_time, 1),
        "events": [e.model_dump(mode="json") for e in instance.engine.event_sequence],
        "decisions": [d.model_dump(mode="json") for d in instance.engine.decisions_ledger],
        "sources": [s.model_dump(mode="json") for s in instance.engine.package.information_sources]
    }

@router.post("/counterfactual", response_model=CounterfactualComparison)
def run_counterfactual(session_id: str, req: CounterfactualRequest):
    instance = session_service.get_live_session(session_id)
    if not instance:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found.")

    return CounterfactualEngine.run_counterfactual(
        base_package=instance.engine.package,
        seed=instance.engine.seed,
        base_decisions=instance.engine.decisions_ledger,
        variable_to_modify=req.variable_to_modify,
        custom_params=req.custom_parameters
    )
