import {
  ScenarioPackage, SessionResponse, Participant, DecisionContextCard,
  MessageItem, SimulationEvent, AsymmetryMatrixEntry, ContradictionItem,
  RoleEnum, DegradationType, DecisionType, ConfidenceLevel
} from '../types';

const API_BASE = '/api';

export async function fetchScenarios(): Promise<ScenarioPackage[]> {
  const res = await fetch(`${API_BASE}/scenarios`);
  if (!res.ok) throw new Error(`Failed to fetch scenarios: ${res.statusText}`);
  return res.json();
}

export async function createSession(scenarioId: string, seed?: number): Promise<SessionResponse> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario_id: scenarioId, seed })
  });
  if (!res.ok) throw new Error(`Failed to create session: ${res.statusText}`);
  return res.json();
}

export async function joinSession(sessionId: string, role: RoleEnum, displayName: string): Promise<Participant> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/join?role=${role}&display_name=${encodeURIComponent(displayName)}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Failed to join session: ${res.statusText}`);
  return res.json();
}

export async function startSession(sessionId: string): Promise<SessionResponse> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/start`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to start session: ${res.statusText}`);
  return res.json();
}

export async function pauseSession(sessionId: string): Promise<SessionResponse> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/pause`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to pause session: ${res.statusText}`);
  return res.json();
}

export async function resumeSession(sessionId: string): Promise<SessionResponse> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/resume`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to resume session: ${res.statusText}`);
  return res.json();
}

export async function endSession(sessionId: string): Promise<SessionResponse> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/end`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to end session: ${res.statusText}`);
  return res.json();
}

export async function tickSession(sessionId: string, delta: number = 1.0): Promise<any> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/tick?delta=${delta}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to tick simulation: ${res.statusText}`);
  return res.json();
}

export async function fetchSessionState(sessionId: string, role: RoleEnum = 'INSTRUCTOR'): Promise<any> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/state?role=${role}`);
  if (!res.ok) throw new Error(`Failed to fetch state: ${res.statusText}`);
  return res.json();
}

export async function injectDegradation(
  sessionId: string,
  params: {
    source_id: string;
    target_roles: RoleEnum[];
    degradation_type: DegradationType;
    duration_seconds: number;
    intensity: number;
    parameters?: Record<string, any>;
  }
): Promise<any> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/instructor/inject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error(`Failed to inject degradation: ${res.statusText}`);
  return res.json();
}

export async function recoverDegradation(sessionId: string, injectId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/instructor/recover/${injectId}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Failed to recover degradation: ${res.statusText}`);
  return res.json();
}

export async function previewInject(
  sessionId: string,
  params: {
    source_id: string;
    target_roles: RoleEnum[];
    degradation_type: DegradationType;
    duration_seconds: number;
    intensity: number;
  }
): Promise<any> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/instructor/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error(`Failed to preview inject: ${res.statusText}`);
  return res.json();
}

export async function submitDecision(
  sessionId: string,
  decision: {
    trainee_id: string;
    role: RoleEnum;
    decision_type: DecisionType;
    selected_option: string;
    rationale: string;
    confidence: ConfidenceLevel;
  }
): Promise<DecisionContextCard> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/decisions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(decision)
  });
  if (!res.ok) throw new Error(`Failed to submit decision: ${res.statusText}`);
  return res.json();
}

export async function sendTeamMessage(
  sessionId: string,
  message: {
    sender_id: string;
    sender_role: RoleEnum;
    recipient_role: RoleEnum | null;
    content: string;
  }
): Promise<MessageItem> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
  if (!res.ok) throw new Error(`Failed to send message: ${res.statusText}`);
  return res.json();
}

export async function fetchTimeline(sessionId: string, role: RoleEnum = 'INSTRUCTOR'): Promise<SimulationEvent[]> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/timeline?role=${role}`);
  if (!res.ok) throw new Error(`Failed to fetch timeline: ${res.statusText}`);
  return res.json();
}

export async function fetchAsymmetryMatrix(sessionId: string): Promise<AsymmetryMatrixEntry[]> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/instructor/asymmetry`);
  if (!res.ok) throw new Error(`Failed to fetch asymmetry: ${res.statusText}`);
  return res.json();
}

export async function fetchContradictions(sessionId: string): Promise<ContradictionItem[]> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/instructor/contradictions`);
  if (!res.ok) throw new Error(`Failed to fetch contradictions: ${res.statusText}`);
  return res.json();
}
