import React, { useState } from 'react';
import { DecisionContextCard } from '../types';

interface DecisionContextCardProps {
  card: DecisionContextCard;
}

export const DecisionContextCardView: React.FC<DecisionContextCardProps> = ({ card }) => {
  const [showLaterTruth, setShowLaterTruth] = useState<boolean>(false);

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        overflow: 'hidden',
        marginBottom: '16px'
      }}
    >
      {/* Header bar */}
      <div
        style={{
          background: 'var(--bg-panel)',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--accent-cyan)'
            }}
          >
            {card.decision_id}
          </span>
          <span
            style={{
              fontSize: '11px',
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#93c5fd',
              padding: '2px 8px',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)'
            }}
          >
            ROLE: {card.role}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            DECISION TIME: T+{card.timestamp}s
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '3px',
              background:
                card.confidence === 'HIGH'
                  ? 'rgba(16, 185, 129, 0.2)'
                  : card.confidence === 'MEDIUM'
                  ? 'rgba(245, 158, 11, 0.2)'
                  : 'rgba(239, 68, 68, 0.2)',
              color:
                card.confidence === 'HIGH'
                  ? 'var(--accent-green)'
                  : card.confidence === 'MEDIUM'
                  ? 'var(--accent-amber)'
                  : 'var(--accent-red)'
            }}
          >
            CONFIDENCE: {card.confidence}
          </span>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Section 1: Hindsight-Safe What the trainee knew */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              letterSpacing: '0.05em',
              marginBottom: '8px'
            }}
          >
            SECTION 1: DECISION-TIME INFORMATION SNAPSHOT (WHAT WAS KNOWABLE AT T={card.timestamp}s)
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '10px'
            }}
          >
            {/* Information Available */}
            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600, marginBottom: '6px' }}>
                ✓ DELIVERED & AVAILABLE ({card.information_seen.length})
              </div>
              {card.information_seen.length === 0 ? (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>None available</div>
              ) : (
                card.information_seen.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{item.source_name || item.source_id}: </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {typeof item.content === 'object' ? item.content.summary || JSON.stringify(item.content) : item.content}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Information Delayed */}
            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--accent-amber)', fontWeight: 600, marginBottom: '6px' }}>
                ⏳ DELAYED IN TRANSIT ({card.information_delayed.length})
              </div>
              {card.information_delayed.length === 0 ? (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>None delayed</div>
              ) : (
                card.information_delayed.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    • {item.source_name || item.source_id} (arrival pending)
                  </div>
                ))
              )}
            </div>

            {/* Information Missing */}
            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--accent-red)', fontWeight: 600, marginBottom: '6px' }}>
                ✖ MISSING / DROPPED ({card.information_missing.length})
              </div>
              {card.information_missing.length === 0 ? (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>None missing</div>
              ) : (
                card.information_missing.map((sourceId, idx) => (
                  <div key={idx} style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    • Channel: {sourceId}
                  </div>
                ))
              )}
            </div>

            {/* Active Conflicts */}
            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid var(--status-conflict)'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--status-conflict)', fontWeight: 600, marginBottom: '6px' }}>
                ⚠️ ACTIVE CONFLICTS ({card.conflicts_seen.length})
              </div>
              {card.conflicts_seen.length === 0 ? (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Zero conflicts detected</div>
              ) : (
                card.conflicts_seen.map((conf, idx) => (
                  <div key={idx} style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    • {conf.conflict_id}: {conf.source_a} vs {conf.source_b}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Decision & Rationale */}
        <div
          style={{
            background: 'var(--bg-primary)',
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              SELECTED COMMAND OPTION:
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              {card.selected_option}
            </span>
          </div>

          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            TRAINEE RATIONALE GIVEN AT DECISION TIME:
          </div>
          <div
            style={{
              fontSize: '12px',
              color: '#fff',
              fontStyle: 'italic',
              background: 'var(--bg-tertiary)',
              padding: '8px 10px',
              borderRadius: '4px'
            }}
          >
            "{card.rationale || 'No rationale recorded.'}"
          </div>
        </div>

        {/* Section 3: Ground Truth & Later Outcome Toggle */}
        <div
          style={{
            borderTop: '1px dashed var(--border-subtle)',
            paddingTop: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              HINDSIGHT PROTECTION: Ground-truth reality was concealed from trainee at T={card.timestamp}s
            </span>
            <button
              onClick={() => setShowLaterTruth(!showLaterTruth)}
              style={{
                background: showLaterTruth ? 'var(--bg-tertiary)' : 'rgba(59, 130, 246, 0.2)',
                color: showLaterTruth ? 'var(--text-secondary)' : '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: '4px 10px',
                fontSize: '11px',
                borderRadius: '3px'
              }}
            >
              {showLaterTruth ? 'HIDE POST-EXERCISE REVELATION' : 'REVEAL POST-EXERCISE TRUTH & OUTCOME'}
            </button>
          </div>

          {showLaterTruth && (
            <div
              style={{
                marginTop: '12px',
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '12px',
                borderRadius: '4px'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 700, marginBottom: '6px' }}>
                LATER REVEALED GROUND TRUTH (POST-EXERCISE RECONCILIATION)
              </div>
              <div style={{ fontSize: '12px', color: '#fff', marginBottom: '8px' }}>
                {card.ground_truth_revelation || 'Objective status confirmed post-exercise.'}
              </div>

              {card.later_outcome && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong>Operational Result:</strong> {card.later_outcome.narrative}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
