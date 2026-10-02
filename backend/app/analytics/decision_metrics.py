from typing import List, Dict, Any
from backend.app.schemas.contracts import DecisionContextCardSchema, MessageRecordSchema

class DecisionMetricsService:
    @staticmethod
    def calculate_metrics(
        decisions: List[DecisionContextCardSchema],
        messages: List[MessageRecordSchema],
        total_duration_seconds: float
    ) -> Dict[str, Any]:
        if not decisions:
            avg_decision_latency = 0.0
            stale_usage_count = 0
            conflicts_acknowledged = 0
        else:
            # In our scenarios, first decision point triggered at ~110s-120s
            latencies = [max(1.0, d.timestamp - 110.0) for d in decisions]
            avg_decision_latency = round(sum(latencies) / len(latencies), 1)

            stale_usage_count = sum(1 for d in decisions if any(f.get("status") == "STALE" for f in d.information_seen))
            conflicts_acknowledged = sum(1 for d in decisions if len(d.conflicts_seen) > 0)

        team_coordination_messages = len(messages)
        message_density = round(team_coordination_messages / max(1.0, total_duration_seconds / 60.0), 2)

        return {
            "total_decisions_recorded": len(decisions),
            "average_decision_latency_seconds": avg_decision_latency,
            "stale_information_usage_count": stale_usage_count,
            "contradiction_awareness_rate": f"{round((conflicts_acknowledged / max(1, len(decisions))) * 100)}%",
            "team_coordination_message_count": team_coordination_messages,
            "message_frequency_per_minute": message_density,
            "objective_completion_status": "EXERCISE_COMPLETED_WITH_AUDIT",
            "evaluator_disclaimer": "These metrics are training indicators reflecting sub-unit process under degraded communication, not absolute measures of leadership quality."
        }
