import React, { useState } from 'react';
import { DecisionPoint, DecisionType, ConfidenceLevel, RoleEnum } from '../types';
import { FileText, CheckCircle2, AlertTriangle, Send, Shield } from 'lucide-react';

interface DecisionPanelProps {
  decisionPoint: DecisionPoint | null;
  role: RoleEnum;
  onSubmit: (decision: {
    selected_option: string;
    decision_type: DecisionType;
    rationale: string;
    confidence: ConfidenceLevel;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  decisionPoint,
  role,
  onSubmit,
  isSubmitting = false
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [rationale, setRationale] = useState<string>('');
  const [confidence, setConfidence] = useState<ConfidenceLevel>('MEDIUM');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!decisionPoint) {
    return (
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 text-center text-xs text-[#6B7280] shadow-sm">
        <div className="w-10 h-10 rounded-full bg-[#14213D]/5 text-[#14213D] flex items-center justify-center mx-auto mb-3">
          <Shield size={18} />
        </div>
        <p className="font-medium text-[#14213D]">No Actionable Decision Dispatch Pending</p>
        <p className="text-[11px] text-[#6B7280] mt-1">
          Monitor your sensor feeds and coordinate with sub-unit members. Decision points trigger based on exercise timeline.
        </p>
      </div>
    );
  }

  const isRoleAllowed = decisionPoint.allowed_roles.includes(role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) {
      setError('Please select an operational option.');
      return;
    }
    if (!rationale.trim()) {
      setError('Please state brief tactical rationale.');
      return;
    }
    setError(null);
    try {
      await onSubmit({
        selected_option: selectedOption,
        decision_type: decisionPoint.decision_type,
        rationale,
        confidence
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    }
  };

  return (
    <div className="bg-white border-2 border-[#14213D] rounded-xl p-6 shadow-md">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#14213D] text-[#FCA311] flex items-center justify-center">
            <FileText size={15} />
          </div>
          <div>
            <span className="font-mono text-xs font-bold text-[#14213D] uppercase">
              Command Dispatch: {decisionPoint.decision_point_id}
            </span>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
            isRoleAllowed
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {isRoleAllowed ? 'AUTHORIZED TO ACT' : 'AUTHORITY RESTRICTED'}
        </span>
      </div>

      {submitted ? (
        <div className="p-6 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
          <CheckCircle2 size={32} className="text-emerald-600 mx-auto mb-2" />
          <h4 className="font-serif text-lg font-bold text-emerald-900 mb-1">
            Decision Logged in Immutable Ledger
          </h4>
          <p className="text-xs text-emerald-700">
            Hindsight-safe context snapshot captured. Evaluators will assess your process against available telemetry.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Prompt */}
          <div>
            <h3 className="font-serif text-base font-bold text-[#14213D] leading-snug">
              {decisionPoint.prompt}
            </h3>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Options */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-[#14213D] uppercase tracking-wider">
              Select Tactical Action:
            </label>
            {decisionPoint.options.map((opt) => (
              <label
                key={opt.option_id}
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                  selectedOption === opt.option_id
                    ? 'border-[#FCA311] bg-[#FCA311]/10 ring-1 ring-[#FCA311]'
                    : 'border-[#E5E5E5] bg-[#F9FAFB] hover:border-[#14213D]/40'
                }`}
              >
                <input
                  type="radio"
                  name="decision_option"
                  value={opt.option_id}
                  checked={selectedOption === opt.option_id}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  disabled={!isRoleAllowed}
                  className="mt-1 accent-[#FCA311]"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-[#14213D]">{opt.label}</div>
                  <div className="text-[11px] text-[#4B5563] mt-0.5">{opt.description}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Rationale and Confidence */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#14213D] uppercase tracking-wider mb-1.5">
                Commander's Tactical Rationale:
              </label>
              <textarea
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="State why this action was chosen despite degraded telemetry or contradictions..."
                rows={3}
                disabled={!isRoleAllowed}
                className="w-full text-xs p-2.5 rounded-lg border border-[#E5E5E5] text-[#14213D] placeholder-[#9CA3AF] focus:outline-none focus:border-[#14213D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#14213D] uppercase tracking-wider mb-1.5">
                Subjective Confidence:
              </label>
              <select
                value={confidence}
                onChange={(e) => setConfidence(e.target.value as ConfidenceLevel)}
                disabled={!isRoleAllowed}
                className="w-full text-xs p-2.5 rounded-lg border border-[#E5E5E5] bg-white text-[#14213D] focus:outline-none focus:border-[#14213D]"
              >
                <option value="VERY_HIGH">Very High (90%+)</option>
                <option value="HIGH">High (75-90%)</option>
                <option value="MEDIUM">Medium (50-75%)</option>
                <option value="LOW">Low (25-50%)</option>
                <option value="VERY_LOW">Very Low (&lt;25%)</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!isRoleAllowed || isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#14213D] text-white text-xs font-semibold hover:bg-[#0B132B] disabled:opacity-50 transition-all shadow-sm"
            >
              <Send size={13} className="text-[#FCA311]" />
              <span>{isSubmitting ? 'Recording Ledger...' : 'Commit Operational Decision'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
