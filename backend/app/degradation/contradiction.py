import uuid
from typing import Dict, Any, Optional
from backend.app.schemas.contracts import ContradictionItem

class ContradictionTransform:
    """Creates and tracks divergent observations between distinct sources."""

    @staticmethod
    def create_conflict(
        conflict_code: str,
        source_a: str,
        source_b: str,
        topic: str,
        value_a: str,
        value_b: str,
        current_time: float
    ) -> ContradictionItem:
        return ContradictionItem(
            conflict_id=str(uuid.uuid4())[:8],
            source_a=source_a,
            source_b=source_b,
            topic=topic,
            value_a=value_a,
            value_b=value_b,
            detected_at_time=current_time,
            is_resolved=False
        )

    @staticmethod
    def apply_opposing_payload(
        original_payload: Dict[str, Any],
        opposing_claim: str
    ) -> Dict[str, Any]:
        tampered = dict(original_payload)
        tampered["contradiction_injected"] = True
        tampered["opposing_report"] = opposing_claim
        if "summary" in tampered:
            tampered["summary"] = opposing_claim
        return tampered
