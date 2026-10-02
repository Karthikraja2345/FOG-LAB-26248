# Changelog & Implementation History: FOG-LAB 26248

## Version 1.0.0 (SIH 2026 Submission Release)
### Added
- **Monorepo Architecture**: Scaffolded complete repository structure with FastAPI backend, React TypeScript frontend, SQLite persistence, and Docker compose configuration.
- **Data-Driven Scenario Packages**:
  - `silent-window`: Communication loss & recovery during mountainous escort.
  - `conflicting-picture`: Primary demo scenario with optical vs radar vs HUMINT divergences.
  - `multi-domain-disruption`: Land, air, cyber, and EW mixed disruption.
- **Communication Degradation Engine**:
  - Implemented 7 primitives: Delay (with seeded jitter), Dropout, Intermittent square-wave, Contradiction, Staleness, Partial payload masking, and Channel recovery.
- **Server-Authoritative Realtime Multiplayer**:
  - WebSocket hub supporting synchronized multi-client sessions (`TEAM_LEAD`, `COORDINATION`, `INFORMATION`, `INSTRUCTOR`).
  - Server-enforced role visibility filtering.
- **Signature Feature: Communication Fog Composer**:
  - Live instructor inject panel with source selection, target role checkboxes, duration/intensity sliders, impact preview, and active countdown timer.
- **Signature Feature: Information Asymmetry Matrix**:
  - Real-time tabular visualization cross-referencing roles against intelligence sources.
- **Signature Feature: Contradiction Heatmap**:
  - Auditing divergent claims between conflicting sensors.
- **Signature Feature: Decision Ledger & Decision Context Cards**:
  - Freezes exact decision-time perception snapshot (seen, delayed, missing, conflicting) decoupled from post-exercise ground truth.
- **Signature Feature: Hindsight-Safe AAR Dashboard**:
  - Comprehensive 14-section review with training metrics (decision latency, contradiction awareness, coordination frequency).
- **Multi-Format Export Engine**:
  - One-click export to standalone HTML report and ReportLab-backed PDF evidence packs.
- **Deterministic Replay & Counterfactual Engine**:
  - Scrubbable event playback with speed multipliers (0.5x to 4x).
  - Controlled single-variable branching to scientifically compare causal trajectories.
- **Automated Test Suite**:
  - 16 comprehensive unit and integration tests passing with 100% success rate.
