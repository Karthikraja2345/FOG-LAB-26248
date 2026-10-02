from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from backend.app.schemas.enums import (
    ScenarioState, RoleEnum, DegradationType, ConfidenceLevel,
    DecisionType, SourceType, DeliveryStatus, EventType
)

# ----------------- Scenario Package Schemas -----------------

class LatencyProfile(BaseModel):
    base_ms: int = 100
    jitter_ms: int = 20

class RoleDefinition(BaseModel):
    role_id: RoleEnum
    title: str
    clearance_level: str = "CONFIDENTIAL"
    description: str = ""

class InformationSourceDefinition(BaseModel):
    source_id: str
    name: str
    type: SourceType
    baseline_reliability: float = Field(ge=0.0, le=1.0, default=0.90)
    latency_profile: LatencyProfile = Field(default_factory=LatencyProfile)
    confidence_class: str = "HIGH"
    default_assigned_roles: List[RoleEnum] = Field(default_factory=lambda: [RoleEnum.TEAM_LEAD, RoleEnum.COORDINATION, RoleEnum.INFORMATION])

class DecisionOption(BaseModel):
    option_id: str
    label: str
    description: str = ""
    associated_risk: str = "LOW"

class DecisionPointDefinition(BaseModel):
    decision_point_id: str
    trigger_time_seconds: int
    decision_type: DecisionType
    prompt: str
    allowed_roles: List[RoleEnum]
    options: List[DecisionOption]
    timeout_seconds: Optional[int] = 60

class ScheduledDegradationRule(BaseModel):
    rule_id: str
    trigger_time_seconds: int
    duration_seconds: int
    degradation_type: DegradationType
    source_id: str
    target_roles: List[RoleEnum]
    intensity: float = Field(ge=0.0, le=1.0, default=1.0)
    parameters: Dict[str, Any] = Field(default_factory=dict)

class OutcomeRule(BaseModel):
    rule_id: str
    condition_decision: str
    condition_option: str
    outcome_state: str
    narrative: str
    ground_truth_fact: str

class ScenarioPackage(BaseModel):
    scenario_id: str
    version: str = "1.0.0"
    title: str
    description: str
    learning_objectives: List[str]
    seed: int = 424242
    duration_seconds: int = 300
    roles: List[RoleDefinition]
    information_sources: List[InformationSourceDefinition]
    world_state: Dict[str, Any] = Field(default_factory=dict)
    scheduled_events: List[Dict[str, Any]] = Field(default_factory=list)
    degradation_rules: List[ScheduledDegradationRule] = Field(default_factory=list)
    decision_points: List[DecisionPointDefinition] = Field(default_factory=list)
    outcome_rules: List[OutcomeRule] = Field(default_factory=list)
    evaluation_rules: Dict[str, Any] = Field(default_factory=dict)

# ----------------- Realtime & Event Schemas -----------------

class EventSchema(BaseModel):
    event_id: str
    session_id: str
    scenario_id: str
    scenario_version: str = "1.0.0"
    scenario_time: float
    server_time: datetime
    event_type: EventType
    actor_id: str
    role: RoleEnum
    payload: Dict[str, Any]
    visibility: List[RoleEnum]
    sequence_number: int

# ----------------- Session Schemas -----------------

class ParticipantSchema(BaseModel):
    participant_id: str
    session_id: str
    role: RoleEnum
    display_name: str
    is_connected: bool = True
    joined_at: datetime
    last_seen: datetime

class SessionCreateRequest(BaseModel):
    scenario_id: str
    session_name: Optional[str] = None
    seed: Optional[int] = None

class SessionResponse(BaseModel):
    session_id: str
    session_code: str
    scenario_id: str
    scenario_title: str
    status: ScenarioState
    seed: int
    scenario_time: float
    duration_seconds: int
    participants: List[ParticipantSchema] = Field(default_factory=list)
    active_degradations_count: int = 0
    created_at: datetime

# ----------------- Instructor Injects -----------------

class DegradationInjectRequest(BaseModel):
    source_id: str
    target_roles: List[RoleEnum]
    degradation_type: DegradationType
    duration_seconds: int = Field(ge=5, le=600, default=60)
    intensity: float = Field(ge=0.0, le=1.0, default=0.7)
    parameters: Dict[str, Any] = Field(default_factory=dict)

class DegradationActiveItem(BaseModel):
    inject_id: str
    degradation_type: DegradationType
    source_id: str
    target_roles: List[RoleEnum]
    duration_seconds: int
    remaining_seconds: float
    intensity: float
    started_at_scenario_time: float
    parameters: Dict[str, Any] = Field(default_factory=dict)

# ----------------- Trainee Decision & Context -----------------

class DecisionSubmitRequest(BaseModel):
    trainee_id: str
    role: RoleEnum
    decision_type: DecisionType
    selected_option: str
    rationale: str
    confidence: ConfidenceLevel

class DecisionContextCardSchema(BaseModel):
    decision_id: str
    session_id: str
    trainee_id: str
    role: RoleEnum
    timestamp: float
    decision_type: DecisionType
    selected_option: str
    rationale: str
    confidence: ConfidenceLevel
    information_seen: List[Dict[str, Any]]
    information_delayed: List[Dict[str, Any]]
    information_missing: List[str]
    conflicts_seen: List[Dict[str, Any]]
    later_outcome: Optional[Dict[str, Any]] = None
    ground_truth_revelation: Optional[str] = None

# ----------------- Team Coordination -----------------

class MessageSendRequest(BaseModel):
    sender_id: str
    sender_role: RoleEnum
    recipient_role: Optional[RoleEnum] = None # None means ALL
    content: str

class MessageRecordSchema(BaseModel):
    message_id: str
    session_id: str
    sender_id: str
    sender_role: RoleEnum
    recipient_role: Optional[RoleEnum]
    content: str
    scenario_time: float
    timestamp_utc: datetime
    acknowledged_by: List[RoleEnum] = Field(default_factory=list)

# ----------------- Heatmaps & Matrices -----------------

class AsymmetryMatrixEntry(BaseModel):
    source_id: str
    source_name: str
    role: RoleEnum
    delivery_status: DeliveryStatus
    latency_added_seconds: float = 0.0
    is_conflicted: bool = False
    is_stale: bool = False
    staleness_seconds: float = 0.0

class ContradictionItem(BaseModel):
    conflict_id: str
    source_a: str
    source_b: str
    topic: str
    value_a: str
    value_b: str
    detected_at_time: float
    resolved_at_time: Optional[float] = None
    is_resolved: bool = False
    resolution_note: Optional[str] = None

class UncertaintyBudget(BaseModel):
    unresolved_contradictions: int
    stale_feeds: int
    unavailable_channels: int
    low_confidence_reports: int
    total_uncertainty_score: float

# ----------------- AAR & Replay -----------------

class AARSummary(BaseModel):
    session_id: str
    scenario_id: str
    scenario_title: str
    seed: int
    duration_elapsed_seconds: float
    participants: List[ParticipantSchema]
    total_decisions: int
    decisions: List[DecisionContextCardSchema]
    active_conflicts: List[ContradictionItem]
    asymmetry_matrix: List[AsymmetryMatrixEntry]
    uncertainty_budget: UncertaintyBudget
    timeline_events: List[EventSchema]
    training_metrics: Dict[str, Any]
    ground_truth_resolution: str
    disclaimer: str = "This report is a training artifact generated from simulated exercise data for Defence Services Staff College instructional review."

class CounterfactualRequest(BaseModel):
    base_session_id: str
    variable_to_modify: str  # e.g. "REMOVE_DELAY_SOURCE_A" or "SUPPRESS_CONTRADICTION"
    custom_parameters: Dict[str, Any] = Field(default_factory=dict)

class CounterfactualComparison(BaseModel):
    base_session_id: str
    counterfactual_session_id: str
    seed: int
    modified_variable: str
    base_decision_latencies: Dict[str, float]
    counterfactual_decision_latencies: Dict[str, float]
    base_outcomes: List[str]
    counterfactual_outcomes: List[str]
    variance_narrative: str
