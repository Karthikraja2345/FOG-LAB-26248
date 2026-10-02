import React from 'react';
import { ScenarioPackage } from '../types';

interface ScenarioCardProps {
  scenario: ScenarioPackage;
  isSelected: boolean;
  onSelect: (scenario: ScenarioPackage) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  isSelected,
  onSelect
}) => {
  return (
    <div
      onClick={() => onSelect(scenario)}
      style={{
        background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-secondary)',
        border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
        borderRadius: '6px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              padding: '2px 6px',
              borderRadius: '3px'
            }}
          >
            {scenario.scenario_id.toUpperCase()} • v{scenario.version}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            ⏱ {Math.round(scenario.duration_seconds / 60)} MIN
          </span>
        </div>

        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
          {scenario.title}
        </h3>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
          {scenario.description}
        </p>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>
            LEARNING OBJECTIVES:
          </div>
          <ul style={{ paddingLeft: '16px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            {scenario.learning_objectives.map((obj, i) => (
              <li key={i} style={{ marginBottom: '2px' }}>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {scenario.roles.length} ROLES • {scenario.information_sources.length} FEEDS
        </span>
        <button
          style={{
            background: isSelected ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
            color: '#fff',
            border: 'none',
            padding: '6px 14px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '4px'
          }}
        >
          {isSelected ? 'SELECTED' : 'SELECT SCENARIO'}
        </button>
      </div>
    </div>
  );
};
