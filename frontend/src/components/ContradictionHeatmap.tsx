import React from 'react';
import { ContradictionItem } from '../types';

interface ContradictionHeatmapProps {
  conflicts: ContradictionItem[];
}

export const ContradictionHeatmap: React.FC<ContradictionHeatmapProps> = ({ conflicts }) => {
  return (
    <div className="space-y-3">
      {conflicts.length === 0 ? (
        <div className="text-center py-6 text-xs text-[#6B7280]">
          Zero conflicting intelligence reports recorded. Feeds are in mutual concordance.
        </div>
      ) : (
        conflicts.map((conf) => (
          <div
            key={conf.conflict_id}
            className="p-4 rounded-xl border border-purple-200 bg-purple-50/20 border-l-4 border-l-purple-600 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  {conf.conflict_id}
                </span>
                <span className="text-xs font-semibold text-[#14213D]">
                  TOPIC: {conf.topic}
                </span>
                <span className="text-xs font-mono text-[#6B7280]">
                  DETECTED: T+{conf.detected_at_time}s
                </span>
              </div>

              <span
                className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                  conf.is_resolved
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {conf.is_resolved ? 'RESOLVED' : 'ACTIVE DIVERGENCE'}
              </span>
            </div>

            {/* Comparison Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-purple-200">
                <div className="text-[10px] font-semibold text-purple-700 uppercase font-mono mb-1">
                  Source A ({conf.source_a})
                </div>
                <div className="text-[#14213D] font-medium leading-relaxed">
                  {conf.value_a}
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-purple-200">
                <div className="text-[10px] font-semibold text-purple-700 uppercase font-mono mb-1">
                  Source B ({conf.source_b})
                </div>
                <div className="text-[#14213D] font-medium leading-relaxed">
                  {conf.value_b}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
