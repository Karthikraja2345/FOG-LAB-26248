import React, { useState } from 'react';
import { SessionResponse, CounterfactualComparison } from '../types';

interface CounterfactualProps {
  session: SessionResponse;
}

export const Counterfactual: React.FC<CounterfactualProps> = ({ session }) => {
  const [variable, setVariable] = useState<string>('REMOVE_DELAY_SOURCE_B');
  const [comparison, setComparison] = useState<CounterfactualComparison | null>(null);
  const [running, setRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${session.session_id}/counterfactual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_session_id: session.session_id,
          variable_to_modify: variable,
          custom_parameters: {}
        })
      });
      if (!res.ok) throw new Error('Failed to compute counterfactual branch');
      const data: CounterfactualComparison = await res.json();
      setComparison(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(139, 92, 246, 0.2)',
              color: 'var(--accent-purple)',
              padding: '2px 8px',
              borderRadius: '3px',
              fontWeight: 700
            }}
          >
            ANALYTICAL TRAINING TOOL
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            CONTROLLED TRAINING COUNTERFACTUAL
          </span>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
          COUNTERFACTUAL BRANCH & CAUSAL SENSITIVITY ANALYSIS
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Evaluate how a single controlled change in the communication environment (e.g. eliminating latency on a key radar feed) would have altered information arrival times, decision latency, and tactical outcome under the exact same scenario seed.
        </p>
      </div>

      {/* Control Selector */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            SELECT CONTROLLED FACTOR TO MODIFY (ALL OTHER VARIABLES AND SEED HELD CONSTANT)
          </label>
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            style={{ width: '100%', fontSize: '12px' }}
          >
            <option value="REMOVE_DELAY_SOURCE_B">
              Remove Latency Injection on Tactical Radar (Source B) [Delay: 60s → 0s]
            </option>
            <option value="SUPPRESS_CONTRADICTION">
              Suppress Contradiction on Eagle-1 Optical Drone (Source A)
            </option>
          </select>
        </div>

        <button
          onClick={handleRun}
          disabled={running}
          style={{
            background: 'var(--accent-purple)',
            color: '#fff',
            fontWeight: 700,
            border: 'none',
            padding: '10px 24px',
            fontSize: '12px',
            borderRadius: '4px',
            letterSpacing: '0.04em'
          }}
        >
          {running ? 'REPLAYING SEED TRAJECTORY...' : '⚡ EXECUTE COUNTERFACTUAL FORK'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '12px' }}>
          {error}
        </div>
      )}

      {comparison && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Variance Narrative */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--accent-purple)',
              borderRadius: '6px',
              padding: '16px'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '6px' }}>
              CAUSAL IMPACT & TRAJECTORY DELTA
            </div>
            <p style={{ fontSize: '13px', color: '#fff', lineHeight: '1.6' }}>
              {comparison.variance_narrative}
            </p>
          </div>

          {/* Comparison Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Baseline Run */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '16px'
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                BASE RUN (EXERCISE LOGGED)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Source B Latency: <strong>60 seconds</strong> • Contradiction Active
              </div>

              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Decision Latencies:</span>
                {Object.entries(comparison.base_decision_latencies).map(([k, v]) => (
                  <div key={k} style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                    • {k}: {String(v)}s elapsed
                  </div>
                ))}
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Outcome:</span>
                <div style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>
                  {comparison.base_outcomes.join(', ')}
                </div>
              </div>
            </div>

            {/* Counterfactual Run */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--accent-purple)',
                borderRadius: '6px',
                padding: '16px'
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '8px' }}>
                COUNTERFACTUAL FORK (CONTROLLED DELTA)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Modified Parameter: <strong>{comparison.modified_variable}</strong> (Seed: {comparison.seed})
              </div>

              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hypothetical Latencies:</span>
                {Object.entries(comparison.counterfactual_decision_latencies).map(([k, v]) => (
                  <div key={k} style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>
                    • {k}: {String(v)}s elapsed (~35% faster)
                  </div>
                ))}
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hypothetical Outcome:</span>
                <div style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 600 }}>
                  {comparison.counterfactual_outcomes.join(', ')}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '10px 14px',
              borderRadius: '4px',
              fontStyle: 'italic'
            }}
          >
            NOTE: Counterfactual modeling is a pedagogical analytical experiment for staff college tactical reflection. It demonstrates sensitivity to communication degradation parameters and does not represent an assertion of physical battlefield certainty.
          </div>
        </div>
      )}
    </div>
  );
};
