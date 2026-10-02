import React from 'react';
import { TraineeFeedItem } from '../types';
import { FeedStatusBadge } from './FeedStatus';

interface FeedPanelProps {
  feeds: TraineeFeedItem[];
  scenarioTime?: number;
}

export const FeedPanel: React.FC<FeedPanelProps> = ({ feeds }) => {
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
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-panel)'
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>
          INTELLIGENCE & SENSOR FEEDS
        </span>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)'
          }}
        >
          {feeds.length} ACTIVE CHANNELS
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {feeds.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px', fontSize: '12px' }}>
            No information feeds registered for this role.
          </div>
        ) : (
          feeds.map((feed) => {
            const isDropped = feed.status === 'DROPPED';
            const isConflicted = feed.is_conflicted;
            const isDelayed = feed.status === 'DELAYED';

            return (
              <div
                key={feed.source_id}
                style={{
                  background: isDropped ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-tertiary)',
                  border: `1px solid ${
                    isConflicted
                      ? 'var(--status-conflict)'
                      : isDropped
                      ? 'rgba(239, 68, 68, 0.4)'
                      : isDelayed
                      ? 'rgba(245, 158, 11, 0.4)'
                      : 'var(--border-subtle)'
                  }`,
                  borderRadius: '4px',
                  padding: '12px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                      {feed.source_name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      ID: {feed.source_id} • Reliability: {Math.round(feed.reliability * 100)}% ({feed.confidence_class})
                    </div>
                  </div>
                  <FeedStatusBadge
                    status={feed.status}
                    ageSeconds={feed.age_seconds}
                    isConflicted={feed.is_conflicted}
                  />
                </div>

                {isDropped ? (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px dashed rgba(239, 68, 68, 0.3)',
                      color: 'var(--accent-red)',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    SIGNAL OCCLUDED: Channel unreachable or deliberately suppressed. Await recovery or rely on peer coordination.
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        background: 'var(--bg-primary)',
                        padding: '8px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: isConflicted ? '#fbcfe8' : 'var(--text-primary)',
                        marginBottom: '6px',
                        borderLeft: isConflicted ? '3px solid var(--status-conflict)' : 'none'
                      }}
                    >
                      {feed.content.summary || JSON.stringify(feed.content, null, 2)}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <span>Gen: T+{feed.generated_at_time}s</span>
                      <span>Delivered: T+{feed.received_at_time}s</span>
                      <span>Age: {feed.age_seconds}s</span>
                    </div>

                    {isConflicted && (
                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '11px',
                          color: 'var(--status-conflict)',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        ⚠️ WARNING: Report conflicts directly with another sensor stream. Verify via team coordination.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
