import pytest
from backend.app.schemas.enums import ScenarioState, RoleEnum, DecisionType, ConfidenceLevel, DeliveryStatus
from backend.app.schemas.contracts import DecisionSubmitRequest, DegradationInjectRequest
from backend.app.scenario.loader import scenario_loader
from backend.app.scenario.state_machine import ScenarioStateMachine, StateMachineError
from backend.app.scenario.engine import ScenarioSimulationEngine

def test_load_all_three_scenarios():
    scenarios = scenario_loader.load_all(reload=True)
    assert len(scenarios) >= 3
    assert "silent-window" in scenarios
    assert "conflicting-picture" in scenarios
    assert "multi-domain-disruption" in scenarios

    primary = scenarios["conflicting-picture"]
    assert primary.title.startswith("Scenario B")
    assert len(primary.roles) == 3
    assert len(primary.information_sources) == 3
    assert len(primary.decision_points) >= 1

def test_state_machine_transitions():
    sm = ScenarioStateMachine()
    assert sm.current_state == ScenarioState.BRIEFING

    # Briefing -> Active is valid
    sm.transition_to(ScenarioState.ACTIVE, 0.0, "Session started")
    assert sm.current_state == ScenarioState.ACTIVE

    # Active -> Degraded is valid
    sm.transition_to(ScenarioState.DEGRADED, 40.0, "Interference injected")
    assert sm.current_state == ScenarioState.DEGRADED

    # Degraded -> Decision Window is valid
    sm.transition_to(ScenarioState.DECISION_WINDOW, 110.0, "Decision point reached")
    assert sm.current_state == ScenarioState.DECISION_WINDOW

    # Invalid jump: Decision Window -> Briefing should fail
    with pytest.raises(StateMachineError):
        sm.transition_to(ScenarioState.BRIEFING, 120.0, "Illegal backwards jump")

def test_simulation_engine_ticks_and_decision():
    pkg = scenario_loader.get_scenario("conflicting-picture")
    assert pkg is not None

    sim = ScenarioSimulationEngine(pkg, seed=424242)
    assert sim.scenario_time == 0.0

    # Start simulation
    sim.start_simulation()
    assert sim.state_machine.current_state == ScenarioState.ACTIVE

    # Advance time to T=75 (past scheduled UAV and Radar observations and delay inject)
    emitted = sim.tick(delta_seconds=75.0)
    assert sim.scenario_time == 75.0
    assert len(emitted) > 0

    # Verify role views
    lead_view = sim.get_trainee_view(RoleEnum.TEAM_LEAD)
    assert lead_view["role"] == "TEAM_LEAD"
    assert len(lead_view["feeds"]) == 3

    # Check uncertainty budget
    budget = sim.get_uncertainty_budget()
    assert budget.total_uncertainty_score >= 0.0

    # Submit decision as Team Lead
    decision_req = DecisionSubmitRequest(
        trainee_id="lead-user-01",
        role=RoleEnum.TEAM_LEAD,
        decision_type=DecisionType.ACTION_DISPATCH,
        selected_option="OPT_HOLD_AND_CROSS_VERIFY",
        rationale="Waiting for OP Echo verification due to radar Doppler discrepancy.",
        confidence=ConfidenceLevel.HIGH
    )
    card = sim.capture_decision(decision_req)
    assert card.selected_option == "OPT_HOLD_AND_CROSS_VERIFY"
    assert card.confidence == ConfidenceLevel.HIGH
    assert len(card.information_seen) > 0
    assert card.later_outcome is not None
    assert card.later_outcome["outcome_state"] == "DECOY_EXPOSED_ZERO_CASUALTIES"
