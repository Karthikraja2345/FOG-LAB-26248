import React from 'react';
import { SimulationEvent, RoleEnum } from '../types';

interface TimelineProps {
  events: SimulationEvent[];
  filterRole?: RoleEnum;
}

export const Timeline: React.FC<TimelineProps> = ({ events, filterRole }) => {
  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'DEGRADATION_STARTED':
        return 'var(--accent-amber)';
      case 'DEGRADATION_ENDED':
        return 'var(--accent-green)';
      case 'DECISION_SUBMITTED':
        return 'var(--accent-cyan)';
      case 'MESSAGE_SENT':
        return 'var(--accent-blue)';
      case 'INFORMATION_CONFLICT':
        return 'var(--status-conflict)';
      case 'SESSION_STARTED':
      case 'SESSION_ENDED':
        return 'var(--accent-purple)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const filtered = filterRole
    ? events.filter((e) => filterRole === 'INSTRUCTOR' || e.visibility.includes(filterRole))
    : events;

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          padding: '10px 14px',
          background: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>
          SEQUENCED EVENT TIMELINE
        </span>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          {filtered.length} EVENTS RECORDED
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', padding: '16px' }}>
            No timeline events emitted yet.
          </div>
        ) : (
          filtered.map((evt) => (
            <div
              key={evt.event_id}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                fontSize: '11px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                paddingBottom: '6px'
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  width: '50px',
                  flexShrink: 0
                }}
              >
                T+{evt.scenario_time}s
              </span>

              <span
                style={{
                  color: getEventBadgeColor(evt.event_type),
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  flexShrink: 0,
                  fontSize: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '1px 5px',
                  borderRadius: '2px'
                }}
              >
                {evt.event_type}
              </span>

              <span style={{ color: '#fff', flex: 1, wordBreak: 'break-word' }}>
                {evt.actor_id}: {JSON.stringify(evt.payload)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
