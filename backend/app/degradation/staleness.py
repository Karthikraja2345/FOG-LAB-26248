from typing import Dict, Any

class StalenessTransform:
    """Manages frozen telemetry observations and computes staleness decay."""

    @staticmethod
    def calculate_staleness(
        current_time: float,
        last_refresh_time: float,
        stale_threshold_seconds: float = 30.0
    ) -> Dict[str, Any]:
        age = max(0.0, current_time - last_refresh_time)
        is_stale = age >= stale_threshold_seconds
        return {
            "age_seconds": round(age, 1),
            "is_stale": is_stale,
            "status_label": f"STALE • {int(age)}s OLD" if is_stale else "LIVE"
        }
