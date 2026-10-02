import React, { useState, useEffect } from 'react';
import './App.css';
import { SessionResponse } from './types';
import { createSession } from './services/api';
import { Landing } from './pages/Landing';
import { ScenarioLibrary } from './pages/ScenarioLibrary';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { TraineeWorkspace } from './pages/TraineeWorkspace';
import { AARDashboard } from './pages/AARDashboard';
import { DecisionReview } from './pages/DecisionReview';
import { Replay } from './pages/Replay';
import { Counterfactual } from './pages/Counterfactual';

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
  const [currentSession, setCurrentSession] = useState<SessionResponse | null>(null);
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

  // Ensure default demo session exists on mount
  useEffect(() => {
    if (!currentSession) {
      createSession('conflicting-picture', 424242)
        .then((sess) => setCurrentSession(sess))
        .catch((err) => console.warn('Could not auto-create demo session:', err));
    }
  }, [currentSession]);

  const handleSessionLaunched = (session: SessionResponse, targetView: string) => {
    setCurrentSession(session);
    setActiveTab(targetView);
  };

  return (
    <div className="app-layout">
      {/* Top Command Navbar */}
      <header className="top-navbar">
        <div className="brand-section">
          <span
            className="brand-title"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('landing')}
          >
            <span role="img" aria-label="shield">🛡️</span> FOG-LAB 26248
          </span>
          <span className="brand-tag">PS-26248 / MoD DSSC</span>
          {currentSession && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                marginLeft: '8px'
              }}
            >
              EXERCISE: <strong>{currentSession.session_code}</strong>
            </span>
          )}
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
            className={`nav-btn ${activeTab === 'decisions' ? 'active' : ''}`}
            onClick={() => setActiveTab('decisions')}
          >
            Decision Ledger
          </button>
          <button
            className={`nav-btn ${activeTab === 'aar' ? 'active' : ''}`}
            onClick={() => setActiveTab('aar')}
          >
            AAR Dashboard
          </button>
          <button
            className={`nav-btn ${activeTab === 'replay' ? 'active' : ''}`}
            onClick={() => setActiveTab('replay')}
          >
            Replay
          </button>
          <button
            className={`nav-btn ${activeTab === 'counterfactual' ? 'active' : ''}`}
            onClick={() => setActiveTab('counterfactual')}
          >
            Counterfactual
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

      {/* Main Dynamic View */}
      <main className="main-content">
        {activeTab === 'landing' && (
          <Landing
            onSessionLaunched={handleSessionLaunched}
            currentSession={currentSession}
          />
        )}

        {activeTab === 'scenarios' && (
          <ScenarioLibrary
            onSessionCreated={(sess) => {
              setCurrentSession(sess);
              setActiveTab('instructor');
            }}
          />
        )}

        {activeTab === 'instructor' && currentSession && (
          <InstructorDashboard
            session={currentSession}
            onNavigateAAR={() => setActiveTab('aar')}
          />
        )}

        {activeTab === 'trainee' && currentSession && (
          <TraineeWorkspace session={currentSession} />
        )}

        {activeTab === 'decisions' && currentSession && (
          <DecisionReview session={currentSession} />
        )}

        {activeTab === 'aar' && currentSession && (
          <AARDashboard session={currentSession} />
        )}

        {activeTab === 'replay' && currentSession && (
          <Replay session={currentSession} />
        )}

        {activeTab === 'counterfactual' && currentSession && (
          <Counterfactual session={currentSession} />
        )}
      </main>
    </div>
  );
};

export default App;
