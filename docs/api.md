# REST & WebSocket API Specification: FOG-LAB 26248

## 1. System Health
- `GET /api/health`
  - Returns: `{ "status": "healthy", "version": "1.0.0", "database": "connected", "dssc_compliance": "PS-26248-Compliant" }`

## 2. Scenarios
- `GET /api/scenarios`: List all loaded scenario packages.
- `GET /api/scenarios/{scenario_id}`: Get scenario definition by ID.
- `POST /api/scenarios/validate`: Validate scenario JSON package.

## 3. Sessions & Simulation Lifecycle
- `POST /api/sessions`: Initialize a new exercise session (`scenario_id`, `seed`).
- `GET /api/sessions/{id}`: Get session summary and connection details.
- `POST /api/sessions/{id}/join`: Join as participant (`role`, `display_name`).
- `POST /api/sessions/{id}/start`: Activate session (transitions state to `ACTIVE`).
- `POST /api/sessions/{id}/pause`: Pause session timer and ticker.
- `POST /api/sessions/{id}/resume`: Resume simulation.
- `POST /api/sessions/{id}/end`: Conclude exercise and compile AAR.
- `POST /api/sessions/{id}/tick`: Advance simulation clock by delta seconds.
- `GET /api/sessions/{id}/state?role={role}`: Retrieve role-filtered tactical perception state.

## 4. Instructor Controls (Communication Fog Composer)
- `POST /api/sessions/{id}/instructor/inject`: Apply live degradation inject (`source_id`, `target_roles`, `degradation_type`, `duration_seconds`, `intensity`).
- `POST /api/sessions/{id}/instructor/recover/{inject_id}`: Terminate active inject and restore channel.
- `POST /api/sessions/{id}/instructor/preview`: Preview role and feed impact prior to inject.
- `GET /api/sessions/{id}/instructor/asymmetry`: Fetch current Information Asymmetry Matrix.
- `GET /api/sessions/{id}/instructor/contradictions`: Fetch active Contradiction Heatmap items.

## 5. Decisions & Coordination
- `POST /api/sessions/{id}/decisions`: Submit commander decision (`selected_option`, `rationale`, `confidence`).
- `GET /api/sessions/{id}/decisions`: Retrieve captured Decision Context Cards.
- `POST /api/sessions/{id}/messages`: Transmit tactical net message (`recipient_role`, `content`).
- `GET /api/sessions/{id}/messages`: List tactical coordination messages.
- `GET /api/sessions/{id}/timeline`: Retrieve sequenced event log with role visibility filtering.

## 6. AAR & Replay
- `GET /api/sessions/{id}/aar`: Retrieve full 14-section structured AAR.
- `GET /api/sessions/{id}/aar/export?format={html|pdf|json}`: Download compiled AAR report.
- `GET /api/sessions/{id}/replay`: Get deterministic playback trajectory.
- `POST /api/sessions/{id}/counterfactual`: Execute single-variable counterfactual branch.

## 7. Realtime WebSocket
- `ws://localhost:8000/ws/sessions/{session_id}?role={role}&participant_id={id}`
  - Dispatches `INIT_STATE`, `STATE_UPDATE`, `EVENT`. Accepts heartbeat `PING`.
