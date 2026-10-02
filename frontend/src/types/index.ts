export type ScenarioState =
  | 'BRIEFING'
  | 'ACTIVE'
  | 'DEGRADED'
  | 'DECISION_WINDOW'
  | 'RECOVERY'
  | 'RESOLUTION'
  | 'AAR_READY';

export type RoleEnum =
  | 'INSTRUCTOR'
  | 'TEAM_LEAD'
  | 'COORDINATION'
  | 'INFORMATION';

export type DegradationType =
  | 'DELAY'
  | 'DROPOUT'
  | 'INTERMITTENT'
  | 'CONTRADICTION'
  | 'STALENESS'
  | 'PARTIAL_PAYLOAD'
  | 'RECOVERY';

export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type DecisionType =
  | 'ACTION_DISPATCH'
  | 'HOLD_POSITION'
  | 'REQUEST_INFORMATION'
  | 'ESCALATE_COMMAND'
  | 'RECON_CONFIRM';

export type SourceType =
  | 'OPTICAL_FEED'
  | 'RADAR_TELEMETRY'
  | 'HUMINT_DISPATCH'
  | 'SIGINT_SENSOR'
  | 'EW_INTERCEPT'
  | 'CYBER_STATUS';

export type DeliveryStatus =
  | 'DELIVERED'
  | 'DELAYED'
  | 'DROPPED'
  | 'STALE'
  | 'CONFLICT'
  | 'RECOVERED';

export type EventType =
  | 'WORLD_EVENT'
  | 'INFORMATION_GENERATED'
  | 'INFORMATION_DELIVERED'
  | 'INFORMATION_DELAYED'
  | 'INFORMATION_DROPPED'
  | 'INFORMATION_CONFLICT'
  | 'INFORMATION_RECOVERED'
  | 'DEGRADATION_STARTED'
  | 'DEGRADATION_UPDATED'
  | 'DEGRADATION_ENDED'
  | 'MESSAGE_SENT'
  | 'MESSAGE_ACKNOWLEDGED'
  | 'DECISION_SUBMITTED'
  | 'DECISION_REVISED'
  | 'OBJECTIVE_UPDATED'
  | 'SESSION_STARTED'
  | 'SESSION_PAUSED'
  | 'SESSION_RESUMED'
  | 'SESSION_ENDED';

export interface LatencyProfile {
  base_ms: number;
  jitter_ms: number;
}

export interface InformationSource {
  source_id: string;
  name: string;
  type: SourceType;
  baseline_reliability: number;
  latency_profile: LatencyProfile;
  confidence_class: string;
  default_assigned_roles: RoleEnum[];
}

export interface DecisionOption {
  option_id: string;
  label: string;
  description: string;
  associated_risk: string;
}

export interface DecisionPoint {
  decision_point_id: string;
  trigger_time_seconds: number;
  decision_type: DecisionType;
  prompt: string;
  allowed_roles: RoleEnum[];
  options: DecisionOption[];
  timeout_seconds?: number;
}

export interface ScenarioPackage {
  scenario_id: string;
  version: string;
  title: string;
  description: string;
  learning_objectives: string[];
  seed: number;
  duration_seconds: number;
  roles: Array<{ role_id: RoleEnum; title: string; clearance_level: string; description: string }>;
  information_sources: InformationSource[];
  world_state: Record<string, any>;
  scheduled_events: Array<Record<string, any>>;
  degradation_rules: Array<{
    rule_id: string;
    trigger_time_seconds: number;
    duration_seconds: number;
    degradation_type: DegradationType;
    source_id: string;
    target_roles: RoleEnum[];
    intensity: number;
    parameters: Record<string, any>;
  }>;
  decision_points: DecisionPoint[];
  outcome_rules: Array<{
    rule_id: string;
    condition_decision: string;
    condition_option: string;
    outcome_state: string;
    narrative: string;
    ground_truth_fact: string;
  }>;
  evaluation_rules: Record<string, any>;
}

export interface Participant {
  participant_id: string;
  session_id: string;
  role: RoleEnum;
  display_name: string;
  is_connected: boolean;
  joined_at: string;
  last_seen: string;
}

export interface SessionState {
  session_id: string;
  session_code: string;
  scenario_id: string;
  scenario_title: string;
  status: ScenarioState;
  seed: number;
  scenario_time: number;
  duration_seconds: number;
  participants: Participant[];
  active_degradations: ActiveDegradation[];
  active_conflicts: ContradictionItem[];
  uncertainty_budget: UncertaintyBudget;
}

export interface ActiveDegradation {
  inject_id: string;
  degradation_type: DegradationType;
  source_id: string;
  target_roles: RoleEnum[];
  duration_seconds: number;
  remaining_seconds: number;
  intensity: number;
  started_at_scenario_time: number;
  parameters: Record<string, any>;
}

export interface SimulationEvent {
  event_id: string;
  session_id: string;
  scenario_id: string;
  scenario_version: string;
  scenario_time: number;
  server_time: string;
  event_type: EventType;
  actor_id: string;
  role: RoleEnum;
  payload: Record<string, any>;
  visibility: RoleEnum[];
  sequence_number: number;
}

export interface TraineeFeedItem {
  information_id: string;
  source_id: string;
  source_name: string;
  generated_at_time: number;
  received_at_time: number;
  age_seconds: number;
  status: DeliveryStatus;
  reliability: number;
  confidence_class: string;
  content: Record<string, any>;
  is_conflicted: boolean;
  conflict_with_source?: string;
}

export interface MessageItem {
  message_id: string;
  session_id: string;
  sender_id: string;
  sender_role: RoleEnum;
  recipient_role: RoleEnum | null;
  content: string;
  scenario_time: number;
  timestamp_utc: string;
  acknowledged_by: RoleEnum[];
}

export interface DecisionContextCard {
  decision_id: string;
  session_id: string;
  trainee_id: string;
  role: RoleEnum;
  timestamp: number;
  decision_type: DecisionType;
  selected_option: string;
  rationale: string;
  confidence: ConfidenceLevel;
  information_seen: Array<Record<string, any>>;
  information_delayed: Array<Record<string, any>>;
  information_missing: string[];
  conflicts_seen: Array<Record<string, any>>;
  later_outcome?: Record<string, any>;
  ground_truth_revelation?: string;
}

export interface AsymmetryMatrixEntry {
  source_id: string;
  source_name: string;
  role: RoleEnum;
  delivery_status: DeliveryStatus;
  latency_added_seconds: number;
  is_conflicted: boolean;
  is_stale: boolean;
  staleness_seconds: number;
}

export interface ContradictionItem {
  conflict_id: string;
  source_a: string;
  source_b: string;
  topic: string;
  value_a: string;
  value_b: string;
  detected_at_time: number;
  resolved_at_time?: number;
  is_resolved: boolean;
  resolution_note?: string;
}

export interface UncertaintyBudget {
  unresolved_contradictions: number;
  stale_feeds: number;
  unavailable_channels: number;
  low_confidence_reports: number;
  total_uncertainty_score: number;
}

export interface AARSummary {
  session_id: string;
  scenario_id: string;
  scenario_title: string;
  seed: number;
  duration_elapsed_seconds: number;
  participants: Participant[];
  total_decisions: number;
  decisions: DecisionContextCard[];
  active_conflicts: ContradictionItem[];
  asymmetry_matrix: AsymmetryMatrixEntry[];
  uncertainty_budget: UncertaintyBudget;
  timeline_events: SimulationEvent[];
  training_metrics: Record<string, any>;
  ground_truth_resolution: string;
  disclaimer: string;
}
