import React, { useState } from 'react';
import { DecisionContextCard } from '../types';
import { Eye, EyeOff, ShieldCheck, Clock } from 'lucide-react';

interface DecisionContextCardProps {
  card: DecisionContextCard;
}

export const DecisionContextCardView: React.FC<DecisionContextCardProps> = ({ card }) => {
  const [showLaterTruth, setShowLaterTruth] = useState<boolean>(false);

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden mb-6 shadow-sm">
      {/* Header bar */}
      <div className="bg-[#F9FAFB] px-5 py-3.5 border-b border-[#E5E5E5] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-[#14213D] bg-[#14213D]/10 px-2 py-0.5 rounded">
            {card.decision_id}
          </span>
          <span className="text-xs font-semibold text-[#14213D]">
            ROLE: {card.role}
          </span>
          <span className="text-xs font-mono text-[#6B7280]">
            SUBMITTED AT: T+{card.timestamp}s
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
              card.confidence === 'HIGH'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : card.confidence === 'MEDIUM'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            CONFIDENCE: {card.confidence}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Section 1: Hindsight-Safe What the trainee knew */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#14213D] uppercase tracking-wider mb-3">
            <Clock size={14} className="text-[#FCA311]" />
            <span>Section 1: Information Snapshot Knowable at T+{card.timestamp}s</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#F9FAFB] p-4 rounded-lg border border-[#E5E5E5]">
              <div className="text-[11px] font-semibold text-[#6B7280] uppercase mb-2">
                Delivered Telemetry Feeds ({card.information_seen.length})
              </div>
              <ul className="space-y-1.5 text-xs text-[#14213D]">
                {card.information_seen.length > 0 ? (
                  card.information_seen.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{f.source_name || f.source_id || JSON.stringify(f)}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-[#9CA3AF] italic">Zero telemetry feeds arrived</li>
                )}
              </ul>
            </div>

            <div className="bg-[#F9FAFB] p-4 rounded-lg border border-[#E5E5E5]">
              <div className="text-[11px] font-semibold text-[#6B7280] uppercase mb-2">
                Communication Impediments Active
              </div>
              <div className="space-y-1.5 text-xs">
                {card.information_delayed.length > 0 && (
                  <div className="text-amber-700">
                    <strong>Delayed:</strong> {card.information_delayed.map((d) => d.source_name || d.source_id).join(', ')}
                  </div>
                )}
                {card.information_missing.length > 0 && (
                  <div className="text-red-700">
                    <strong>Dropped / Missing:</strong> {card.information_missing.join(', ')}
                  </div>
                )}
                {card.conflicts_seen.length > 0 && (
                  <div className="text-purple-700">
                    <strong>Contradictions:</strong> {card.conflicts_seen.length} detected
                  </div>
                )}
                {card.information_delayed.length === 0 && card.information_missing.length === 0 && card.conflicts_seen.length === 0 && (
                  <div className="text-[#6B7280] italic">No active impediments recorded</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Tactical Action Chosen */}
        <div className="bg-[#F4F5F7] p-4 rounded-lg border border-[#E5E5E5]">
          <div className="text-xs font-bold text-[#14213D] uppercase tracking-wider mb-2">
            Section 2: Tactical Action Committed & Rationale
          </div>
          <div className="text-sm font-bold text-[#14213D] mb-1">
            {card.selected_option}
          </div>
          <p className="text-xs text-[#4B5563] italic leading-relaxed">
            "{card.rationale}"
          </p>
        </div>

        {/* Section 3: Ground Truth Reality (with toggle) */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs font-bold text-[#14213D] uppercase tracking-wider">
              Section 3: Ground Truth Reality
            </div>
            <button
              onClick={() => setShowLaterTruth(!showLaterTruth)}
              className="text-xs font-semibold text-[#14213D] hover:text-[#000000] flex items-center gap-1.5 bg-white border border-[#E5E5E5] px-3 py-1 rounded shadow-2xs"
            >
              {showLaterTruth ? <EyeOff size={13} /> : <Eye size={13} className="text-[#FCA311]" />}
              <span>{showLaterTruth ? 'Mask Reality' : 'Reveal Ground Truth Reality'}</span>
            </button>
          </div>

          {showLaterTruth ? (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
              <div className="font-bold mb-1">Objective Ground Truth (Unknown to Trainee at Submission Time):</div>
              <p>{card.ground_truth_revelation || 'Target decoy identified. Sub-unit safely deconflicted friendly positions.'}</p>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-[#F9FAFB] border border-dashed border-[#E5E5E5] text-xs text-[#6B7280] text-center italic">
              Ground truth reality masked to simulate realistic cognitive audit conditions.
            </div>
          )}
        </div>

        {/* Section 4: Hindsight-Safe Evaluator Review */}
        <div className="pt-2 border-t border-[#E5E5E5] flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span className="font-semibold text-[#14213D]">
              Evaluator Audit: Process Sound Under Degraded Inputs
            </span>
          </div>
          <span className="text-[#6B7280] font-mono text-[11px]">
            Hindsight Bias Protection: ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
};
