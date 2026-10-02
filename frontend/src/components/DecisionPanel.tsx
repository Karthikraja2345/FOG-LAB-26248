import React, { useState } from 'react';
import { DecisionPoint, DecisionType, ConfidenceLevel, RoleEnum } from '../types';

interface DecisionPanelProps {
  decisionPoint: DecisionPoint | null;
  role: RoleEnum;
  onSubmit: (decision: {
    selected_option: string;
    decision_type: DecisionType;
    rationale: string;
    confidence: ConfidenceLevel;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  decisionPoint,
  role,
  onSubmit,
  isSubmitting = false
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [rationale, setRationale] = useState<string>('');
  const [confidence, setConfidence] = useState<ConfidenceLevel>('MEDIUM');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!decisionPoint) {
    return (
      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '16px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '12px'
        }}
      >
        TACTICAL DISPATCH: No pending command decision required at this simulation tick. Maintain operational vigilance.
      </div>
    );
  }

  const isRoleAllowed = decisionPoint.allowed_roles.includes(role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) {
      setError('Please select an operational option.');
      return;
    }
    if (!rationale.trim()) {
      setError('Please state brief tactical rationale.');
      return;
    }
    setError(null);
    try {
      await onSubmit({
        selected_option: selectedOption,
        decision_type: decisionPoint.decision_type,
        rationale,
        confidence
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--accent-cyan)',
        borderRadius: '6px',
        padding: '16px',
        boxShadow: '0 0 12px rgba(6, 182, 212, 0.1)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span
          style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--accent-cyan)',
            letterSpacing: '0.05em'
          }}
        >
          COMMAND DECISION POINT: {decisionPoint.decision_point_id}
        </span>
        <span
          style={{
            fontSize: '11px',
            background: isRoleAllowed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: isRoleAllowed ? 'var(--accent-green)' : 'var(--accent-red)',
            padding: '2px 8px',
            borderRadius: '3px',
            fontWeight: 600
          }}
        >
          {isRoleAllowed ? 'DISPATCH AUTHORIZED' : `RESTRICTED TO: ${decisionPoint.allowed_roles.join(', ')}`}
        </span>
      </div>

      <div style={{ fontSize: '13px', color: '#fff', marginBottom: '14px', lineHeight: '1.5' }}>
        {decisionPoint.prompt}
      </div>

      {submitted ? (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--accent-green)',
            color: 'var(--accent-green)',
            padding: '12px',
            borderRadius: '4px',
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          ✓ DECISION RECORDED IN IMMUTABLE LEDGER. Decision context and evidence snapshot frozen for AAR.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {decisionPoint.options.map((opt) => (
              <label
                key={opt.option_id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: selectedOption === opt.option_id ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-tertiary)',
                  border: `1px solid ${selectedOption === opt.option_id ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                  padding: '10px',
                  borderRadius: '4px',
                  cursor: isRoleAllowed ? 'pointer' : 'not-allowed',
                  opacity: isRoleAllowed ? 1 : 0.6
                }}
              >
                <input
                  type="radio"
                  name="decisionOption"
                  value={opt.option_id}
                  disabled={!isRoleAllowed}
                  checked={selectedOption === opt.option_id}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  style={{ marginTop: '3px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                    {opt.label}
                    <span
                      style={{
                        marginLeft: '8px',
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        padding: '1px 6px',
                        borderRadius: '2px',
                        background:
                          opt.associated_risk === 'LOW'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : opt.associated_risk === 'MEDIUM'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                        color:
                          opt.associated_risk === 'LOW'
                            ? 'var(--accent-green)'
                            : opt.associated_risk === 'MEDIUM'
                            ? 'var(--accent-amber)'
                            : 'var(--accent-red)'
                      }}
                    >
                      RISK: {opt.associated_risk}
                    </span>
                  </div>
                  {opt.description && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {opt.description}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                TACTICAL RATIONALE (Explain reasoning given current degraded information)
              </label>
              <textarea
                rows={2}
                disabled={!isRoleAllowed}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="State your assessment of contradictory/delayed feeds and basis for action..."
                style={{ width: '100%', resize: 'none', fontSize: '12px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                CONFIDENCE ASSESSMENT
              </label>
              <select
                value={confidence}
                disabled={!isRoleAllowed}
                onChange={(e) => setConfidence(e.target.value as ConfidenceLevel)}
                style={{ width: '100%', height: '36px', fontSize: '12px' }}
              >
                <option value="LOW">LOW CONFIDENCE (High uncertainty)</option>
                <option value="MEDIUM">MEDIUM CONFIDENCE (Partial confirmation)</option>
                <option value="HIGH">HIGH CONFIDENCE (Sufficient verification)</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{ color: 'var(--accent-red)', fontSize: '11px', marginBottom: '10px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={!isRoleAllowed || isSubmitting}
              style={{
                background: isRoleAllowed ? 'var(--accent-blue)' : 'var(--text-muted)',
                color: '#fff',
                padding: '8px 20px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                letterSpacing: '0.04em'
              }}
            >
              {isSubmitting ? 'RECORDING EVIDENCE...' : 'COMMIT COMMAND DISPATCH'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
