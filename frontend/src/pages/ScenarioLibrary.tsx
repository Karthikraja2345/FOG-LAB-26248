import React, { useState, useEffect } from 'react';
import { ScenarioPackage, SessionResponse } from '../types';
import { fetchScenarios, createSession } from '../services/api';
import { ScenarioCard } from '../components/ScenarioCard';

interface ScenarioLibraryProps {
  onSessionCreated: (session: SessionResponse) => void;
}

export const ScenarioLibrary: React.FC<ScenarioLibraryProps> = ({ onSessionCreated }) => {
  const [scenarios, setScenarios] = useState<ScenarioPackage[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioPackage | null>(null);
  const [seed, setSeed] = useState<number>(424242);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScenarios()
      .then((data) => {
        setScenarios(data);
        // Default to Conflicting Picture (Primary Demo)
        const primary = data.find((s) => s.scenario_id === 'conflicting-picture') || data[0];
        setSelectedScenario(primary || null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleLaunch = async () => {
    if (!selectedScenario) return;
    setCreating(true);
    setError(null);
    try {
      const sess = await createSession(selectedScenario.scenario_id, seed);
      onSessionCreated(sess);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading validated scenario packages...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
            SCENARIO DEFINITIONS & SIMULATION LIBRARY
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Select a verified data-driven training exercise package. All scenarios adhere to MoD DSSC non-operational training boundaries.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              SEED:
            </label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              style={{ width: '90px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <button
            onClick={handleLaunch}
            disabled={!selectedScenario || creating}
            style={{
              background: 'var(--accent-blue)',
              color: '#fff',
              border: 'none',
              padding: '8px 20px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '4px',
              letterSpacing: '0.04em'
            }}
          >
            {creating ? 'INITIALIZING SESSION...' : 'INITIALIZE EXERCISE SESSION →'}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--accent-red)',
            color: 'var(--accent-red)',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '12px'
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '16px'
        }}
      >
        {scenarios.map((scen) => (
          <ScenarioCard
            key={scen.scenario_id}
            scenario={scen}
            isSelected={selectedScenario?.scenario_id === scen.scenario_id}
            onSelect={(s) => setSelectedScenario(s)}
          />
        ))}
      </div>
    </div>
  );
};
