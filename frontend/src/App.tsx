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
import {
  Shield,
  Compass,
  Layers,
  SlidersHorizontal,
  Radio,
  FileText,
  Activity,
  RotateCcw,
  GitBranch,
  Wifi
} from 'lucide-react';

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
      {/* Institutional Top Command Navbar */}
      <header className="top-navbar">
        <div className="brand-section">
          <div
            className="brand-icon-wrapper cursor-pointer"
            onClick={() => setActiveTab('landing')}
            title="DSSC Wellington • FOG-LAB 26248"
          >
            <Shield size={20} className="text-orange" />
          </div>
          <div>
            <div
              className="brand-title cursor-pointer"
              onClick={() => setActiveTab('landing')}
            >
              FOG-LAB 26248
              <span className="brand-badge ml-2">PS 26248</span>
            </div>
            <div className="brand-subtitle">Defence Services Staff College • Wellington</div>
          </div>

          {currentSession && (
            <div className="hidden md:flex items-center ml-4 pl-4 border-l border-white/10 text-xs font-mono text-slate-300">
              <span className="text-slate-400 mr-2">EXERCISE:</span>
              <strong className="text-orange font-bold">{currentSession.session_code}</strong>
            </div>
          )}
        </div>

        {/* Navigation Tabs with Lucide Icons */}
        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'landing' ? 'active' : ''}`}
            onClick={() => setActiveTab('landing')}
          >
            <Compass size={14} />
            <span>Overview</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'scenarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('scenarios')}
          >
            <Layers size={14} />
            <span>Scenarios</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'instructor' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructor')}
          >
            <SlidersHorizontal size={14} />
            <span>Instructor Control</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'trainee' ? 'active' : ''}`}
            onClick={() => setActiveTab('trainee')}
          >
            <Radio size={14} />
            <span>Trainee Station</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'decisions' ? 'active' : ''}`}
            onClick={() => setActiveTab('decisions')}
          >
            <FileText size={14} />
            <span>Decision Ledger</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'aar' ? 'active' : ''}`}
            onClick={() => setActiveTab('aar')}
          >
            <Activity size={14} />
            <span>AAR Dashboard</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'replay' ? 'active' : ''}`}
            onClick={() => setActiveTab('replay')}
          >
            <RotateCcw size={14} />
            <span>Replay</span>
          </button>
          <button
            className={`nav-btn ${activeTab === 'counterfactual' ? 'active' : ''}`}
            onClick={() => setActiveTab('counterfactual')}
          >
            <GitBranch size={14} />
            <span>Counterfactual</span>
          </button>
        </nav>

        {/* System Status Indicator */}
        <div className="system-status-indicator hidden lg:flex">
          <div
            className={`status-dot ${
              loading ? 'degraded' : error ? 'offline' : 'online'
            }`}
          />
          <span className="flex items-center gap-1.5">
            <Wifi size={13} className="text-emerald-400" />
            {loading
              ? 'INITIALIZING'
              : error
              ? 'SIMULATION OFFLINE'
              : `DSSC ONLINE | DB: ${health?.database || 'CONNECTED'}`}
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
