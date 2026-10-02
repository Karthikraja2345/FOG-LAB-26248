import React from 'react';
import { DeliveryStatus } from '../types';
import { CheckCircle2, Clock, AlertTriangle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface FeedStatusProps {
  status: DeliveryStatus;
  ageSeconds?: number;
  isConflicted?: boolean;
}

export const FeedStatusBadge: React.FC<FeedStatusProps> = ({ status, ageSeconds = 0, isConflicted = false }) => {
  if (isConflicted || status === 'CONFLICT') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200 uppercase">
        <AlertTriangle size={12} className="text-purple-600" />
        <span>Conflict</span>
      </span>
    );
  }

  if (status === 'DROPPED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-red-50 text-red-700 border border-red-200 uppercase">
        <XCircle size={12} className="text-red-600" />
        <span>Dropped</span>
      </span>
    );
  }

  if (status === 'DELAYED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
        <Clock size={12} className="text-amber-600" />
        <span>Delayed (+{Math.round(ageSeconds)}s)</span>
      </span>
    );
  }

  if (status === 'STALE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-orange-50 text-orange-700 border border-orange-200 uppercase">
        <AlertCircle size={12} className="text-orange-600" />
        <span>Stale ({Math.round(ageSeconds)}s)</span>
      </span>
    );
  }

  if (status === 'RECOVERED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-sky-50 text-sky-700 border border-sky-200 uppercase">
        <RefreshCw size={12} className="text-sky-600" />
        <span>Recovered</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
      <CheckCircle2 size={12} className="text-emerald-600" />
      <span>Delivered</span>
    </span>
  );
};
