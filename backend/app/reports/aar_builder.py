import logging
from typing import Dict, Any, List
from backend.app.schemas.contracts import (
    AARSummary, DecisionContextCardSchema, UncertaintyBudget
)
from backend.app.analytics.decision_metrics import DecisionMetricsService
from backend.app.services.session_service import LiveSessionInstance

logger = logging.getLogger("foglab.reports.aar_builder")

class AARBuilder:
    @staticmethod
    def build_aar(instance: LiveSessionInstance) -> AARSummary:
        engine = instance.engine
        package = engine.package

        # Calculate training metrics
        metrics = DecisionMetricsService.calculate_metrics(
            decisions=engine.decisions_ledger,
            messages=instance.messages,
            total_duration_seconds=engine.scenario_time
        )

        # Ground truth resolution
        gt_res = "Simulated exercise completed. Ground truth verified: " + str(engine.world_state)

        return AARSummary(
            session_id=instance.session_id,
            scenario_id=package.scenario_id,
            scenario_title=package.title,
            seed=engine.seed,
            duration_elapsed_seconds=round(engine.scenario_time, 1),
            participants=list(instance.participants.values()),
            total_decisions=len(engine.decisions_ledger),
            decisions=engine.decisions_ledger,
            active_conflicts=engine.degradation_engine.conflicts,
            asymmetry_matrix=engine.degradation_engine.get_asymmetry_matrix(package.information_sources, engine.scenario_time),
            uncertainty_budget=engine.get_uncertainty_budget(),
            timeline_events=engine.event_sequence,
            training_metrics=metrics,
            ground_truth_resolution=gt_res,
            disclaimer="This report is a training artifact generated from the simulated exercise for Defence Services Staff College instructional evaluation."
        )
