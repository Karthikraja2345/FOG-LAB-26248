import uuid
import logging
from typing import List, Dict, Any, Optional, Tuple
from backend.app.schemas.enums import DegradationType, RoleEnum, DeliveryStatus
from backend.app.schemas.contracts import (
    DegradationActiveItem, DegradationInjectRequest,
    AsymmetryMatrixEntry, ContradictionItem, InformationSourceDefinition
)
from backend.app.degradation.delay import DelayTransform
from backend.app.degradation.dropout import DropoutTransform
from backend.app.degradation.contradiction import ContradictionTransform
from backend.app.degradation.staleness import StalenessTransform
from backend.app.degradation.partial_payload import PartialPayloadTransform

logger = logging.getLogger("foglab.degradation.engine")

class DegradationEngine:
    def __init__(self, seed: int = 424242):
        self.seed = seed
        self.active_injects: List[DegradationActiveItem] = []
        self.conflicts: List[ContradictionItem] = []
        self._inject_counter = 0

    def add_inject(self, request: DegradationInjectRequest, current_scenario_time: float) -> DegradationActiveItem:
        self._inject_counter += 1
        inject_id = f"INJ-{self._inject_counter:03d}-{str(uuid.uuid4())[:4]}"
        item = DegradationActiveItem(
            inject_id=inject_id,
            degradation_type=request.degradation_type,
            source_id=request.source_id,
            target_roles=request.target_roles,
            duration_seconds=request.duration_seconds,
            remaining_seconds=float(request.duration_seconds),
            intensity=request.intensity,
            started_at_scenario_time=current_scenario_time,
            parameters=request.parameters
        )
        self.active_injects.append(item)
        logger.info(
            "Injected degradation %s on source %s targeting %s at T=%.1fs",
            item.degradation_type.value, item.source_id, [r.value for r in item.target_roles], current_scenario_time
        )

        # If contradiction, create conflict item
        if request.degradation_type == DegradationType.CONTRADICTION:
            conflict_code = request.parameters.get("conflict_code", f"CONFLICT-{self._inject_counter:03d}")
            opposing_source = request.parameters.get("conflicting_source", "UNKNOWN_SOURCE")
            opposing_claim = request.parameters.get("opposing_claim", "Conflicting field observation reported")
            conflict = ContradictionTransform.create_conflict(
                conflict_code=conflict_code,
                source_a=request.source_id,
                source_b=opposing_source,
                topic="TGT_CLASSIFICATION",
                value_a="HOSTILE_STRIKE_FORCE",
                value_b=opposing_claim,
                current_time=current_scenario_time
            )
            self.conflicts.append(conflict)

        return item

    def update_ticks(self, current_scenario_time: float) -> List[str]:
        """Updates remaining seconds on active injects; returns list of expired inject IDs."""
        expired = []
        for item in self.active_injects:
            elapsed = current_scenario_time - item.started_at_scenario_time
            item.remaining_seconds = max(0.0, float(item.duration_seconds) - elapsed)
            if item.remaining_seconds <= 0.0:
                expired.append(item.inject_id)

        if expired:
            self.active_injects = [item for item in self.active_injects if item.inject_id not in expired]
            logger.info("Degradations expired and removed: %s", expired)
        return expired

    def recover_inject(self, inject_id: str) -> bool:
        initial_len = len(self.active_injects)
        self.active_injects = [item for item in self.active_injects if item.inject_id != inject_id]
        recovered = len(self.active_injects) < initial_len
        if recovered:
            logger.info("Manually recovered inject: %s", inject_id)
        return recovered

    def transform_feed_for_role(
        self,
        source: InformationSourceDefinition,
        raw_payload: Dict[str, Any],
        generated_at: float,
        current_scenario_time: float,
        role: RoleEnum
    ) -> Tuple[Optional[Dict[str, Any]], DeliveryStatus, float, bool]:
        """
        Transforms raw source observation for a specific evaluating role.
        Returns: (transformed_payload_or_none, delivery_status, effective_delivery_time, is_conflicted)
        """
        # Check if source is assigned to this role
        if role not in source.default_assigned_roles:
            return (None, DeliveryStatus.DROPPED, generated_at, False)

        delivery_status = DeliveryStatus.DELIVERED
        transformed_payload = dict(raw_payload)
        effective_delivery_time = generated_at
        is_conflicted = False

        # Apply active degradation injects matching this source
        for inject in self.active_injects:
            if inject.source_id != source.source_id:
                continue
            if role not in inject.target_roles:
                continue

            # 1. DROPOUT
            if inject.degradation_type == DegradationType.DROPOUT:
                if DropoutTransform.is_dropped(
                    current_time=current_scenario_time,
                    started_at=inject.started_at_scenario_time,
                    duration=inject.duration_seconds,
                    target_roles=inject.target_roles,
                    evaluating_role=role
                ):
                    return (None, DeliveryStatus.DROPPED, generated_at, False)

            # 2. INTERMITTENT
            elif inject.degradation_type == DegradationType.INTERMITTENT:
                if DropoutTransform.is_dropped(
                    current_time=current_scenario_time,
                    started_at=inject.started_at_scenario_time,
                    duration=inject.duration_seconds,
                    target_roles=inject.target_roles,
                    evaluating_role=role,
                    is_intermittent=True
                ):
                    return (None, DeliveryStatus.DROPPED, generated_at, False)

            # 3. DELAY
            elif inject.degradation_type == DegradationType.DELAY:
                delay_sec = float(inject.parameters.get("delay_seconds", 30))
                effective_delivery_time = DelayTransform.calculate_delivery_time(
                    generated_at=generated_at,
                    configured_delay_seconds=delay_sec,
                    intensity=inject.intensity,
                    seed=self.seed,
                    sequence_id=self._inject_counter
                )
                if not DelayTransform.is_deliverable(effective_delivery_time, current_scenario_time):
                    # Not arrived yet for this role!
                    return (None, DeliveryStatus.DELAYED, effective_delivery_time, False)
                delivery_status = DeliveryStatus.DELAYED

            # 4. CONTRADICTION
            elif inject.degradation_type == DegradationType.CONTRADICTION:
                opposing_claim = inject.parameters.get("opposing_claim", "Conflicting report emitted")
                transformed_payload = ContradictionTransform.apply_opposing_payload(
                    original_payload=transformed_payload,
                    opposing_claim=opposing_claim
                )
                delivery_status = DeliveryStatus.CONFLICT
                is_conflicted = True

            # 5. PARTIAL PAYLOAD
            elif inject.degradation_type == DegradationType.PARTIAL_PAYLOAD:
                masked_fields = inject.parameters.get("masked_fields", ["classification", "speed_kmh"])
                transformed_payload = PartialPayloadTransform.strip_fields(
                    payload=transformed_payload,
                    fields_to_mask=masked_fields
                )

            # 6. STALENESS
            elif inject.degradation_type == DegradationType.STALENESS:
                delivery_status = DeliveryStatus.STALE

        # Check staleness based on age
        age = max(0.0, current_scenario_time - effective_delivery_time)
        if age > 45.0 and delivery_status == DeliveryStatus.DELIVERED:
            delivery_status = DeliveryStatus.STALE

        return (transformed_payload, delivery_status, effective_delivery_time, is_conflicted)

    def get_asymmetry_matrix(
        self,
        sources: List[InformationSourceDefinition],
        current_scenario_time: float
    ) -> List[AsymmetryMatrixEntry]:
        """Calculates Information Asymmetry Matrix across all roles and sources."""
        roles = [RoleEnum.TEAM_LEAD, RoleEnum.COORDINATION, RoleEnum.INFORMATION]
        entries = []
        for src in sources:
            for role in roles:
                # Determine status
                if role not in src.default_assigned_roles:
                    status = DeliveryStatus.DROPPED
                    latency = 0.0
                    conflicted = False
                    is_stale = False
                else:
                    status = DeliveryStatus.DELIVERED
                    latency = 0.0
                    conflicted = False
                    is_stale = False
                    # Check active injects
                    for inj in self.active_injects:
                        if inj.source_id == src.source_id and role in inj.target_roles:
                            if inj.degradation_type == DegradationType.DROPOUT:
                                status = DeliveryStatus.DROPPED
                            elif inj.degradation_type == DegradationType.DELAY:
                                status = DeliveryStatus.DELAYED
                                latency = float(inj.parameters.get("delay_seconds", 30))
                            elif inj.degradation_type == DegradationType.CONTRADICTION:
                                status = DeliveryStatus.CONFLICT
                                conflicted = True
                            elif inj.degradation_type == DegradationType.STALENESS:
                                status = DeliveryStatus.STALE
                                is_stale = True

                entries.append(AsymmetryMatrixEntry(
                    source_id=src.source_id,
                    source_name=src.name,
                    role=role,
                    delivery_status=status,
                    latency_added_seconds=latency,
                    is_conflicted=conflicted,
                    is_stale=is_stale,
                    staleness_seconds=latency if is_stale else 0.0
                ))
        return entries
