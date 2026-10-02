from typing import List
from fastapi import APIRouter, HTTPException, Depends
from backend.app.schemas.contracts import ScenarioPackage
from backend.app.scenario.loader import scenario_loader

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])

@router.get("", response_model=List[ScenarioPackage])
def list_scenarios():
    scenarios = scenario_loader.load_all()
    return list(scenarios.values())

@router.get("/{scenario_id}", response_model=ScenarioPackage)
def get_scenario(scenario_id: str):
    scenario = scenario_loader.get_scenario(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")
    return scenario

@router.post("/validate")
def validate_scenario(data: dict):
    try:
        pkg = scenario_loader.validate_package(data)
        return {"valid": True, "scenario_id": pkg.scenario_id, "title": pkg.title, "version": pkg.version}
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Scenario validation error: {str(e)}")
