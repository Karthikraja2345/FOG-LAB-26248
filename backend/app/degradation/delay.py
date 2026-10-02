import random
from typing import Dict, Any

class DelayTransform:
    """Calculates delayed delivery time with seeded deterministic jitter."""

    @staticmethod
    def calculate_delivery_time(
        generated_at: float,
        configured_delay_seconds: float,
        intensity: float,
        seed: int,
        sequence_id: int
    ) -> float:
        # Deterministic pseudo-random jitter based on seed and sequence
        rng = random.Random(seed + sequence_id * 1007)
        # Jitter variance proportional to intensity (+/- 15%)
        jitter = (rng.random() - 0.5) * 2.0 * (configured_delay_seconds * 0.15 * intensity)
        effective_delay = max(1.0, (configured_delay_seconds * intensity) + jitter)
        return generated_at + effective_delay

    @staticmethod
    def is_deliverable(delivery_time: float, current_scenario_time: float) -> bool:
        return current_scenario_time >= delivery_time
