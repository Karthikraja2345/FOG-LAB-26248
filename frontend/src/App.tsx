import React, { useState, useEffect } from 'react';
import './App.css';

interface HealthData {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  database: string;
  timestamp_utc: string;
  dssc_compliance: string;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: HealthData) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="app-layout">
      <header className="top-navbar">
        <div className="brand-section">
          <span className="brand-title">
            <span role="img" aria-label="shield">🛡️</span> FOG-LAB 26248
          </span>
          <span className="brand-tag">PS-26248 / MoD DSSC</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'landing' ? 'active' : ''}`}
            onClick={() => setActiveTab('landing')}
          >
            Overview
          </button>
          <button
            className={`nav-btn ${activeTab === 'scenarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('scenarios')}
          >
            Scenarios
          </button>
          <button
            className={`nav-btn ${activeTab === 'instructor' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructor')}
          >
            Instructor Control
          </button>
          <button
            className={`nav-btn ${activeTab === 'trainee' ? 'active' : ''}`}
            onClick={() => setActiveTab('trainee')}
          >
            Trainee Workspace
          </button>
          <button
            className={`nav-btn ${activeTab === 'aar' ? 'active' : ''}`}
            onClick={() => setActiveTab('aar')}
          >
            AAR & Ledger
          </button>
          <button
            className={`nav-btn ${activeTab === 'replay' ? 'active' : ''}`}
            onClick={() => setActiveTab('replay')}
          >
            Replay & Counterfactual
          </button>
        </nav>

        <div className="system-status-indicator">
          <div
            className={`status-dot ${
              loading ? 'degraded' : error ? 'offline' : 'online'
            }`}
          />
          <span>
            {loading
              ? 'INITIALIZING'
              : error
              ? 'SIMULATION OFFLINE'
              : `ONLINE | DB: ${health?.database}`}
          </span>
        </div>
      </header>

      <main className="main-content">
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '24px',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                  Immersive Multi-Domain Decision-Making Trainer for Degraded Communication Environments
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
                  <strong>Ministry of Defence (MoD) • Defence Services Staff College</strong> | Smart India Hackathon 2026
                </p>
                <p style={{ color: 'var(--accent-cyan)', fontSize: '12px', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                  Core Positioning: "Evidence-backed decision training under degraded information — separate ground truth from trainee observation, inject uncertainty live, coordinate as a team, and automatically reconstruct the decision story."
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}
          >
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '16px'
              }}
            >
              <h3 style={{ fontSize: '14px', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                1. Separation of Realities
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                Ground truth is strictly decoupled from trainee perception. Delivery transformations (delay, dropout, contradiction, staleness) simulate real-world electronic & cyber disruption.
              </p>
            </div>

            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '16px'
              }}
            >
              <h3 style={{ fontSize: '14px', color: 'var(--accent-green)', marginBottom: '8px' }}>
                2. Communication Fog Composer
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                Instructor controls live injects targeting specific feeds and roles. Live preview of affected trainees with deterministic jitter and recovery sequencing.
              </p>
            </div>

            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '16px'
              }}
            >
              <h3 style={{ fontSize: '14px', color: 'var(--accent-amber)', marginBottom: '8px' }}>
                3. Hindsight-Safe AAR
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                Evaluates decisions against what the commander knew at the moment of decision, rather than unfair post-hoc outcomes. Full Decision Context Cards & Asymmetry Matrix.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
