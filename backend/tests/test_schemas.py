import pytest
from datetime import datetime, timezone
from backend.app.schemas.enums import (
    ScenarioState, RoleEnum, DegradationType, ConfidenceLevel,
    DecisionType, SourceType, DeliveryStatus, EventType
)
from backend.app.schemas.contracts import (
    ScenarioPackage, RoleDefinition, InformationSourceDefinition,
    DecisionOption, DecisionPointDefinition, ScheduledDegradationRule,
    OutcomeRule, EventSchema, ParticipantSchema, SessionResponse,
    DegradationInjectRequest, DecisionSubmitRequest, DecisionContextCardSchema,
    UncertaintyBudget, ContradictionItem, AsymmetryMatrixEntry
)
from backend.app.models.entities import (
    ScenarioModel, SessionModel, ParticipantModel, EventModel,
    DegradationEventModel, DecisionModel, MessageModel, ContradictionModel
)
from backend.app.database import Base, engine, SessionLocal

def test_enums_integrity():
    assert ScenarioState.BRIEFING.value == "BRIEFING"
    assert RoleEnum.TEAM_LEAD.value == "TEAM_LEAD"
    assert RoleEnum.INSTRUCTOR.value == "INSTRUCTOR"
    assert DegradationType.DELAY.value == "DELAY"
    assert DegradationType.CONTRADICTION.value == "CONTRADICTION"
    assert DeliveryStatus.STALE.value == "STALE"

def test_scenario_package_validation():
    scenario = ScenarioPackage(
        scenario_id="test-scenario-01",
        version="1.0.0",
        title="Test Scenario Alpha",
        description="Automated schema test scenario",
        learning_objectives=["Verify contract compliance"],
        seed=123456,
        duration_seconds=180,
        roles=[
            RoleDefinition(role_id=RoleEnum.TEAM_LEAD, title="Team Lead"),
            RoleDefinition(role_id=RoleEnum.COORDINATION, title="Coordination"),
            RoleDefinition(role_id=RoleEnum.INFORMATION, title="Information")
        ],
        information_sources=[
            InformationSourceDefinition(
                source_id="SRC_RADAR",
                name="Tactical Radar",
                type=SourceType.RADAR_TELEMETRY,
                baseline_reliability=0.9
            )
        ],
        decision_points=[
            DecisionPointDefinition(
                decision_point_id="DP_01",
                trigger_time_seconds=60,
                decision_type=DecisionType.ACTION_DISPATCH,
                prompt="Select action route",
                allowed_roles=[RoleEnum.TEAM_LEAD],
                options=[
                    DecisionOption(option_id="OPT_A", label="Hold position"),
                    DecisionOption(option_id="OPT_B", label="Advance to waypoint")
                ]
            )
        ]
    )
    assert scenario.scenario_id == "test-scenario-01"
    assert len(scenario.roles) == 3
    assert scenario.information_sources[0].baseline_reliability == 0.9

def test_database_tables_creation():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Create a test scenario record
        scenario_rec = ScenarioModel(
            id="test-scen-rec",
            title="Database Test Scenario",
            description="Testing DB persistence",
            data_json={"test": True}
        )
        db.add(scenario_rec)
        db.commit()

        queried = db.query(ScenarioModel).filter_by(id="test-scen-rec").first()
        assert queried is not None
        assert queried.title == "Database Test Scenario"

        # Cleanup test record
        db.delete(queried)
        db.commit()
    finally:
        db.close()
