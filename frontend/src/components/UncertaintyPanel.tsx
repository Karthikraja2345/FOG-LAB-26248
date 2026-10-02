import React from 'react';
import { UncertaintyBudget } from '../types';

interface UncertaintyPanelProps {
  budget: UncertaintyBudget;
}

export const UncertaintyPanel: React.FC<UncertaintyPanelProps> = ({ budget }) => {
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        padding: '14px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
          UNCERTAINTY BUDGET
        </span>
        <span
          style={{
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: budget.total_uncertainty_score > 5.0 ? 'var(--accent-red)' : 'var(--accent-amber)'
          }}
        >
          COMPOSITE INDEX: {budget.total_uncertainty_score}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        <div
          style={{
            background: 'var(--bg-tertiary)',
            padding: '10px 8px',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--status-conflict)', fontFamily: 'var(--font-mono)' }}>
            {budget.unresolved_contradictions}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Unresolved Conflicts
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-tertiary)',
            padding: '10px 8px',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--status-stale)', fontFamily: 'var(--font-mono)' }}>
            {budget.stale_feeds}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Stale Telemetry
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-tertiary)',
            padding: '10px 8px',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--status-dropped)', fontFamily: 'var(--font-mono)' }}>
            {budget.unavailable_channels}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Occluded Feeds
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-tertiary)',
            padding: '10px 8px',
            borderRadius: '4px',
            textAlign: 'center',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
            {budget.low_confidence_reports}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Low Reliability
          </div>
        </div>
      </div>
    </div>
  );
};
