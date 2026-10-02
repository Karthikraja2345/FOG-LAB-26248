import React, { useState } from 'react';
import { SessionResponse, CounterfactualComparison } from '../types';
import { GitBranch, Play, Sparkles, RefreshCw, Shield } from 'lucide-react';

interface CounterfactualProps {
  session: SessionResponse;
}

export const Counterfactual: React.FC<CounterfactualProps> = ({ session }) => {
  const [variable, setVariable] = useState<string>('REMOVE_DELAY_SOURCE_B');
  const [comparison, setComparison] = useState<CounterfactualComparison | null>(null);
  const [running, setRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${session.session_id}/counterfactual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_session_id: session.session_id,
          variable_to_modify: variable,
          custom_parameters: {}
        })
      });
      if (!res.ok) throw new Error('Failed to compute counterfactual branch');
      const data: CounterfactualComparison = await res.json();
      setComparison(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div className="pb-6 border-b border-[#E5E5E5]">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FCA311] uppercase tracking-wider mb-2">
          <GitBranch size={14} />
          Causal Sensitivity & What-If Analyzer
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#14213D]">
          Counterfactual Branch Evaluation
        </h2>
        <p className="text-sm text-[#4B5563] mt-1">
          Evaluate how a single controlled change in the communication environment (e.g. eliminating latency on a key radar feed) would have altered information arrival times, decision latency, and tactical outcome under the exact same scenario seed.
        </p>
      </div>

      {/* Control Selector */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <label className="block text-xs font-semibold text-[#14213D] uppercase tracking-wider mb-2">
            Select Controlled Factor to Modify (All Other Variables & Seed Held Constant):
          </label>
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-[#E5E5E5] bg-white text-[#14213D] focus:outline-none focus:border-[#14213D]"
          >
            <option value="REMOVE_DELAY_SOURCE_B">
              Remove Latency Injection on Tactical Radar (Source B) [Delay: 60s → 0s]
            </option>
            <option value="SUPPRESS_CONTRADICTION">
              Suppress Contradiction on Eagle-1 Optical Drone (Source A)
            </option>
          </select>
        </div>

        <button
          onClick={handleRun}
          disabled={running}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#14213D] text-white text-xs font-semibold hover:bg-[#0B132B] disabled:opacity-50 transition-all shadow-sm shrink-0"
        >
          {running ? <RefreshCw size={14} className="animate-spin text-[#FCA311]" /> : <Play size={14} className="text-[#FCA311]" />}
          <span>{running ? 'Computing Branch...' : 'Compute Counterfactual Branch'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Comparison View */}
      {comparison && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base Branch */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
              <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                Actual Session Trajectory (Historical Reality)
              </div>
              <div className="font-serif text-lg font-bold text-[#14213D] mb-4">
                {comparison.base_session_id}
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#E5E5E5]">
                  <span className="text-[#6B7280]">Outcomes:</span>
                  <span className="font-mono font-bold text-[#14213D]">
                    {comparison.base_outcomes.join(', ') || 'Standard completion'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E5E5E5]">
                  <span className="text-[#6B7280]">Radar Latency:</span>
                  <span className="font-mono font-bold text-red-600">60s Jitter Added</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E5E5E5]">
                  <span className="text-[#6B7280]">Perceived State:</span>
                  <span className="font-mono font-bold text-amber-600">Degraded Telemetry</span>
                </div>
              </div>
            </div>

            {/* Counterfactual Branch */}
            <div className="bg-white border-2 border-[#FCA311] rounded-xl p-6 shadow-sm">
              <div className="text-xs font-bold text-[#B45309] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#FCA311]" />
                Hypothetical Counterfactual Trajectory
              </div>
              <div className="font-serif text-lg font-bold text-[#14213D] mb-4">
                {comparison.counterfactual_session_id}
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#E5E5E5]">
                  <span className="text-[#6B7280]">Outcomes:</span>
                  <span className="font-mono font-bold text-[#14213D]">
                    {comparison.counterfactual_outcomes.join(', ') || 'Optimal completion'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E5E5E5]">
                  <span className="text-[#6B7280]">Radar Latency:</span>
                  <span className="font-mono font-bold text-emerald-600">0s (Synchronous)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E5E5E5]">
                  <span className="text-[#6B7280]">Perceived State:</span>
                  <span className="font-mono font-bold text-emerald-600">Real-Time Clarity</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delta Narrative */}
          <div className="bg-[#F4F5F7] border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
            <h3 className="font-serif text-base font-bold text-[#14213D] mb-2 flex items-center gap-2">
              <Shield size={16} className="text-[#14213D]" />
              Causal Delta Narrative
            </h3>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              {comparison.variance_narrative}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
