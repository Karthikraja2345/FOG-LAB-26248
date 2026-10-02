import React, { useState, useEffect } from 'react';
import { SessionResponse, SimulationEvent } from '../types';
import { Timeline } from '../components/Timeline';
import { Play, Pause, Clock, Shield, RefreshCw } from 'lucide-react';

interface ReplayProps {
  session: SessionResponse;
}

export const Replay: React.FC<ReplayProps> = ({ session }) => {
  const [replayData, setReplayData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`/api/sessions/${session.session_id}/replay`)
      .then((res) => res.json())
      .then((data) => {
        setReplayData(data);
        setCurrentTime(data.total_scenario_time || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [session.session_id]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 1.0 * playbackSpeed;
        if (replayData && next >= (replayData.total_scenario_time || 120)) {
          setIsPlaying(false);
          return replayData.total_scenario_time || 120;
        }
        return next;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, replayData]);

  if (loading || !replayData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-[#6B7280]">
        <div className="flex items-center gap-2">
          <RefreshCw size={18} className="animate-spin text-[#FCA311]" />
          <span>Loading deterministic event trajectory...</span>
        </div>
      </div>
    );
  }

  const allEvents: SimulationEvent[] = replayData.events || [];
  const eventsUpToNow = allEvents.filter((e) => e.scenario_time <= currentTime);
  const maxTime = Math.max(30, replayData.total_scenario_time || 120);

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div className="pb-6 border-b border-[#E5E5E5]">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FCA311] uppercase tracking-wider mb-2">
          <Shield size={14} />
          Deterministic Event Trajectory
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#14213D]">
          Deterministic Scenario Replay
        </h2>
        <p className="text-sm text-[#4B5563] mt-1">
          Exact reproducibility guaranteed by seed <span className="font-mono text-[#14213D]">({replayData.seed})</span>. Scrub to any timestamp to view the operational state as it existed at that instant.
        </p>
      </div>

      {/* Scrubber & Controls Bar */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="font-mono text-base font-bold text-[#14213D] flex items-center gap-2">
            <Clock size={16} className="text-[#FCA311]" />
            <span>PLAYHEAD: T+{Math.round(currentTime)}s / T+{Math.round(maxTime)}s</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTime((t) => Math.max(0, t - 5))}
              className="px-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-white text-xs font-medium text-[#14213D] hover:bg-[#F9FAFB]"
            >
              -5s
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all ${
                isPlaying
                  ? 'bg-amber-500 text-black hover:bg-amber-600'
                  : 'bg-[#14213D] text-white hover:bg-[#0B132B]'
              }`}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} className="text-[#FCA311]" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={() => setCurrentTime((t) => Math.min(maxTime, t + 5))}
              className="px-3 py-1.5 rounded-lg border border-[#E5E5E5] bg-white text-xs font-medium text-[#14213D] hover:bg-[#F9FAFB]"
            >
              +5s
            </button>

            <div className="flex items-center gap-1 border-l border-[#E5E5E5] pl-2 ml-1">
              {[0.5, 1.0, 2.0, 4.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-2 py-1 rounded text-xs font-mono font-semibold transition-all ${
                    playbackSpeed === s
                      ? 'bg-[#14213D] text-white'
                      : 'bg-white border border-[#E5E5E5] text-[#4B5563] hover:text-[#14213D]'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Range Scrubber */}
        <input
          type="range"
          min="0"
          max={maxTime}
          step="1"
          value={currentTime}
          onChange={(e) => {
            setCurrentTime(Number(e.target.value));
            setIsPlaying(false);
          }}
          className="w-full accent-[#FCA311] cursor-pointer"
        />
      </div>

      {/* Replayed Event History */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-sm">
        <h3 className="font-serif text-lg font-bold text-[#14213D] mb-4">
          Events Emitted Up to T+{Math.round(currentTime)}s ({eventsUpToNow.length} of {allEvents.length})
        </h3>
        <Timeline events={eventsUpToNow} />
      </div>
    </div>
  );
};
