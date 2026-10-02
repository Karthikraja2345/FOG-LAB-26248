from typing import Dict, Any, List
from backend.app.schemas.contracts import DegradationActiveItem

class RecoveryTransform:
    """Handles channel restoration, clearing active injects, and flushing pending buffers."""

    @staticmethod
    def recover_inject(
        active_injects: List[DegradationActiveItem],
        inject_id: str,
        current_time: float
    ) -> List[DegradationActiveItem]:
        remaining = []
        for item in active_injects:
            if item.inject_id == inject_id:
                # Terminated/recovered early
                continue
            remaining.append(item)
        return remaining
