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
import { Wifi } from 'lucide-react';

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
    <div className="w-full max-w-[1600px] mx-auto px-6 py-6 min-h-[calc(100vh-80px)] flex flex-col">
      {/* Top Station Header */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              Tactical Terminal Role:
            </span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as RoleEnum)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-[#F9FAFB] text-[#14213D] focus:outline-none focus:border-[#14213D]"
            >
              <option value="TEAM_LEAD">Team Lead (Convoy Commander)</option>
              <option value="COORDINATION">Coordination Lead (Operations)</option>
              <option value="INFORMATION">Information Lead (Signals / Spectrum)</option>
            </select>
          </div>

          <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#14213D]/5 text-[#14213D] font-bold border border-[#14213D]/10">
            EXERCISE: {session.session_code}
          </span>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#6B7280]">
            <Wifi size={13} className={isConnected ? 'text-emerald-500' : 'text-red-500'} />
            <span>{isConnected ? 'TACTICAL DATA-LINK ONLINE' : 'DISCONNECTED'}</span>
          </div>

          <div className="bg-[#F9FAFB] border border-[#E5E5E5] px-3.5 py-1.5 rounded-lg text-center">
            <span className="text-[10px] font-semibold text-[#6B7280] uppercase mr-2">Time:</span>
            <span className="text-sm font-mono font-bold text-[#14213D]">T+{Math.round(scenarioTime)}s</span>
          </div>
        </div>
      </div>

      {/* 3-Column Tactical Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column (4 cols): Sensor Feeds */}
        <div className="lg:col-span-4 h-[650px]">
          <FeedPanel feeds={feeds} scenarioTime={scenarioTime} />
        </div>

        {/* Center Column (4 cols): Tactical Decision Panel */}
        <div className="lg:col-span-4 space-y-6">
          <DecisionPanel
            decisionPoint={decisionPoint}
            role={selectedRole}
            onSubmit={handleDecisionSubmit}
            isSubmitting={submitting}
          />

          <UncertaintyPanel
            budget={traineeState?.uncertainty_budget || {
              unresolved_contradictions: 0,
              stale_feeds: 0,
              unavailable_channels: 0,
              low_confidence_reports: 0,
              total_uncertainty_score: 0
            }}
          />
        </div>

        {/* Right Column (4 cols): Team Coordination Net */}
        <div className="lg:col-span-4 h-[650px]">
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
