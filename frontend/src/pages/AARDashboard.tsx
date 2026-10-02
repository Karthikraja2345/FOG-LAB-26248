import React, { useState, useEffect } from 'react';
import { AARSummary, SessionResponse } from '../types';
import { InformationAsymmetryMatrix } from '../components/InformationAsymmetryMatrix';
import { ContradictionHeatmap } from '../components/ContradictionHeatmap';
import { UncertaintyPanel } from '../components/UncertaintyPanel';
import { DecisionContextCardView } from '../components/DecisionContextCard';
import {
  Download,
  Printer,
  Shield,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface AARDashboardProps {
  session: SessionResponse;
}

export const AARDashboard: React.FC<AARDashboardProps> = ({ session }) => {
  const [aar, setAar] = useState<AARSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAAR = () => {
    setLoading(true);
    fetch(`/api/sessions/${session.session_id}/aar`)
      .then((res) => {
        if (!res.ok) throw new Error('AAR data not available yet');
        return res.json();
      })
      .then((data: AARSummary) => {
        setAar(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAAR();
  }, [session.session_id]);

  const handleExport = (format: 'html' | 'pdf' | 'json') => {
    window.open(`/api/sessions/${session.session_id}/aar/export?format=${format}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-[#6B7280]">
        <div className="flex items-center gap-2">
          <RefreshCw size={18} className="animate-spin text-[#FCA311]" />
          <span>Compiling After-Action Review and reconciling ground truth...</span>
        </div>
      </div>
    );
  }

  if (error || !aar) {
    return (
      <div className="w-full max-w-4xl mx-auto px-6 py-12 text-center text-[#6B7280]">
        <AlertCircle size={32} className="text-amber-500 mx-auto mb-3" />
        <h3 className="font-serif text-lg font-bold text-[#14213D] mb-1">
          AAR Summary Not Yet Available
        </h3>
        <p className="text-xs text-[#4B5563] max-w-md mx-auto mb-4">
          {error || 'Run the exercise and commit decisions to generate an automated debrief report.'}
        </p>
        <button
          onClick={loadAAR}
          className="px-4 py-2 rounded-lg bg-[#14213D] text-white text-xs font-semibold hover:bg-[#0B132B]"
        >
          Retry Compilation
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header & Export Controls */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#FCA311]/15 text-[#B45309] border border-[#FCA311]/30 text-xs font-semibold mb-2">
            <Shield size={13} />
            Hindsight-Safe After-Action Review (AAR)
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#14213D]">
            {aar.scenario_title}
          </h2>
          <div className="text-xs font-mono text-[#6B7280] mt-1">
            Session: {aar.session_id} • Seed: {aar.seed} • Elapsed: T+{aar.duration_elapsed_seconds}s
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleExport('html')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#E5E5E5] text-[#14213D] text-xs font-semibold hover:bg-[#F9FAFB] shadow-xs"
          >
            <Printer size={14} className="text-[#FCA311]" />
            <span>Standalone HTML</span>
          </button>

          <button
            onClick={() => handleExport('pdf')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#14213D] text-white text-xs font-semibold hover:bg-[#0B132B] shadow-sm transition-all"
          >
            <Download size={14} className="text-[#FCA311]" />
            <span>Export Official PDF Report</span>
          </button>
        </div>
      </div>

      {/* Ground Truth Resolution Box */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2">
          <CheckCircle2 size={16} className="text-emerald-700" />
          <span>Ground Truth Resolution (Objective Reality)</span>
        </div>
        <p className="text-xs text-emerald-800 leading-relaxed font-mono">
          {aar.ground_truth_resolution}
        </p>
      </div>

      {/* Training Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold font-mono text-[#14213D]">
            {aar.training_metrics.total_decisions_recorded}
          </div>
          <div className="text-xs text-[#6B7280] font-medium mt-1">
            Decisions Committed
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold font-mono text-[#14213D]">
            {aar.training_metrics.average_decision_latency_seconds}s
          </div>
          <div className="text-xs text-[#6B7280] font-medium mt-1">
            Avg Decision Latency
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold font-mono text-purple-700">
            {aar.training_metrics.contradiction_awareness_rate}
          </div>
          <div className="text-xs text-[#6B7280] font-medium mt-1">
            Contradiction Awareness
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {aar.training_metrics.team_coordination_message_count}
          </div>
          <div className="text-xs text-[#6B7280] font-medium mt-1">
            Team Radio Inquiries
          </div>
        </div>
      </div>

      {/* Information Asymmetry Matrix */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
        <h3 className="font-serif text-lg font-bold text-[#14213D] mb-4">
          Information Asymmetry Matrix Across Sub-Unit Roles
        </h3>
        <InformationAsymmetryMatrix matrix={aar.asymmetry_matrix} />
      </div>

      {/* Contradiction Divergence Log */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
        <h3 className="font-serif text-lg font-bold text-[#14213D] mb-4">
          Contradiction Audit & Resolution Log
        </h3>
        <ContradictionHeatmap conflicts={aar.active_conflicts} />
      </div>

      {/* Uncertainty Budget */}
      <UncertaintyPanel budget={aar.uncertainty_budget} />

      {/* Recorded Decision Context Cards */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-[#14213D]">
          Decision Context Snapshots ({aar.total_decisions})
        </h3>
        {aar.decisions.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 text-center text-xs text-[#6B7280]">
            No decisions logged during this exercise session.
          </div>
        ) : (
          aar.decisions.map((d) => <DecisionContextCardView key={d.decision_id} card={d} />)
        )}
      </div>

      {/* DSSC Evaluator Disclaimer */}
      <div className="p-4 rounded-xl bg-[#EFEFEF] border border-[#E5E5E5] text-[11px] text-[#6B7280] leading-relaxed">
        <strong>Evaluator Disclaimer:</strong> {aar.training_metrics.evaluator_disclaimer}
      </div>
    </div>
  );
};
