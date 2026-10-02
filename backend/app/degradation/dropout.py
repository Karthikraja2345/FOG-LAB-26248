from typing import List
from backend.app.schemas.enums import RoleEnum

class DropoutTransform:
    """Manages channel dropouts and feed silence for targeted roles."""

    @staticmethod
    def is_dropped(
        current_time: float,
        started_at: float,
        duration: float,
        target_roles: List[RoleEnum],
        evaluating_role: RoleEnum,
        is_intermittent: bool = False,
        period: float = 20.0
    ) -> bool:
        if evaluating_role not in target_roles:
            return False

        if not (started_at <= current_time <= (started_at + duration)):
            return False

        if is_intermittent:
            # Flapping on/off based on period square wave
            elapsed = current_time - started_at
            cycle_pos = elapsed % period
            # 50% duty cycle: first half dropped, second half visible
            return cycle_pos < (period / 2.0)

        return True
