import React from 'react';
import { SimulationEvent, RoleEnum } from '../types';

interface TimelineProps {
  events: SimulationEvent[];
  filterRole?: RoleEnum;
}

export const Timeline: React.FC<TimelineProps> = ({ events, filterRole }) => {
  const getEventBadge = (type: string) => {
    switch (type) {
      case 'DEGRADATION_STARTED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DEGRADATION_ENDED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DECISION_SUBMITTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'MESSAGE_SENT':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'INFORMATION_CONFLICT':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filtered = filterRole
    ? events.filter((e) => filterRole === 'INSTRUCTOR' || e.visibility.includes(filterRole))
    : events;

  return (
    <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-xs text-[#6B7280]">
          Zero events logged on timeline.
        </div>
      ) : (
        filtered.map((evt) => (
          <div
            key={evt.event_id}
            className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#E5E5E5] bg-white text-xs hover:border-[#14213D]/20 transition-all"
          >
            <span className="font-mono text-[11px] font-bold text-[#6B7280] w-12 shrink-0 pt-0.5">
              T+{evt.scenario_time}s
            </span>

            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border shrink-0 ${getEventBadge(
                evt.event_type
              )}`}
            >
              {evt.event_type.replace('_', ' ')}
            </span>

            <span className="text-[#14213D] leading-tight flex-1">
              {evt.actor_id}: {JSON.stringify(evt.payload || {})}
            </span>
          </div>
        ))
      )}
    </div>
  );
};
