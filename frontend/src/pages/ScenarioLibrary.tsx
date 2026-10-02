import React, { useState, useEffect } from 'react';
import { ScenarioPackage, SessionResponse } from '../types';
import { fetchScenarios, createSession } from '../services/api';
import { ScenarioCard } from '../components/ScenarioCard';
import { Layers, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-[50vh] text-[#6B7280]">
        <div className="flex items-center gap-2">
          <RefreshCw size={18} className="animate-spin text-[#FCA311]" />
          <span>Loading validated scenario packages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 pb-6 border-b border-[#E5E5E5]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FCA311] uppercase tracking-wider mb-2">
            <Layers size={14} />
            DSSC Approved Curriculum
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#14213D]">
            Exercise Scenario Definitions
          </h2>
          <p className="text-sm text-[#4B5563] mt-1">
            Deterministic tactical environments conforming to Ministry of Defence training specifications.
          </p>
        </div>

        {/* Seed input and Launch button */}
        <div className="flex items-center gap-4 bg-white p-2.5 rounded-lg border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-[#4B5563] px-2">
            <span>SEED:</span>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              className="w-24 px-2 py-1 rounded border border-[#E5E5E5] font-mono text-xs text-[#14213D] focus:outline-none focus:border-[#14213D]"
            />
          </div>

          <button
            onClick={handleLaunch}
            disabled={!selectedScenario || creating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#14213D] text-white text-xs font-semibold hover:bg-[#0B132B] transition-all disabled:opacity-50 shadow-sm"
          >
            <span>{creating ? 'Initializing...' : 'Launch Simulation Session'}</span>
            <ArrowRight size={14} className="text-[#FCA311]" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((sc) => (
          <ScenarioCard
            key={sc.scenario_id}
            scenario={sc}
            isSelected={selectedScenario?.scenario_id === sc.scenario_id}
            onSelect={(scen) => setSelectedScenario(scen)}
          />
        ))}
      </div>
    </div>
  );
};
