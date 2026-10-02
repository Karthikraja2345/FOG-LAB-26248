import pytest
from backend.app.schemas.enums import RoleEnum, DegradationType, DeliveryStatus, SourceType
from backend.app.schemas.contracts import (
    DegradationInjectRequest, InformationSourceDefinition, LatencyProfile
)
from backend.app.degradation.engine import DegradationEngine
from backend.app.degradation.delay import DelayTransform
from backend.app.degradation.dropout import DropoutTransform
from backend.app.degradation.staleness import StalenessTransform
from backend.app.degradation.partial_payload import PartialPayloadTransform

def test_delay_transform_deterministic_jitter():
    # Same seed and sequence produces exact same delivery time
    t1 = DelayTransform.calculate_delivery_time(10.0, 30.0, 1.0, 424242, 1)
    t2 = DelayTransform.calculate_delivery_time(10.0, 30.0, 1.0, 424242, 1)
    assert t1 == t2
    assert t1 > 10.0
    assert not DelayTransform.is_deliverable(t1, 15.0)
    assert DelayTransform.is_deliverable(t1, 100.0)

def test_dropout_and_intermittent():
    # Regular dropout
    dropped = DropoutTransform.is_dropped(
        current_time=50.0,
        started_at=40.0,
        duration=30.0,
        target_roles=[RoleEnum.TEAM_LEAD],
        evaluating_role=RoleEnum.TEAM_LEAD
    )
    assert dropped is True

    # Untargeted role should not be dropped
    not_dropped = DropoutTransform.is_dropped(
        current_time=50.0,
        started_at=40.0,
        duration=30.0,
        target_roles=[RoleEnum.TEAM_LEAD],
        evaluating_role=RoleEnum.INFORMATION
    )
    assert not_dropped is False

    # Intermittent square wave
    # period=20s. Elapsed=5s -> dropped; Elapsed=15s -> visible
    dropped_int = DropoutTransform.is_dropped(
        current_time=45.0,
        started_at=40.0,
        duration=60.0,
        target_roles=[RoleEnum.TEAM_LEAD],
        evaluating_role=RoleEnum.TEAM_LEAD,
        is_intermittent=True,
        period=20.0
    )
    assert dropped_int is True

    visible_int = DropoutTransform.is_dropped(
        current_time=55.0,
        started_at=40.0,
        duration=60.0,
        target_roles=[RoleEnum.TEAM_LEAD],
        evaluating_role=RoleEnum.TEAM_LEAD,
        is_intermittent=True,
        period=20.0
    )
    assert visible_int is False

def test_staleness_calculation():
    fresh = StalenessTransform.calculate_staleness(current_time=15.0, last_refresh_time=10.0)
    assert fresh["is_stale"] is False
    assert fresh["age_seconds"] == 5.0

    stale = StalenessTransform.calculate_staleness(current_time=80.0, last_refresh_time=10.0)
    assert stale["is_stale"] is True
    assert "STALE" in stale["status_label"]

def test_partial_payload():
    original = {"target": "CONVOY", "speed_kmh": 40, "bearing": 120}
    masked = PartialPayloadTransform.strip_fields(original, ["speed_kmh"])
    assert masked["target"] == "CONVOY"
    assert masked["speed_kmh"] == "[DATA_MASKED_BY_INTERFERENCE]"
    assert masked["is_partial_payload"] is True

def test_degradation_engine_lifecycle():
    engine = DegradationEngine(seed=424242)
    req = DegradationInjectRequest(
        source_id="SRC_UAV",
        target_roles=[RoleEnum.TEAM_LEAD],
        degradation_type=DegradationType.DELAY,
        duration_seconds=40,
        intensity=0.8,
        parameters={"delay_seconds": 25}
    )
    item = engine.add_inject(req, current_scenario_time=10.0)
    assert len(engine.active_injects) == 1
    assert item.inject_id.startswith("INJ-")

    # Tick simulation forward by 45s (inject should expire)
    expired = engine.update_ticks(current_scenario_time=55.0)
    assert item.inject_id in expired
    assert len(engine.active_injects) == 0

def test_asymmetry_matrix_generation():
    engine = DegradationEngine(seed=424242)
    src = InformationSourceDefinition(
        source_id="SRC_OPTICAL",
        name="Optical Sensor",
        type=SourceType.OPTICAL_FEED,
        baseline_reliability=0.9,
        default_assigned_roles=[RoleEnum.TEAM_LEAD, RoleEnum.COORDINATION]
    )
    # Inject dropout targeting only TEAM_LEAD
    req = DegradationInjectRequest(
        source_id="SRC_OPTICAL",
        target_roles=[RoleEnum.TEAM_LEAD],
        degradation_type=DegradationType.DROPOUT,
        duration_seconds=60,
        intensity=1.0
    )
    engine.add_inject(req, 0.0)

    matrix = engine.get_asymmetry_matrix([src], current_scenario_time=10.0)
    # 3 roles x 1 source = 3 entries
    assert len(matrix) == 3

    lead_entry = next(e for e in matrix if e.role == RoleEnum.TEAM_LEAD)
    coord_entry = next(e for e in matrix if e.role == RoleEnum.COORDINATION)
    info_entry = next(e for e in matrix if e.role == RoleEnum.INFORMATION)

    assert lead_entry.delivery_status == DeliveryStatus.DROPPED
    assert coord_entry.delivery_status == DeliveryStatus.DELIVERED
    assert info_entry.delivery_status == DeliveryStatus.DROPPED # Not assigned
