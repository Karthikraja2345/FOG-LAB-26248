import React, { useState, useEffect } from 'react';
import { DecisionContextCard, SessionResponse } from '../types';
import { DecisionContextCardView } from '../components/DecisionContextCard';

interface DecisionReviewProps {
  session: SessionResponse;
}

export const DecisionReview: React.FC<DecisionReviewProps> = ({ session }) => {
  const [decisions, setDecisions] = useState<DecisionContextCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`/api/sessions/${session.session_id}/decisions`)
      .then((res) => res.json())
      .then((data) => {
        setDecisions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [session.session_id]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading decision ledger...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
          IMMUTABLE DECISION LEDGER & CONTEXT AUDIT
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Every commander decision is captured with its exact decision-time information snapshot. Hindsight-safe evaluation prevents post-hoc bias.
        </p>
      </div>

      {decisions.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '30px',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}
        >
          No decisions recorded in this session yet. Launch the exercise and submit decisions in Trainee Workspace.
        </div>
      ) : (
        decisions.map((card) => <DecisionContextCardView key={card.decision_id} card={card} />)
      )}
    </div>
  );
};
