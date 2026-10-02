import React from 'react';
import { DeliveryStatus } from '../types';

interface FeedStatusProps {
  status: DeliveryStatus;
  ageSeconds?: number;
  isConflicted?: boolean;
}

export const FeedStatusBadge: React.FC<FeedStatusProps> = ({ status, ageSeconds = 0, isConflicted = false }) => {
  let badgeClass = 'feed-badge-normal';
  let label: string = status;

  if (isConflicted || status === 'CONFLICT') {
    badgeClass = 'feed-badge-conflict';
    label = 'CONFLICT';
  } else if (status === 'DROPPED') {
    badgeClass = 'feed-badge-dropped';
    label = 'OFFLINE / DROPPED';
  } else if (status === 'DELAYED') {
    badgeClass = 'feed-badge-delayed';
    label = 'DELAYED';
  } else if (status === 'STALE') {
    badgeClass = 'feed-badge-stale';
    label = `STALE • ${Math.round(ageSeconds)}s`;
  } else if (status === 'RECOVERED') {
    badgeClass = 'feed-badge-recovered';
    label = 'RECOVERED';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        padding: '2px 8px',
        borderRadius: '3px',
        border: '1px solid currentColor',
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
      }}
      className={badgeClass}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor'
        }}
      />
      {label}
    </span>
  );
};
