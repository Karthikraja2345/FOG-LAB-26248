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
import {
  Play,
  Pause,
  Activity,
  Square
} from 'lucide-react';

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
    if (!localState || (localState.state !== 'ACTIVE' && localState.state !== 'DEGRADED')) return;

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
    <div className="w-full max-w-[1600px] mx-auto px-6 py-6">
      {/* Top Command Bar */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 mb-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h2 className="font-serif text-2xl font-bold text-[#14213D]">
              Instructor Command Console
            </h2>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#14213D]/10 text-[#14213D] border border-[#14213D]/20">
              EXERCISE: {session.session_code}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                currentState === 'ACTIVE' || currentState === 'DEGRADED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {currentState}
            </span>
          </div>
          <p className="text-xs text-[#6B7280]">
            Scenario: <strong>{session.scenario_title}</strong> • Seed: <span className="font-mono">{session.seed}</span>
          </p>
        </div>

        {/* Simulation Clock & Operational Controls */}
        <div className="flex items-center gap-3">
          <div className="bg-[#F9FAFB] border border-[#E5E5E5] px-4 py-2 rounded-lg text-center">
            <div className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">
              Elapsed Time
            </div>
            <div className="text-xl font-bold font-mono text-[#14213D]">
              T+{Math.round(currentScenarioTime)}s
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentState === 'BRIEFING' && (
              <button
                onClick={handleStart}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Play size={14} />
                <span>Start Exercise</span>
              </button>
            )}

            {(currentState === 'ACTIVE' || currentState === 'DEGRADED') && (
              <button
                onClick={handlePause}
                className="px-4 py-2 rounded-lg bg-amber-500 text-black text-xs font-semibold hover:bg-amber-600 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Pause size={14} />
                <span>Pause</span>
              </button>
            )}

            {currentState === 'SESSION_PAUSED' && (
              <button
                onClick={handleResume}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Play size={14} />
                <span>Resume</span>
              </button>
            )}

            <button
              onClick={handleEnd}
              className="px-3.5 py-2 rounded-lg bg-white border border-red-300 text-red-600 text-xs font-medium hover:bg-red-50 transition-all flex items-center gap-1.5"
            >
              <Square size={13} />
              <span>Conclude</span>
            </button>

            {/* Manual Step Controls */}
            <div className="flex items-center gap-1 ml-2 border-l border-[#E5E5E5] pl-3">
              <button
                onClick={() => handleManualTick(5.0)}
                disabled={isTicking}
                className="px-2.5 py-1.5 rounded bg-white border border-[#E5E5E5] text-xs font-mono text-[#14213D] hover:bg-[#F9FAFB]"
              >
                +5s
              </button>
              <button
                onClick={() => handleManualTick(30.0)}
                disabled={isTicking}
                className="px-2.5 py-1.5 rounded bg-white border border-[#E5E5E5] text-xs font-mono text-[#14213D] hover:bg-[#F9FAFB]"
              >
                +30s
              </button>
            </div>

            <button
              onClick={onNavigateAAR}
              className="ml-3 px-4 py-2 rounded-lg bg-[#FCA311] text-black text-xs font-semibold hover:bg-[#E08C05] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Activity size={14} />
              <span>View AAR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Ingestion & Injects, Right Asymmetry & Contradiction */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on desktop): Degradation Composer and Injects */}
        <div className="xl:col-span-2 space-y-6">
          {scenarioPkg && (
            <DegradationComposer
              sessionId={session.session_id}
              sources={scenarioPkg.information_sources}
              activeDegradations={localState?.active_injects || []}
              onInjectCommitted={reloadState}
            />
          )}

          {/* Realtime Asymmetry Matrix */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[#14213D] mb-4">
              Real-Time Information Asymmetry Matrix
            </h3>
            <InformationAsymmetryMatrix
              matrix={localState?.asymmetry_matrix || []}
            />
          </div>

          {/* Contradiction Heatmap */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[#14213D] mb-4">
              Active Sensor Contradictions
            </h3>
            <ContradictionHeatmap
              conflicts={localState?.active_conflicts || []}
            />
          </div>
        </div>

        {/* Right Column: Uncertainty Budget and Event Timeline */}
        <div className="space-y-6">
          <UncertaintyPanel
            budget={localState?.uncertainty_budget || {
              unresolved_contradictions: 0,
              stale_feeds: 0,
              unavailable_channels: 0,
              low_confidence_reports: 0,
              total_uncertainty_score: 0
            }}
          />

          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
            <h3 className="font-serif text-base font-bold text-[#14213D] mb-3">
              Discrete Event Ledger
            </h3>
            <Timeline events={timelineEvents} />
          </div>
        </div>
      </div>
    </div>
  );
};
