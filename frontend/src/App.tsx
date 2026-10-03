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
      {/* Institutional Top Command Header (Two-Tier Standard) */}
      <header className="top-header-wrapper">
        {/* Tier 1: Institutional Governance & Utility Bar */}
        <div className="gov-utility-bar">
          <div className="gov-utility-left">
            <span className="w-2 h-2 rounded-full bg-[#FCA311]"></span>
            <span className="font-semibold text-white tracking-wider">
              MINISTRY OF DEFENCE (MoD) • DEFENCE SERVICES STAFF COLLEGE (DSSC)
            </span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-[11px] text-[#FCA311]">PS-26248</span>
          </div>

          <div className="gov-utility-right">
            {currentSession && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-400">EXERCISE:</span>
                <span className="font-bold text-[#FCA311]">{currentSession.session_code}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-slate-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  loading
                    ? 'bg-amber-400'
                    : error
                    ? 'bg-red-400'
                    : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                }`}
              />
              <Wifi size={12} className="text-emerald-400" />
              <span className="text-slate-300 text-[11px]">
                {loading
                  ? 'INITIALIZING'
                  : error
                  ? 'SIMULATION OFFLINE'
                  : `DSSC SIMULATION ONLINE | DB: ${health?.database || 'CONNECTED'}`}
              </span>
            </div>
          </div>
        </div>

        {/* Tier 2: Primary Brand & Command Navigation Bar */}
        <nav className="top-navbar">
          <div
            className="brand-section cursor-pointer"
            onClick={() => setActiveTab('landing')}
            title="DSSC Wellington • FOG-LAB 26248"
          >
            <div className="brand-icon-wrapper">
              <Shield size={22} className="text-[#FCA311]" />
            </div>
            <div className="brand-title">
              <span>FOG-LAB 26248</span>
              <span className="brand-tag-pill">DECISION TRAINER</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="nav-links">
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
          </div>
        </nav>
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
