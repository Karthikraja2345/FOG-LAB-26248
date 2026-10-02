import React, { useState, useEffect } from 'react';
import { AARSummary, SessionResponse } from '../types';
import { InformationAsymmetryMatrix } from '../components/InformationAsymmetryMatrix';
import { ContradictionHeatmap } from '../components/ContradictionHeatmap';
import { UncertaintyPanel } from '../components/UncertaintyPanel';
import { DecisionContextCardView } from '../components/DecisionContextCard';
import { Timeline } from '../components/Timeline';

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
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Compiling After-Action Review and reconciling ground truth...
      </div>
    );
  }

  if (error || !aar) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
        {error || 'No AAR data found. Ensure the session has active events.'}
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header & Export Controls */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              padding: '2px 8px',
              borderRadius: '3px',
              fontWeight: 700
            }}
          >
            HINDSIGHT-SAFE AFTER-ACTION REVIEW (AAR)
          </span>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '6px 0 2px 0' }}>
            {aar.scenario_title}
          </h2>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Session: {aar.session_id} • Seed: {aar.seed} • Elapsed: T+{aar.duration_elapsed_seconds}s
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleExport('html')}
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              padding: '6px 14px',
              fontSize: '12px',
              borderRadius: '4px',
              fontWeight: 600
            }}
          >
            🌐 EXPORT HTML
          </button>
          <button
            onClick={() => handleExport('pdf')}
            style={{
              background: 'var(--accent-red)',
              color: '#fff',
              border: 'none',
              padding: '6px 16px',
              fontSize: '12px',
              borderRadius: '4px',
              fontWeight: 700
            }}
          >
            📄 EXPORT PDF PACK
          </button>
          <button
            onClick={() => handleExport('json')}
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '4px'
            }}
          >
            JSON AUDIT
          </button>
        </div>
      </div>

      {/* Section 1: Key Training Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Decisions Captured</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
            {aar.total_decisions}
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Avg Decision Latency</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
            {aar.training_metrics.average_decision_latency_seconds || 0}s
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Contradiction Awareness</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--status-conflict)', fontFamily: 'var(--font-mono)' }}>
            {aar.training_metrics.contradiction_awareness_rate || '0%'}
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Team Coordination Messages</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
            {aar.training_metrics.team_coordination_message_count || 0}
          </div>
        </div>
      </div>

      {/* Uncertainty Budget & Ground Truth Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '14px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '6px' }}>
            GROUND TRUTH RECONCILIATION
          </div>
          <p style={{ fontSize: '12px', color: '#fff', lineHeight: '1.6' }}>
            {aar.ground_truth_resolution}
          </p>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
            Hindsight separation verified: Evaluator scored the trainee process exclusively against decision-time intelligence.
          </div>
        </div>

        <UncertaintyPanel budget={aar.uncertainty_budget} />
      </div>

      {/* Asymmetry Matrix & Contradiction Heatmap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <InformationAsymmetryMatrix matrix={aar.asymmetry_matrix} />
        <ContradictionHeatmap conflicts={aar.active_conflicts} />
      </div>

      {/* Decision Context Cards */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
          DECISION EVIDENCE CARDS ({aar.decisions.length})
        </h3>
        {aar.decisions.length === 0 ? (
          <div style={{ padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>
            No decisions logged during exercise.
          </div>
        ) : (
          aar.decisions.map((card) => <DecisionContextCardView key={card.decision_id} card={card} />)
        )}
      </div>

      {/* Timeline Section */}
      <div style={{ height: '260px', marginBottom: '20px' }}>
        <Timeline events={aar.timeline_events} />
      </div>

      {/* Disclaimer */}
      <div
        style={{
          background: 'rgba(245, 158, 11, 0.08)',
          borderLeft: '4px solid var(--accent-amber)',
          padding: '12px 16px',
          borderRadius: '4px',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}
      >
        <strong>DSSC INSTRUCTIONAL DISCLAIMER:</strong> {aar.disclaimer}
      </div>
    </div>
  );
};
