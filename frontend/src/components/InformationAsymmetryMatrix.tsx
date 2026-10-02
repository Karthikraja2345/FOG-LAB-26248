import React from 'react';
import { AsymmetryMatrixEntry, RoleEnum } from '../types';
import { CheckCircle2, Clock, AlertTriangle, XCircle, AlertCircle } from 'lucide-react';

interface InformationAsymmetryMatrixProps {
  matrix: AsymmetryMatrixEntry[];
}

export const InformationAsymmetryMatrix: React.FC<InformationAsymmetryMatrixProps> = ({ matrix }) => {
  const sources = Array.from(new Set(matrix.map((m) => m.source_id))).map((id) => {
    const entry = matrix.find((m) => m.source_id === id);
    return { id, name: entry ? entry.source_name : id };
  });

  const roles: RoleEnum[] = ['TEAM_LEAD', 'COORDINATION', 'INFORMATION'];

  const getStatusBadge = (status: string, entry?: AsymmetryMatrixEntry) => {
    if (!entry) return <span className="text-[#9CA3AF]">-</span>;

    if (entry.is_conflicted || status === 'CONFLICT') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <AlertTriangle size={11} />
          <span>CONFLICT</span>
        </span>
      );
    }
    if (status === 'DROPPED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-red-50 text-red-700 border border-red-200">
          <XCircle size={11} />
          <span>DROPPED</span>
        </span>
      );
    }
    if (status === 'DELAYED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={11} />
          <span>+{Math.round(entry.latency_added_seconds)}s DELAY</span>
        </span>
      );
    }
    if (status === 'STALE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-orange-50 text-orange-700 border border-orange-200">
          <AlertCircle size={11} />
          <span>STALE</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={11} />
        <span>DELIVERED</span>
      </span>
    );
  };

  if (matrix.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-[#6B7280]">
        No active matrix records captured yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#E5E5E5]">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#14213D] text-white uppercase text-[11px] font-mono tracking-wider">
          <tr>
            <th className="py-3 px-4 font-semibold">Intelligence Source</th>
            <th className="py-3 px-4 font-semibold text-center">Team Lead</th>
            <th className="py-3 px-4 font-semibold text-center">Coordination</th>
            <th className="py-3 px-4 font-semibold text-center">Information</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E5E5] bg-white">
          {sources.map((src) => (
            <tr key={src.id} className="hover:bg-[#F9FAFB] transition-colors">
              <td className="py-3 px-4 font-semibold text-[#14213D]">
                <div>{src.name}</div>
                <div className="text-[10px] text-[#6B7280] font-mono">{src.id}</div>
              </td>

              {roles.map((r) => {
                const entry = matrix.find((m) => m.source_id === src.id && m.role === r);
                return (
                  <td key={r} className="py-3 px-4 text-center">
                    {getStatusBadge(entry?.delivery_status || 'DROPPED', entry)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
