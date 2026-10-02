import React from 'react';
import { ScenarioPackage } from '../types';
import { Clock, Users, Radio, CheckCircle2, ChevronRight } from 'lucide-react';

interface ScenarioCardProps {
  scenario: ScenarioPackage;
  isSelected: boolean;
  onSelect: (scenario: ScenarioPackage) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  isSelected,
  onSelect
}) => {
  return (
    <div
      onClick={() => onSelect(scenario)}
      className={`relative rounded-xl p-6 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
        isSelected
          ? 'bg-white border-2 border-[#FCA311] shadow-md ring-2 ring-[#FCA311]/20'
          : 'bg-white border border-[#E5E5E5] hover:border-[#14213D]/30 shadow-sm hover:shadow-md'
      }`}
    >
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#14213D]/5 text-[#14213D] font-semibold border border-[#14213D]/10">
            {scenario.scenario_id.toUpperCase()} • v{scenario.version}
          </span>
          <span className="text-xs font-mono text-[#6B7280] flex items-center gap-1">
            <Clock size={13} className="text-[#FCA311]" />
            {Math.round(scenario.duration_seconds / 60)} MIN
          </span>
        </div>

        <h3 className="font-serif text-lg font-bold text-[#14213D] mb-2 leading-snug">
          {scenario.title}
        </h3>

        <p className="text-xs text-[#4B5563] leading-relaxed mb-4 line-clamp-3">
          {scenario.description}
        </p>

        <div className="mb-4 bg-[#F9FAFB] rounded-lg p-3 border border-[#E5E5E5]">
          <div className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
            Learning Objectives:
          </div>
          <ul className="space-y-1 text-[11px] text-[#4B5563]">
            {scenario.learning_objectives.slice(0, 2).map((obj, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-600 mt-0.5 shrink-0" />
                <span className="line-clamp-1">{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[#E5E5E5] pt-3 flex justify-between items-center">
        <div className="flex items-center gap-3 text-xs text-[#6B7280] font-mono">
          <span className="flex items-center gap-1">
            <Users size={13} /> {scenario.roles.length} Roles
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Radio size={13} /> {scenario.information_sources.length} Feeds
          </span>
        </div>

        <button
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
            isSelected
              ? 'bg-[#14213D] text-white shadow-sm'
              : 'bg-[#F4F5F7] text-[#14213D] hover:bg-[#E5E5E5]'
          }`}
        >
          <span>{isSelected ? 'Selected' : 'Select'}</span>
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};
