import React from 'react';
import { AsymmetryMatrixEntry, RoleEnum } from '../types';

interface InformationAsymmetryMatrixProps {
  matrix: AsymmetryMatrixEntry[];
}

export const InformationAsymmetryMatrix: React.FC<InformationAsymmetryMatrixProps> = ({ matrix }) => {
  // Extract unique sources and roles
  const sources = Array.from(new Set(matrix.map((m) => m.source_id))).map((id) => {
    const entry = matrix.find((m) => m.source_id === id);
    return { id, name: entry ? entry.source_name : id };
  });

  const roles: RoleEnum[] = ['TEAM_LEAD', 'COORDINATION', 'INFORMATION'];

  const getStatusIcon = (status: string, entry?: AsymmetryMatrixEntry) => {
    if (!entry) return <span style={{ color: 'var(--text-muted)' }}>-</span>;

    if (entry.is_conflicted || status === 'CONFLICT') {
      return (
        <span
          style={{
            background: 'rgba(236, 72, 153, 0.2)',
            color: 'var(--status-conflict)',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: 700
          }}
        >
          CONFLICT
        </span>
      );
    }
    if (status === 'DROPPED') {
      return (
        <span
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            color: 'var(--status-dropped)',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: 700
          }}
        >
          DROPPED (OFFLINE)
        </span>
      );
    }
    if (status === 'DELAYED') {
      return (
        <span
          style={{
            background: 'rgba(245, 158, 11, 0.2)',
            color: 'var(--status-delayed)',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: 700
          }}
        >
          DELAYED (+{Math.round(entry.latency_added_seconds)}s)
        </span>
      );
    }
    if (status === 'STALE') {
      return (
        <span
          style={{
            background: 'rgba(168, 85, 247, 0.2)',
            color: 'var(--status-stale)',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '11px',
            fontWeight: 700
          }}
        >
          STALE
        </span>
      );
    }
    return (
      <span
        style={{
          background: 'rgba(16, 185, 129, 0.2)',
          color: 'var(--status-normal)',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '11px',
          fontWeight: 700
        }}
      >
        ✓ DELIVERED
      </span>
    );
  };

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
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>
          INFORMATION ASYMMETRY MATRIX
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          PER-ROLE VISIBILITY & DELAY AUDIT
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>
                INTELLIGENCE SOURCE
              </th>
              {roles.map((r) => (
                <th
                  key={r}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'center',
                    color: 'var(--accent-cyan)',
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {r.replace('_', ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sources.map((src) => (
              <tr
                key={src.id}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: 'transparent'
                }}
              >
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{src.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {src.id}
                  </div>
                </td>
                {roles.map((r) => {
                  const entry = matrix.find((m) => m.source_id === src.id && m.role === r);
                  return (
                    <td key={r} style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {getStatusIcon(entry ? entry.delivery_status : 'UNKNOWN', entry)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
