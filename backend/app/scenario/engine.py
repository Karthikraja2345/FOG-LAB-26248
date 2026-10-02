import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple
from backend.app.schemas.enums import (
    ScenarioState, RoleEnum, EventType, DeliveryStatus, DecisionType
)
from backend.app.schemas.contracts import (
    ScenarioPackage, EventSchema, DegradationInjectRequest,
    DegradationActiveItem, DecisionSubmitRequest, DecisionContextCardSchema,
    UncertaintyBudget, ContradictionItem, AsymmetryMatrixEntry
)
from backend.app.scenario.state_machine import ScenarioStateMachine
from backend.app.degradation.engine import DegradationEngine

logger = logging.getLogger("foglab.scenario.engine")

class ScenarioSimulationEngine:
    def __init__(self, package: ScenarioPackage, seed: Optional[int] = None):
        self.package = package
        self.seed = seed if seed is not None else package.seed
        self.state_machine = ScenarioStateMachine(ScenarioState.BRIEFING)
        self.degradation_engine = DegradationEngine(seed=self.seed)

        self.scenario_time: float = 0.0
        self.world_state: Dict[str, Any] = dict(package.world_state)
        self.event_sequence: List[EventSchema] = []
        self.raw_observations: List[Dict[str, Any]] = [] # Ground-truth generated info
        self.decisions_ledger: List[DecisionContextCardSchema] = []
        self._seq_counter: int = 0

        # Pre-load scheduled ground truth information from scenario definition
        for event in package.scheduled_events:
            self.raw_observations.append({
                "time_seconds": float(event.get("time_seconds", 0)),
                "event_type": event.get("event_type", "INFORMATION_GENERATED"),
                "source_id": event.get("source_id", ""),
                "payload": event.get("payload", {})
            })

    def _next_seq(self) -> int:
        self._seq_counter += 1
        return self._seq_counter

    def emit_event(
        self,
        event_type: EventType,
        actor_id: str,
        role: RoleEnum,
        payload: Dict[str, Any],
        visibility: Optional[List[RoleEnum]] = None
    ) -> EventSchema:
        evt = EventSchema(
            event_id=f"EVT-{self._next_seq():04d}-{str(uuid.uuid4())[:4]}",
            session_id="LOCAL",
            scenario_id=self.package.scenario_id,
            scenario_version=self.package.version,
            scenario_time=round(self.scenario_time, 1),
            server_time=datetime.now(timezone.utc),
            event_type=event_type,
            actor_id=actor_id,
            role=role,
            payload=payload,
            visibility=visibility if visibility is not None else [RoleEnum.INSTRUCTOR, RoleEnum.TEAM_LEAD, RoleEnum.COORDINATION, RoleEnum.INFORMATION],
            sequence_number=self._seq_counter
        )
        self.event_sequence.append(evt)
        return evt

    def start_simulation(self) -> EventSchema:
        self.state_machine.transition_to(ScenarioState.ACTIVE, self.scenario_time, "Session activated")
        return self.emit_event(
            EventType.SESSION_STARTED,
            "INSTRUCTOR",
            RoleEnum.INSTRUCTOR,
            {"title": self.package.title, "duration": self.package.duration_seconds}
        )

    def tick(self, delta_seconds: float = 1.0) -> List[EventSchema]:
        """Advances simulation time, triggers scheduled rules, and processes degradation expiries."""
        if self.state_machine.current_state not in (ScenarioState.ACTIVE, ScenarioState.DEGRADED, ScenarioState.DECISION_WINDOW):
            return []

        emitted: List[EventSchema] = []
        old_time = self.scenario_time
        self.scenario_time += delta_seconds

        # 1. Trigger scheduled scenario degradation rules
        for rule in self.package.degradation_rules:
            if old_time < rule.trigger_time_seconds <= self.scenario_time:
                # Trigger degradation rule
                inject_req = DegradationInjectRequest(
                    source_id=rule.source_id,
                    target_roles=rule.target_roles,
                    degradation_type=rule.degradation_type,
                    duration_seconds=rule.duration_seconds,
                    intensity=rule.intensity,
                    parameters=rule.parameters
                )
                active_item = self.degradation_engine.add_inject(inject_req, self.scenario_time)
                if self.state_machine.current_state == ScenarioState.ACTIVE:
                    self.state_machine.transition_to(ScenarioState.DEGRADED, self.scenario_time, f"Automated degradation: {rule.rule_id}")
                emitted.append(self.emit_event(
                    EventType.DEGRADATION_STARTED,
                    "SYSTEM",
                    RoleEnum.INSTRUCTOR,
                    {"inject_id": active_item.inject_id, "type": rule.degradation_type.value, "source": rule.source_id}
                ))

        # 2. Update ticks on active degradations & check expiries
        expired_injects = self.degradation_engine.update_ticks(self.scenario_time)
        for exp_id in expired_injects:
            emitted.append(self.emit_event(
                EventType.DEGRADATION_ENDED,
                "SYSTEM",
                RoleEnum.INSTRUCTOR,
                {"inject_id": exp_id, "reason": "duration_completed"}
            ))

        # 3. Check scheduled decision points
        for dp in self.package.decision_points:
            if old_time < dp.trigger_time_seconds <= self.scenario_time:
                if self.state_machine.can_transition_to(ScenarioState.DECISION_WINDOW):
                    self.state_machine.transition_to(ScenarioState.DECISION_WINDOW, self.scenario_time, f"Decision window open: {dp.decision_point_id}")
                emitted.append(self.emit_event(
                    EventType.OBJECTIVE_UPDATED,
                    "SYSTEM",
                    RoleEnum.INSTRUCTOR,
                    {"decision_point_id": dp.decision_point_id, "prompt": dp.prompt, "options": [o.model_dump() for o in dp.options]}
                ))

        # 4. Check scheduled world/information events
        for obs in self.raw_observations:
            t = obs["time_seconds"]
            if old_time < t <= self.scenario_time:
                emitted.append(self.emit_event(
                    EventType(obs["event_type"]),
                    "GROUND_TRUTH",
                    RoleEnum.INSTRUCTOR,
                    {"source_id": obs["source_id"], "data": obs["payload"]}
                ))

        # 5. Check duration end
        if self.scenario_time >= self.package.duration_seconds:
            if self.state_machine.can_transition_to(ScenarioState.RESOLUTION):
                self.state_machine.transition_to(ScenarioState.RESOLUTION, self.scenario_time, "Scenario duration elapsed")
                emitted.append(self.emit_event(
                    EventType.SESSION_ENDED,
                    "SYSTEM",
                    RoleEnum.INSTRUCTOR,
                    {"reason": "Duration reached"}
                ))

        return emitted

    def inject_live_degradation(self, request: DegradationInjectRequest, actor_id: str) -> Tuple[DegradationActiveItem, EventSchema]:
        active_item = self.degradation_engine.add_inject(request, self.scenario_time)
        if self.state_machine.current_state == ScenarioState.ACTIVE and self.state_machine.can_transition_to(ScenarioState.DEGRADED):
            self.state_machine.transition_to(ScenarioState.DEGRADED, self.scenario_time, f"Live instructor inject: {request.degradation_type.value}")

        evt = self.emit_event(
            EventType.DEGRADATION_STARTED,
            actor_id,
            RoleEnum.INSTRUCTOR,
            {
                "inject_id": active_item.inject_id,
                "degradation_type": request.degradation_type.value,
                "source_id": request.source_id,
                "target_roles": [r.value for r in request.target_roles],
                "duration_seconds": request.duration_seconds,
                "intensity": request.intensity
            }
        )
        return active_item, evt

    def recover_live_degradation(self, inject_id: str, actor_id: str) -> Optional[EventSchema]:
        recovered = self.degradation_engine.recover_inject(inject_id)
        if recovered:
            if len(self.degradation_engine.active_injects) == 0 and self.state_machine.can_transition_to(ScenarioState.RECOVERY):
                self.state_machine.transition_to(ScenarioState.RECOVERY, self.scenario_time, "All channels recovered")
            return self.emit_event(
                EventType.DEGRADATION_ENDED,
                actor_id,
                RoleEnum.INSTRUCTOR,
                {"inject_id": inject_id, "recovered": True}
            )
        return None

    def capture_decision(self, req: DecisionSubmitRequest) -> DecisionContextCardSchema:
        """
        Captures a decision and freezes the EXACT DECISION CONTEXT CARD:
        - What information was available/seen by this trainee
        - What was delayed
        - What was missing
        - What conflicts were active
        """
        # Determine trainee visible information at this exact scenario time
        trainee_view = self.get_trainee_view(req.role)
        seen = []
        delayed = []
        missing = []

        for item in trainee_view["feeds"]:
            if item["status"] in (DeliveryStatus.DELIVERED.value, DeliveryStatus.CONFLICT.value, DeliveryStatus.STALE.value):
                seen.append(item)
            elif item["status"] == DeliveryStatus.DELAYED.value:
                delayed.append(item)
            elif item["status"] == DeliveryStatus.DROPPED.value:
                missing.append(item["source_id"])

        conflicts = [c.model_dump() for c in self.degradation_engine.conflicts if not c.is_resolved]

        # Determine later outcome from outcome rules
        linked_outcome = None
        for rule in self.package.outcome_rules:
            if rule.condition_option == req.selected_option:
                linked_outcome = {
                    "outcome_state": rule.outcome_state,
                    "narrative": rule.narrative,
                    "ground_truth_fact": rule.ground_truth_fact
                }
                break

        card = DecisionContextCardSchema(
            decision_id=f"DEC-{len(self.decisions_ledger) + 1:04d}",
            session_id="LOCAL",
            trainee_id=req.trainee_id,
            role=req.role,
            timestamp=round(self.scenario_time, 1),
            decision_type=req.decision_type,
            selected_option=req.selected_option,
            rationale=req.rationale,
            confidence=req.confidence,
            information_seen=seen,
            information_delayed=delayed,
            information_missing=missing,
            conflicts_seen=conflicts,
            later_outcome=linked_outcome,
            ground_truth_revelation=linked_outcome.get("ground_truth_fact") if linked_outcome else "Objective status verified post-exercise."
        )
        self.decisions_ledger.append(card)

        self.emit_event(
            EventType.DECISION_SUBMITTED,
            req.trainee_id,
            req.role,
            {
                "decision_id": card.decision_id,
                "selected_option": card.selected_option,
                "confidence": card.confidence.value,
                "rationale": card.rationale
            }
        )
        return card

    def get_trainee_view(self, role: RoleEnum) -> Dict[str, Any]:
        """
        Calculates role-specific trainee view.
        Strictly enforces server-side information hiding: never leaks ground truth.
        """
        feeds = []
        for src in self.package.information_sources:
            # Find newest raw observation for this source up to current time
            relevant_obs = [
                o for o in self.raw_observations
                if o["source_id"] == src.source_id and o["time_seconds"] <= self.scenario_time
            ]
            if not relevant_obs:
                raw_payload = {"summary": f"{src.name} operational. No anomalies recorded."}
                gen_time = 0.0
            else:
                last_obs = relevant_obs[-1]
                raw_payload = last_obs["payload"]
                gen_time = last_obs["time_seconds"]

            payload, status, deliv_time, is_conflicted = self.degradation_engine.transform_feed_for_role(
                source=src,
                raw_payload=raw_payload,
                generated_at=gen_time,
                current_scenario_time=self.scenario_time,
                role=role
            )

            age = max(0.0, self.scenario_time - deliv_time)
            feeds.append({
                "information_id": f"INFO-{src.source_id}",
                "source_id": src.source_id,
                "source_name": src.name,
                "generated_at_time": round(gen_time, 1),
                "received_at_time": round(deliv_time, 1),
                "age_seconds": round(age, 1),
                "status": status.value,
                "reliability": src.baseline_reliability,
                "confidence_class": src.confidence_class,
                "content": payload if payload is not None else {"status": "NO_CARRIER_SIGNAL_DROPPED"},
                "is_conflicted": is_conflicted
            })

        active_dp = None
        for dp in self.package.decision_points:
            if dp.trigger_time_seconds <= self.scenario_time:
                active_dp = dp.model_dump()

        return {
            "scenario_id": self.package.scenario_id,
            "scenario_title": self.package.title,
            "role": role.value,
            "scenario_time": round(self.scenario_time, 1),
            "state": self.state_machine.current_state.value,
            "feeds": feeds,
            "active_decision_point": active_dp,
            "uncertainty_budget": self.get_uncertainty_budget().model_dump()
        }

    def get_instructor_view(self) -> Dict[str, Any]:
        """Provides omniscient ground truth plus overview of all trainee streams."""
        return {
            "scenario_id": self.package.scenario_id,
            "scenario_title": self.package.title,
            "scenario_time": round(self.scenario_time, 1),
            "state": self.state_machine.current_state.value,
            "ground_truth_world_state": self.world_state,
            "active_degradations": [d.model_dump() for d in self.degradation_engine.active_injects],
            "active_conflicts": [c.model_dump() for c in self.degradation_engine.conflicts],
            "asymmetry_matrix": [e.model_dump() for e in self.degradation_engine.get_asymmetry_matrix(self.package.information_sources, self.scenario_time)],
            "uncertainty_budget": self.get_uncertainty_budget().model_dump(),
            "decisions": [d.model_dump() for d in self.decisions_ledger]
        }

    def get_uncertainty_budget(self) -> UncertaintyBudget:
        asym = self.degradation_engine.get_asymmetry_matrix(self.package.information_sources, self.scenario_time)
        unres_conflicts = len([c for c in self.degradation_engine.conflicts if not c.is_resolved])
        stale_feeds = len([e for e in asym if e.is_stale])
        unavail = len([e for e in asym if e.delivery_status == DeliveryStatus.DROPPED])
        low_conf = len([s for s in self.package.information_sources if s.baseline_reliability < 0.8])
        total_score = (unres_conflicts * 2.5) + (stale_feeds * 1.5) + (unavail * 2.0) + (low_conf * 1.0)
        return UncertaintyBudget(
            unresolved_contradictions=unres_conflicts,
            stale_feeds=stale_feeds,
            unavailable_channels=unavail,
            low_confidence_reports=low_conf,
            total_uncertainty_score=round(total_score, 1)
        )
