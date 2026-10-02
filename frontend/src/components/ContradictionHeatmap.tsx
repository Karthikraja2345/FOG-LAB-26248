import React from 'react';
import { ContradictionItem } from '../types';

interface ContradictionHeatmapProps {
  conflicts: ContradictionItem[];
}

export const ContradictionHeatmap: React.FC<ContradictionHeatmapProps> = ({ conflicts }) => {
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--status-conflict)', letterSpacing: '0.05em' }}>
          CONTRADICTION HEATMAP & DIVERGENCE AUDIT
        </span>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            background: 'rgba(236, 72, 153, 0.15)',
            color: 'var(--status-conflict)',
            padding: '2px 8px',
            borderRadius: '3px'
          }}
        >
          {conflicts.filter((c) => !c.is_resolved).length} UNRESOLVED DIVERGENCES
        </span>
      </div>

      <div style={{ padding: '12px' }}>
        {conflicts.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No contradictory intelligence reports recorded. Sensor feeds are in mutual concordance.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {conflicts.map((conf) => (
              <div
                key={conf.conflict_id}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                  borderLeft: '4px solid var(--status-conflict)',
                  borderRadius: '4px',
                  padding: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: 'var(--status-conflict)'
                      }}
                    >
                      {conf.conflict_id}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      TOPIC: {conf.topic} • DETECTED AT T+{conf.detected_at_time}s
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 6px',
                      borderRadius: '2px',
                      background: conf.is_resolved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(236, 72, 153, 0.2)',
                      color: conf.is_resolved ? 'var(--accent-green)' : 'var(--status-conflict)',
                      fontWeight: 600
                    }}
                  >
                    {conf.is_resolved ? 'RESOLVED' : 'ACTIVE CONFLICT'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div
                    style={{
                      background: 'var(--bg-primary)',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                      SOURCE A: {conf.source_a}
                    </div>
                    <div style={{ fontSize: '12px', color: '#fff' }}>"{conf.value_a}"</div>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-primary)',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ fontSize: '10px', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                      SOURCE B: {conf.source_b}
                    </div>
                    <div style={{ fontSize: '12px', color: '#fff' }}>"{conf.value_b}"</div>
                  </div>
                </div>

                {conf.resolution_note && (
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      color: 'var(--accent-green)',
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '6px 10px',
                      borderRadius: '3px'
                    }}
                  >
                    ✓ Resolution: {conf.resolution_note}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
