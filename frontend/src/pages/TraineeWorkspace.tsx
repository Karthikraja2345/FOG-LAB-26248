import React, { useState, useEffect } from 'react';
import {
  SessionResponse, RoleEnum, DecisionType, ConfidenceLevel
} from '../types';
import { fetchSessionState, submitDecision } from '../services/api';
import { useSimulationSocket } from '../hooks/useSimulationSocket';
import { FeedPanel } from '../components/FeedPanel';
import { DecisionPanel } from '../components/DecisionPanel';
import { TeamPanel } from '../components/TeamPanel';
import { UncertaintyPanel } from '../components/UncertaintyPanel';

interface TraineeWorkspaceProps {
  session: SessionResponse;
}

export const TraineeWorkspace: React.FC<TraineeWorkspaceProps> = ({ session }) => {
  const [selectedRole, setSelectedRole] = useState<RoleEnum>('TEAM_LEAD');
  const [traineeState, setTraineeState] = useState<any>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Realtime socket connection as selected trainee role
  const { isConnected, latestState } = useSimulationSocket({
    sessionId: session.session_id,
    role: selectedRole,
    participantId: `TRAINEE-${selectedRole}`,
    onStateUpdate: (st) => setTraineeState(st)
  });

  const reloadState = async () => {
    try {
      const st = await fetchSessionState(session.session_id, selectedRole);
      setTraineeState(st);
    } catch (err) {
      console.error('Failed to load trainee state:', err);
    }
  };

  useEffect(() => {
    reloadState();
  }, [session.session_id, selectedRole]);

  useEffect(() => {
    if (latestState) {
      setTraineeState(latestState);
    }
  }, [latestState]);

  const handleDecisionSubmit = async (decision: {
    selected_option: string;
    decision_type: DecisionType;
    rationale: string;
    confidence: ConfidenceLevel;
  }) => {
    setSubmitting(true);
    try {
      await submitDecision(session.session_id, {
        trainee_id: `TRAINEE-${selectedRole}`,
        role: selectedRole,
        decision_type: decision.decision_type,
        selected_option: decision.selected_option,
        rationale: decision.rationale,
        confidence: decision.confidence
      });
      await reloadState();
    } finally {
      setSubmitting(false);
    }
  };

  const feeds = traineeState?.feeds || [];
  const scenarioTime = traineeState?.scenario_time || 0.0;
  const decisionPoint = traineeState?.active_decision_point || null;
  const messages = traineeState?.messages || [];

  return (
    <div style={{ padding: '16px 20px', maxWidth: '1600px', margin: '0 auto', width: '100%', height: 'calc(100vh - 84px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Trainee Bar */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '10px 16px',
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              TERMINAL ROLE:
            </span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as RoleEnum)}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--accent-cyan)',
                background: 'var(--bg-tertiary)',
                borderColor: 'var(--accent-cyan)'
              }}
            >
              <option value="TEAM_LEAD">TEAM LEAD (Command Authority)</option>
              <option value="COORDINATION">COORDINATION (Tactical Operations)</option>
              <option value="INFORMATION">INFORMATION (Signals & EW)</option>
            </select>
          </div>

          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#93c5fd',
              padding: '2px 8px',
              borderRadius: '3px'
            }}
          >
            SESSION: {session.session_code}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isConnected ? 'var(--accent-green)' : 'var(--accent-red)'
              }}
            />
            <span>{isConnected ? 'TACTICAL LINK ACTIVE' : 'RECONNECTING...'}</span>
          </div>

          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-cyan)'
            }}
          >
            T+{Math.round(scenarioTime)}s
          </div>
        </div>
      </div>

      {/* Main 3-Column Command Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr 1fr', gap: '12px', flex: 1, minHeight: 0 }}>
        {/* Left Column: Intelligence Feeds */}
        <div style={{ height: '100%', minHeight: 0 }}>
          <FeedPanel feeds={feeds} scenarioTime={scenarioTime} />
        </div>

        {/* Center Column: Tactical Situation & Decision Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', minHeight: 0, overflowY: 'auto' }}>
          {/* Tactical Context Window */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '14px'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              OPERATIONAL SITUATION: {session.scenario_title}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              You are deployed as <strong>{selectedRole.replace('_', ' ')}</strong>. Due to electronic jamming and sensor lag, intelligence streams may be conflicting, delayed, or occluded. Cross-check reports with your unit members over the tactical net before authorizing irrevocable maneuvers.
            </p>
          </div>

          {/* Uncertainty Budget for Trainee */}
          {traineeState?.uncertainty_budget && (
            <UncertaintyPanel budget={traineeState.uncertainty_budget} />
          )}

          {/* Decision Panel */}
          <DecisionPanel
            decisionPoint={decisionPoint}
            role={selectedRole}
            onSubmit={handleDecisionSubmit}
            isSubmitting={submitting}
          />
        </div>

        {/* Right Column: Tactical Coordination Net */}
        <div style={{ height: '100%', minHeight: 0 }}>
          <TeamPanel
            sessionId={session.session_id}
            myRole={selectedRole}
            myId={`TRAINEE-${selectedRole}`}
            messages={messages}
            onMessageSent={reloadState}
          />
        </div>
      </div>
    </div>
  );
};
