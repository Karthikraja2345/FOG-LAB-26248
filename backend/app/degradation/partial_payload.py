from typing import Dict, Any, List

class PartialPayloadTransform:
    """Masks or strips critical fields from reports to simulate packet corruption."""

    @staticmethod
    def strip_fields(
        payload: Dict[str, Any],
        fields_to_mask: List[str]
    ) -> Dict[str, Any]:
        masked = dict(payload)
        for field in fields_to_mask:
            if field in masked:
                masked[field] = "[DATA_MASKED_BY_INTERFERENCE]"
        masked["is_partial_payload"] = True
        return masked
