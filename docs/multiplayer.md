# Realtime Multiplayer & State Synchronization: FOG-LAB 26248

## 1. Architectural Strategy
FOG-LAB operates on a **Server-Authoritative Realtime Model** implemented over WebSocket connections. Client terminals never run independent simulation steps; they act as reactive interfaces receiving state projections and submitting user intents (messages, injects, decisions).

## 2. Session & Participant Lifecycle
- **Session Code**: A unique 6-character alphanumeric or UUID-based room identifier (`SESS-26248-ALPHA`).
- **Connection Handshake**:
  1. Client initiates WebSocket connection to `/ws/sessions/{session_id}?participant_id={id}&role={role}`.
  2. Server verifies role availability and initializes `ParticipantState`.
  3. Server dispatches `session.sync` containing the full replayable event history and active simulation snapshot.
- **Heartbeat & Presence**: Ping/pong heartbeat every 5 seconds. If a client disconnects, their status transitions to `DISCONNECTED` with a visual warning in the Instructor Control Room.

## 3. Reconnection & Catch-Up Protocol
When a client reconnects after temporary network dropout:
1. Re-authenticates with previously assigned `participant_id` and last processed `sequence_number`.
2. Server queries event store for events with `sequence_number > last_seq`.
3. Server streams differential delta events, smoothly resynchronizing client UI without state corruption or duplicate decision triggers.

## 4. Role Isolation & Information Compartmentalization
- `INSTRUCTOR`: Receives ground truth, all participant views, raw logs, and controls.
- `TEAM_LEAD`: Receives tactical feeds tagged for `TEAM_LEAD` or `ALL`, decision submission authority, and team chat.
- `COORDINATION`: Receives operational telemetry, logistics feeds, and coordination proposals.
- `INFORMATION`: Receives signals intelligence, spectrum status, electronic sensor data, and raw telemetry.
