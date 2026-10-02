import logging
from typing import Dict, Set, List
from backend.app.schemas.enums import ScenarioState

logger = logging.getLogger("foglab.scenario.state_machine")

class StateMachineError(Exception):
    pass

class ScenarioStateMachine:
    VALID_TRANSITIONS: Dict[ScenarioState, Set[ScenarioState]] = {
        ScenarioState.BRIEFING: {ScenarioState.ACTIVE},
        ScenarioState.ACTIVE: {ScenarioState.DEGRADED, ScenarioState.DECISION_WINDOW, ScenarioState.RESOLUTION},
        ScenarioState.DEGRADED: {ScenarioState.DECISION_WINDOW, ScenarioState.RECOVERY, ScenarioState.RESOLUTION},
        ScenarioState.DECISION_WINDOW: {ScenarioState.RECOVERY, ScenarioState.RESOLUTION, ScenarioState.ACTIVE},
        ScenarioState.RECOVERY: {ScenarioState.ACTIVE, ScenarioState.DECISION_WINDOW, ScenarioState.RESOLUTION},
        ScenarioState.RESOLUTION: {ScenarioState.AAR_READY},
        ScenarioState.AAR_READY: set() # Terminal state
    }

    def __init__(self, initial_state: ScenarioState = ScenarioState.BRIEFING):
        self._current_state = initial_state
        self._history: List[Dict[str, any]] = [
            {"from": None, "to": initial_state.value, "time": 0.0, "reason": "Initial briefing state"}
        ]

    @property
    def current_state(self) -> ScenarioState:
        return self._current_state

    def can_transition_to(self, target_state: ScenarioState) -> bool:
        allowed = self.VALID_TRANSITIONS.get(self._current_state, set())
        return target_state in allowed

    def transition_to(self, target_state: ScenarioState, scenario_time: float, reason: str = "") -> ScenarioState:
        if not self.can_transition_to(target_state):
            err_msg = f"Illegal scenario state transition from {self._current_state.value} to {target_state.value}"
            logger.error(err_msg)
            raise StateMachineError(err_msg)

        prev = self._current_state
        self._current_state = target_state
        self._history.append({
            "from": prev.value,
            "to": target_state.value,
            "time": scenario_time,
            "reason": reason
        })
        logger.info("Scenario state transition: %s -> %s at T=%.1fs (Reason: %s)", prev.value, target_state.value, scenario_time, reason)
        return self._current_state

    def get_history(self) -> List[Dict[str, any]]:
        return list(self._history)
