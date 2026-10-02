import React, { useState } from 'react';
import { InformationSource, RoleEnum, DegradationType, ActiveDegradation } from '../types';
import { injectDegradation, recoverDegradation, previewInject } from '../services/api';

interface DegradationComposerProps {
  sessionId: string;
  sources: InformationSource[];
  activeDegradations: ActiveDegradation[];
  onInjectCommitted?: () => void;
}

export const DegradationComposer: React.FC<DegradationComposerProps> = ({
  sessionId,
  sources,
  activeDegradations,
  onInjectCommitted
}) => {
  const [selectedSource, setSelectedSource] = useState<string>(sources[0]?.source_id || '');
  const [selectedMode, setSelectedMode] = useState<DegradationType>('DELAY');
  const [targetRoles, setTargetRoles] = useState<RoleEnum[]>([
    'TEAM_LEAD',
    'COORDINATION'
  ]);
  const [duration, setDuration] = useState<number>(60);
  const [intensity, setIntensity] = useState<number>(0.75);
  const [preview, setPreview] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleToggle = (role: RoleEnum) => {
    if (targetRoles.includes(role)) {
      setTargetRoles(targetRoles.filter((r) => r !== role));
    } else {
      setTargetRoles([...targetRoles, role]);
    }
  };

  const handlePreview = async () => {
    if (!selectedSource) return;
    try {
      const p = await previewInject(sessionId, {
        source_id: selectedSource,
        target_roles: targetRoles,
        degradation_type: selectedMode,
        duration_seconds: duration,
        intensity
      });
      setPreview(p);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInject = async () => {
    if (!selectedSource) {
      setError('Please select an intelligence source.');
      return;
    }
    if (targetRoles.length === 0) {
      setError('Please select at least one target role.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await injectDegradation(sessionId, {
        source_id: selectedSource,
        target_roles: targetRoles,
        degradation_type: selectedMode,
        duration_seconds: duration,
        intensity,
        parameters: {
          delay_seconds: selectedMode === 'DELAY' ? Math.round(duration * 0.7) : 0,
          conflicting_source: selectedMode === 'CONTRADICTION' ? 'SOURCE_C_HUMINT' : undefined,
          opposing_claim:
            selectedMode === 'CONTRADICTION'
              ? 'Axis Bravo convoy is confirmed hostile main assault echelon!'
              : undefined
        }
      });
      setPreview(null);
      if (onInjectCommitted) onInjectCommitted();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecover = async (injectId: string) => {
    try {
      await recoverDegradation(sessionId, injectId);
      if (onInjectCommitted) onInjectCommitted();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        padding: '16px'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <span
          style={{
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--accent-amber)',
            letterSpacing: '0.05em'
          }}
        >
          COMMUNICATION FOG COMPOSER
        </span>
        <span
          style={{
            fontSize: '11px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: 'var(--accent-amber)',
            padding: '2px 8px',
            borderRadius: '3px',
            fontFamily: 'var(--font-mono)'
          }}
        >
          LIVE UNCERTAINTY INJECTOR
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            TARGET INTELLIGENCE SOURCE
          </label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            style={{ width: '100%', fontSize: '12px' }}
          >
            {sources.map((s) => (
              <option key={s.source_id} value={s.source_id}>
                {s.name} ({s.source_id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            DEGRADATION PRIMITIVE
          </label>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value as DegradationType)}
            style={{ width: '100%', fontSize: '12px' }}
          >
            <option value="DELAY">DELAY (Latency injection)</option>
            <option value="DROPOUT">DROPOUT (Total silence)</option>
            <option value="INTERMITTENT">INTERMITTENT (Flickering link)</option>
            <option value="CONTRADICTION">CONTRADICTION (Opposing report)</option>
            <option value="STALENESS">STALENESS (Data freeze)</option>
            <option value="PARTIAL_PAYLOAD">PARTIAL PAYLOAD (Masking)</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
          TARGET RECIPIENT ROLES (Server-Enforced Information Compartmentalization)
        </label>
        <div style={{ display: 'flex', gap: '14px' }}>
          {(['TEAM_LEAD', 'COORDINATION', 'INFORMATION'] as RoleEnum[]).map((r) => (
            <label
              key={r}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: targetRoles.includes(r) ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={targetRoles.includes(r)}
                onChange={() => handleRoleToggle(r)}
              />
              {r.replace('_', ' ')}
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            <span>DURATION: {duration}s</span>
          </div>
          <input
            type="range"
            min="10"
            max="300"
            step="10"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            <span>INTENSITY: {Math.round(intensity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {preview && (
        <div
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px dashed var(--accent-cyan)',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '12px',
            fontSize: '11px'
          }}
        >
          <div style={{ color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '4px' }}>
            IMPACT PREVIEW:
          </div>
          <div style={{ color: '#fff' }}>{preview.impact_summary}</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Impacted Roles: {preview.affected_roles.join(', ') || 'None'}
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--accent-red)', fontSize: '11px', marginBottom: '10px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button
          onClick={handlePreview}
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: '6px 14px',
            fontSize: '12px'
          }}
        >
          PREVIEW IMPACT
        </button>
        <button
          onClick={handleInject}
          disabled={isSubmitting}
          style={{
            background: 'var(--accent-amber)',
            color: '#000',
            fontWeight: 700,
            border: 'none',
            padding: '6px 18px',
            fontSize: '12px',
            letterSpacing: '0.04em'
          }}
        >
          {isSubmitting ? 'INJECTING...' : '⚡ INJECT DEGRADATION'}
        </button>
      </div>

      {/* Active Injects List */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            marginBottom: '8px'
          }}
        >
          ACTIVE RUNTIME INJECTS ({activeDegradations.length})
        </div>

        {activeDegradations.length === 0 ? (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Channels operating under baseline conditions. No active injects.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {activeDegradations.map((inj) => (
              <div
                key={inj.inject_id}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--accent-amber)',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>
                    {inj.source_id} • {inj.degradation_type}
                  </div>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    Target: {inj.target_roles.join(', ')} • {Math.round(inj.remaining_seconds)}s remaining
                  </div>
                </div>

                <button
                  onClick={() => handleRecover(inj.inject_id)}
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: 'var(--accent-green)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '4px 10px',
                    fontSize: '10px',
                    fontWeight: 600
                  }}
                >
                  RECOVER CHANNEL
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
