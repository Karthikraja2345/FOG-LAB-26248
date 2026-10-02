import React, { useState } from 'react';
import { InformationSource, RoleEnum, DegradationType, ActiveDegradation } from '../types';
import { injectDegradation, recoverDegradation, previewInject } from '../services/api';
import {
  SlidersHorizontal,
  Eye,
  Zap,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface DegradationComposerProps {
  sessionId: string;
  sources: InformationSource[];
  activeDegradations: ActiveDegradation[];
  onInjectCommitted?: () => void;
}

export const DegradationComposer: React.FC<DegradationComposerProps> = ({
  sessionId,
  sources,
  activeDegradations,
  onInjectCommitted
}) => {
  const [selectedSource, setSelectedSource] = useState<string>(sources[0]?.source_id || '');
  const [selectedMode, setSelectedMode] = useState<DegradationType>('DELAY');
  const [targetRoles, setTargetRoles] = useState<RoleEnum[]>([
    'TEAM_LEAD',
    'COORDINATION'
  ]);
  const [duration, setDuration] = useState<number>(60);
  const [intensity, setIntensity] = useState<number>(0.75);
  const [preview, setPreview] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleToggle = (role: RoleEnum) => {
    if (targetRoles.includes(role)) {
      setTargetRoles(targetRoles.filter((r) => r !== role));
    } else {
      setTargetRoles([...targetRoles, role]);
    }
  };

  const handlePreview = async () => {
    if (!selectedSource) return;
    try {
      const p = await previewInject(sessionId, {
        source_id: selectedSource,
        target_roles: targetRoles,
        degradation_type: selectedMode,
        duration_seconds: duration,
        intensity
      });
      setPreview(p);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInject = async () => {
    if (!selectedSource) {
      setError('Please select an intelligence source.');
      return;
    }
    if (targetRoles.length === 0) {
      setError('Please select at least one target role.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await injectDegradation(sessionId, {
        source_id: selectedSource,
        target_roles: targetRoles,
        degradation_type: selectedMode,
        duration_seconds: duration,
        intensity,
        parameters: {
          delay_seconds: selectedMode === 'DELAY' ? Math.round(duration * 0.7) : 0,
          conflicting_source: selectedMode === 'CONTRADICTION' ? 'SOURCE_C_HUMINT' : undefined,
          opposing_claim:
            selectedMode === 'CONTRADICTION'
              ? 'Axis Bravo convoy is confirmed hostile main assault echelon!'
              : undefined
        }
      });
      setPreview(null);
      if (onInjectCommitted) onInjectCommitted();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecover = async (injectId: string) => {
    try {
      await recoverDegradation(sessionId, injectId);
      if (onInjectCommitted) onInjectCommitted();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const degradationModes: { type: DegradationType; label: string; desc: string }[] = [
    { type: 'DELAY', label: 'Telemetry Delay', desc: 'Adds deterministic latency jitter' },
    { type: 'DROPOUT', label: 'Channel Dropout', desc: 'Suppresses feed updates completely' },
    { type: 'CONTRADICTION', label: 'Contradiction', desc: 'Injects conflicting tactical assertions' },
    { type: 'STALENESS', label: 'Staleness Aging', desc: 'Freezes coordinates while age ticks' },
    { type: 'PARTIAL_PAYLOAD', label: 'Partial Payload', desc: 'Truncates sensor attributes' },
    { type: 'INTERMITTENT', label: 'Intermittent Pulse', desc: 'Periodic burst connectivity' },
  ];

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#14213D] text-[#FCA311] flex items-center justify-center">
            <SlidersHorizontal size={16} />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#14213D]">
              Live Degradation Composer
            </h3>
            <p className="text-xs text-[#6B7280]">
              Dynamically inject communication impediments into active sub-unit channels
            </p>
          </div>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FCA311]/15 text-[#B45309] font-medium border border-[#FCA311]/30">
          7 MATH TRANSFORMS
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode Grid */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-[#14213D] uppercase tracking-wider mb-2">
          Select Degradation Transform:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {degradationModes.map((m) => (
            <button
              key={m.type}
              type="button"
              onClick={() => setSelectedMode(m.type)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                selectedMode === m.type
                  ? 'border-[#FCA311] bg-[#FCA311]/10 ring-1 ring-[#FCA311]'
                  : 'border-[#E5E5E5] bg-[#F9FAFB] hover:border-[#14213D]/30'
              }`}
            >
              <div className="text-xs font-semibold text-[#14213D]">{m.label}</div>
              <div className="text-[10px] text-[#6B7280] mt-0.5">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Target Channel and Target Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-semibold text-[#14213D] uppercase tracking-wider mb-1.5">
            Target Intelligence Source:
          </label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-[#E5E5E5] bg-white text-[#14213D] focus:outline-none focus:border-[#14213D]"
          >
            {sources.map((s) => (
              <option key={s.source_id} value={s.source_id}>
                {s.name} ({s.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#14213D] uppercase tracking-wider mb-1.5">
            Target Roles (Asymmetric Impact):
          </label>
          <div className="flex flex-wrap gap-2">
            {(['TEAM_LEAD', 'COORDINATION', 'INFORMATION'] as RoleEnum[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleToggle(r)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all ${
                  targetRoles.includes(r)
                    ? 'bg-[#14213D] text-white border-[#14213D]'
                    : 'bg-white text-[#4B5563] border-[#E5E5E5] hover:border-[#14213D]/40'
                }`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Duration and Intensity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <div className="flex justify-between text-xs font-semibold text-[#14213D] mb-1">
            <span>DURATION: {duration}s</span>
            <span className="text-[#6B7280] font-normal">{Math.round(duration / 60)} min</span>
          </div>
          <input
            type="range"
            min="10"
            max="180"
            step="10"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full accent-[#FCA311]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-[#14213D] mb-1">
            <span>INTENSITY: {Math.round(intensity * 100)}%</span>
            <span className="text-[#6B7280] font-normal">Severity</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full accent-[#FCA311]"
          />
        </div>
      </div>

      {/* Preview Box */}
      {preview && (
        <div className="mb-4 p-3.5 rounded-lg bg-[#F9FAFB] border border-[#E5E5E5] text-xs">
          <div className="font-semibold text-[#14213D] mb-1 flex items-center gap-1.5">
            <Eye size={13} className="text-[#FCA311]" />
            Deterministic Inject Preview:
          </div>
          <p className="text-[#4B5563] leading-relaxed mb-2">{preview.narrative}</p>
          <div className="flex gap-4 text-[11px] font-mono text-[#6B7280]">
            <span>Latency Delta: +{preview.added_latency_seconds}s</span>
            <span>Delivery: {preview.expected_delivery_status}</span>
            <span>Conflicted: {preview.will_conflict ? 'YES' : 'NO'}</span>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePreview}
          className="px-4 py-2 rounded-lg bg-white border border-[#E5E5E5] text-[#14213D] text-xs font-medium hover:bg-[#F9FAFB] flex items-center gap-1.5"
        >
          <Eye size={13} />
          <span>Preview Impact</span>
        </button>

        <button
          type="button"
          onClick={handleInject}
          disabled={isSubmitting}
          className="px-5 py-2 rounded-lg bg-[#14213D] text-white text-xs font-semibold hover:bg-[#0B132B] flex items-center gap-2 shadow-sm transition-all"
        >
          <Zap size={14} className="text-[#FCA311]" />
          <span>{isSubmitting ? 'Injecting...' : 'Execute Live Inject'}</span>
        </button>
      </div>

      {/* Active Injects Monitor */}
      {activeDegradations.length > 0 && (
        <div className="mt-6 pt-5 border-t border-[#E5E5E5]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#14213D] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FCA311] animate-pulse"></span>
              Active Degradations ({activeDegradations.length})
            </span>
          </div>

          <div className="space-y-2">
            {activeDegradations.map((deg) => (
              <div
                key={deg.inject_id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFB] border border-[#E5E5E5]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#FCA311]/15 text-[#B45309]">
                    {deg.degradation_type}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-[#14213D]">{deg.source_id}</div>
                    <div className="text-[10px] text-[#6B7280]">
                      Target: {deg.target_roles.join(', ')} • {deg.remaining_seconds}s remaining
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRecover(deg.inject_id)}
                  className="px-2.5 py-1 rounded bg-white border border-[#E5E5E5] text-xs font-medium text-[#14213D] hover:bg-slate-100 flex items-center gap-1 shadow-xs"
                >
                  <RotateCcw size={12} />
                  <span>Restore Feed</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
