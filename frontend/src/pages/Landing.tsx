import React from 'react';
import { SessionResponse } from '../types';
import { createSession } from '../services/api';

interface LandingProps {
  onSessionLaunched: (session: SessionResponse, targetView: string) => void;
  currentSession?: SessionResponse | null;
}

export const Landing: React.FC<LandingProps> = ({ onSessionLaunched }) => {
  const handleQuickDemo = async (role: string = 'instructor') => {
    try {
      const sess = await createSession('conflicting-picture', 424242);
      onSessionLaunched(sess, role);
    } catch (err) {
      console.error('Failed to quick start demo:', err);
    }
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'radial-gradient(ellipse at top, #192231 0%, #0d131d 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '36px',
          marginBottom: '28px',
          textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            background: 'rgba(6, 182, 212, 0.15)',
            color: 'var(--accent-cyan)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            padding: '4px 12px',
            borderRadius: '4px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            marginBottom: '14px'
          }}
        >
          SMART INDIA HACKATHON 2026 • PROBLEM STATEMENT 26248
        </span>

        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '0.02em',
            marginBottom: '10px'
          }}
        >
          FOG-LAB 26248
        </h1>
        <h2 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--accent-cyan)', marginBottom: '14px' }}>
          Immersive Multi-Domain Decision-Making Trainer for Degraded Communication Environments
        </h2>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
          Ministry of Defence (MoD) • Defence Services Staff College (DSSC)
          <br />
          <em>"Train decisions when the picture is incomplete—inject uncertainty live, coordinate as a team, and automatically reconstruct the decision story for the instructor."</em>
        </div>

        {/* Quick Launch Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleQuickDemo('instructor')}
            style={{
              background: 'var(--accent-cyan)',
              color: '#000',
              fontWeight: 700,
              border: 'none',
              padding: '12px 28px',
              fontSize: '13px',
              borderRadius: '4px',
              letterSpacing: '0.04em'
            }}
          >
            LAUNCH INSTRUCTOR CONTROL ROOM (DEMO) →
          </button>

          <button
            onClick={() => handleQuickDemo('trainee')}
            style={{
              background: 'var(--bg-tertiary)',
              color: '#fff',
              border: '1px solid var(--border-subtle)',
              padding: '12px 24px',
              fontSize: '13px',
              borderRadius: '4px',
              fontWeight: 600
            }}
          >
            ENTER AS SUB-UNIT TRAINEE →
          </button>
        </div>
      </div>

      {/* Feature Pillar Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}
      >
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '18px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '8px' }}>
            1. Communication Fog Composer
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Instructors can live-inject 7 degradation modes: Latency Delay, Feed Dropout, Intermittent Links, Contradictory Telemetry, Staleness, and Partial Masking with instant impact preview.
          </p>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '18px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
            2. Separation of Realities
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Ground truth and observed perceptions never collide. Server-authoritative visibility prevents clients from inspecting concealed objective reality until after the exercise.
          </p>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '18px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '8px' }}>
            3. Hindsight-Safe AAR
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Reconstructs the commander's decision story strictly against what was knowable at decision time, eliminating hindsight contamination while providing downloadable PDF/HTML evidence packs.
          </p>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '18px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '8px' }}>
            4. Counterfactual Replay
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Reruns the exact scenario seed modifying a single degradation variable to scientifically demonstrate causal impact on team latency, coordination, and mission outcome.
          </p>
        </div>
      </div>
    </div>
  );
};
