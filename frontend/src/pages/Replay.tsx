import React, { useState, useEffect } from 'react';
import { SessionResponse, SimulationEvent } from '../types';
import { Timeline } from '../components/Timeline';

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
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading deterministic event trajectory...</div>;
  }

  const allEvents: SimulationEvent[] = replayData.events || [];
  const eventsUpToNow = allEvents.filter((e) => e.scenario_time <= currentTime);
  const maxTime = Math.max(30, replayData.total_scenario_time || 120);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
          DETERMINISTIC SIMULATION REPLAY
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Exact scenario reproducibility guaranteed by seed <span className="mono">({replayData.seed})</span>. Scrub to any timestamp to view the operational state as it existed at that instant.
        </p>
      </div>

      {/* Scrubber & Controls Bar */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '16px',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
            PLAYHEAD: T+{Math.round(currentTime)}s / T+{Math.round(maxTime)}s
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setCurrentTime((t) => Math.max(0, t - 5))}
              style={{ background: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--border-subtle)', padding: '6px 12px', fontSize: '12px' }}
            >
              ⏮ -5s
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                background: isPlaying ? 'var(--accent-amber)' : 'var(--accent-green)',
                color: '#000',
                fontWeight: 700,
                border: 'none',
                padding: '6px 16px',
                fontSize: '12px',
                borderRadius: '4px'
              }}
            >
              {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
            </button>
            <button
              onClick={() => setCurrentTime((t) => Math.min(maxTime, t + 5))}
              style={{ background: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--border-subtle)', padding: '6px 12px', fontSize: '12px' }}
            >
              +5s ⏭
            </button>

            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              style={{ fontSize: '11px', padding: '5px' }}
            >
              <option value="0.5">0.5x Speed</option>
              <option value="1.0">1.0x Speed</option>
              <option value="2.0">2.0x Speed</option>
              <option value="4.0">4.0x Speed</option>
            </select>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max={maxTime}
          step="1"
          value={currentTime}
          onChange={(e) => setCurrentTime(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Snapshot at playhead */}
      <div style={{ height: '360px' }}>
        <Timeline events={eventsUpToNow} />
      </div>
    </div>
  );
};
