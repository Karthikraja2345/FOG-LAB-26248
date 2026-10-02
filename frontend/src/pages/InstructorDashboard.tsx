import React, { useState, useEffect } from 'react';
import {
  SessionResponse, ScenarioPackage,
  SimulationEvent
} from '../types';
import {
  startSession, pauseSession, resumeSession, endSession, tickSession,
  fetchSessionState, fetchScenarios
} from '../services/api';
import { useSimulationSocket } from '../hooks/useSimulationSocket';
import { DegradationComposer } from '../components/DegradationComposer';
import { InformationAsymmetryMatrix } from '../components/InformationAsymmetryMatrix';
import { ContradictionHeatmap } from '../components/ContradictionHeatmap';
import { UncertaintyPanel } from '../components/UncertaintyPanel';
import { Timeline } from '../components/Timeline';

interface InstructorDashboardProps {
  session: SessionResponse;
  onNavigateAAR: () => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ session, onNavigateAAR }) => {
  const [scenarioPkg, setScenarioPkg] = useState<ScenarioPackage | null>(null);
  const [localState, setLocalState] = useState<any>(null);
  const [timelineEvents, setTimelineEvents] = useState<SimulationEvent[]>([]);
  const [isTicking, setIsTicking] = useState<boolean>(false);

  // Realtime WebSocket synchronization
  const { latestState } = useSimulationSocket({
    sessionId: session.session_id,
    role: 'INSTRUCTOR',
    participantId: 'INSTRUCTOR_LEAD',
    onStateUpdate: (st) => setLocalState(st),
    onEvent: (evt) => setTimelineEvents((prev) => [...prev, evt])
  });

  const reloadState = async () => {
    try {
      const st = await fetchSessionState(session.session_id, 'INSTRUCTOR');
      setLocalState(st);
    } catch (err) {
      console.error('Failed to reload state:', err);
    }
  };

  useEffect(() => {
    fetchScenarios().then((list) => {
      const p = list.find((s) => s.scenario_id === session.scenario_id);
      if (p) setScenarioPkg(p);
    });
    reloadState();
  }, [session.session_id, session.scenario_id]);

  useEffect(() => {
    if (latestState) {
      setLocalState(latestState);
    }
  }, [latestState]);

  // Periodic automatic ticking if session is active
  useEffect(() => {
    if (!localState || localState.state !== 'ACTIVE' && localState.state !== 'DEGRADED') return;

    const interval = setInterval(async () => {
      try {
        await tickSession(session.session_id, 1.0);
      } catch (e) {
        // Ticking error handled silently in background
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session.session_id, localState?.state]);

  const handleStart = async () => {
    await startSession(session.session_id);
    await reloadState();
  };

  const handlePause = async () => {
    await pauseSession(session.session_id);
    await reloadState();
  };

  const handleResume = async () => {
    await resumeSession(session.session_id);
    await reloadState();
  };

  const handleEnd = async () => {
    await endSession(session.session_id);
    await reloadState();
  };

  const handleManualTick = async (delta: number) => {
    setIsTicking(true);
    try {
      await tickSession(session.session_id, delta);
      await reloadState();
    } finally {
      setIsTicking(false);
    }
  };

  const currentState = localState?.state || session.status;
  const currentScenarioTime = localState?.scenario_time || session.scenario_time;

  return (
    <div style={{ padding: '16px 24px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
      {/* Top Command Bar */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '14px 20px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
              INSTRUCTOR CONTROL ROOM
            </span>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                padding: '2px 8px',
                borderRadius: '3px'
              }}
            >
              CODE: {session.session_code}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                background:
                  currentState === 'ACTIVE' || currentState === 'DEGRADED'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(245, 158, 11, 0.2)',
                color:
                  currentState === 'ACTIVE' || currentState === 'DEGRADED'
                    ? 'var(--accent-green)'
                    : 'var(--accent-amber)',
                padding: '2px 8px',
                borderRadius: '3px',
                fontWeight: 700
              }}
            >
              STATUS: {currentState}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Scenario: <strong>{session.scenario_title}</strong> • Seed: <span className="mono">{session.seed}</span>
          </div>
        </div>

        {/* Simulation Clock & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              padding: '6px 14px',
              borderRadius: '4px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              SIMULATION TIME
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
              T+{Math.round(currentScenarioTime)}s
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {currentState === 'BRIEFING' && (
              <button
                onClick={handleStart}
                style={{
                  background: 'var(--accent-green)',
                  color: '#000',
                  fontWeight: 700,
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '12px'
                }}
              >
                ▶ START EXERCISE
              </button>
            )}

            {(currentState === 'ACTIVE' || currentState === 'DEGRADED') && (
              <button
                onClick={handlePause}
                style={{
                  background: 'var(--accent-amber)',
                  color: '#000',
                  fontWeight: 700,
                  padding: '8px 14px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '12px'
                }}
              >
                ⏸ PAUSE
              </button>
            )}

            {currentState === 'SESSION_PAUSED' && (
              <button
                onClick={handleResume}
                style={{
                  background: 'var(--accent-green)',
                  color: '#000',
                  fontWeight: 700,
                  padding: '8px 14px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '12px'
                }}
              >
                ▶ RESUME
              </button>
            )}

            <button
              onClick={handleEnd}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: 'var(--accent-red)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '8px 14px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              ⏹ END EXERCISE
            </button>

            <button
              onClick={onNavigateAAR}
              style={{
                background: 'var(--accent-blue)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              📊 VIEW AAR & LEDGER →
            </button>
          </div>

          {/* Manual step controls */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => handleManualTick(5.0)}
              disabled={isTicking}
              title="Advance 5 seconds"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                padding: '6px 10px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)'
              }}
            >
              +5s
            </button>
            <button
              onClick={() => handleManualTick(15.0)}
              disabled={isTicking}
              title="Advance 15 seconds"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                padding: '6px 10px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)'
              }}
            >
              +15s
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Left Column: Ground truth & Asymmetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Ground Truth Reality Banner */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--accent-cyan)',
              borderRadius: '6px',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
                GROUND TRUTH OPERATIONAL REALITY (CONCEALED FROM TRAINEES)
              </span>
              <span style={{ fontSize: '10px', color: 'var(--accent-red)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                CLASSIFIED / INSTRUCTOR ONLY
              </span>
            </div>
            <div
              style={{
                background: 'var(--bg-primary)',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#fff',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {JSON.stringify(localState?.ground_truth_world_state || scenarioPkg?.world_state, null, 2)}
            </div>
          </div>

          {/* Uncertainty Budget */}
          {localState?.uncertainty_budget && (
            <UncertaintyPanel budget={localState.uncertainty_budget} />
          )}

          {/* Information Asymmetry Matrix */}
          <InformationAsymmetryMatrix matrix={localState?.asymmetry_matrix || []} />
        </div>

        {/* Right Column: Fog Composer & Contradictions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {scenarioPkg && (
            <DegradationComposer
              sessionId={session.session_id}
              sources={scenarioPkg.information_sources}
              activeDegradations={localState?.active_degradations || []}
              onInjectCommitted={reloadState}
            />
          )}

          <ContradictionHeatmap conflicts={localState?.active_conflicts || []} />
        </div>
      </div>

      {/* Bottom Timeline */}
      <div style={{ height: '240px' }}>
        <Timeline events={timelineEvents} />
      </div>
    </div>
  );
};
