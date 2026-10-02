import React from 'react';
import { UncertaintyBudget } from '../types';
import { Activity } from 'lucide-react';

interface UncertaintyPanelProps {
  budget: UncertaintyBudget;
}

export const UncertaintyPanel: React.FC<UncertaintyPanelProps> = ({ budget }) => {
  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#14213D] text-[#FCA311] flex items-center justify-center">
            <Activity size={13} />
          </div>
          <span className="font-serif text-xs font-bold text-[#14213D] uppercase tracking-wider">
            Uncertainty Budget Index
          </span>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
            budget.total_uncertainty_score > 5.0
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          INDEX: {budget.total_uncertainty_score.toFixed(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#F9FAFB] p-3 rounded-lg border border-[#E5E5E5] text-center">
          <div className="text-xl font-bold font-mono text-purple-700">
            {budget.unresolved_contradictions}
          </div>
          <div className="text-[10px] text-[#6B7280] font-medium mt-1">
            Contradictions
          </div>
        </div>

        <div className="bg-[#F9FAFB] p-3 rounded-lg border border-[#E5E5E5] text-center">
          <div className="text-xl font-bold font-mono text-orange-600">
            {budget.stale_feeds}
          </div>
          <div className="text-[10px] text-[#6B7280] font-medium mt-1">
            Stale Telemetry
          </div>
        </div>

        <div className="bg-[#F9FAFB] p-3 rounded-lg border border-[#E5E5E5] text-center">
          <div className="text-xl font-bold font-mono text-red-600">
            {budget.unavailable_channels}
          </div>
          <div className="text-[10px] text-[#6B7280] font-medium mt-1">
            Occluded Feeds
          </div>
        </div>

        <div className="bg-[#F9FAFB] p-3 rounded-lg border border-[#E5E5E5] text-center">
          <div className="text-xl font-bold font-mono text-amber-600">
            {budget.low_confidence_reports}
          </div>
          <div className="text-[10px] text-[#6B7280] font-medium mt-1">
            Low Reliability
          </div>
        </div>
      </div>
    </div>
  );
};
