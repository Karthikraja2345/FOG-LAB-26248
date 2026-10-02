# System Requirements Specification: FOG-LAB 26248

**Problem Statement ID:** 26248  
**Organization:** Ministry of Defence (MoD), Defence Services Staff College  
**Category:** Software / Smart Automation  

## 1. Problem Statement
The modern multi-domain operating environment is characterized by intense contestation across electromagnetic, cyber, spatial, and physical domains. Small-team commanders and sub-unit leaders cannot expect clean, real-time, high-bandwidth intelligence flows. Current military simulations often suffer from "god-view" bias where trainees operate under near-perfect situational awareness or where network disruptions are simulated as binary on/off switches without measuring the resultant cognitive and decision impact.

## 2. Functional Requirements
### FR-1: Data-Driven Scenario Engine
- Must load, parse, and validate versioned scenario packages (JSON/YAML).
- Must enforce scenario state machine transitions: `BRIEFING` -> `ACTIVE` -> `DEGRADED` -> `DECISION_WINDOW` -> `RECOVERY` -> `RESOLUTION` -> `AAR_READY`.
- Must preserve a deterministic seed ensuring 100% reproducible execution.

### FR-2: Communication Degradation Engine
- Must support 7 distinct information degradation primitives:
  1. **Delay**: Latency injection with deterministic jitter.
  2. **Dropout**: Channel occlusion and silent windows.
  3. **Intermittent Connectivity**: Periodic flakiness and burst losses.
  4. **Contradiction**: Divergent reports emitted by distinct sources regarding the same physical/tactical entity.
  5. **Staleness**: Temporal aging of observations without refreshing.
  6. **Partial Payload**: Attribute masking / missing field reports.
  7. **Recovery**: Restoration of channel and backlogged state re-synchronization.

### FR-3: Server-Authoritative Realtime Multiplayer
- Must support simultaneous connection of 3 generic sub-unit roles:
  - `TEAM_LEAD` (Command / Dispatch authority)
  - `COORDINATION` (Operations / Cross-unit synchronization)
  - `INFORMATION` (Signals / Electronic intelligence / Systems)
  - `INSTRUCTOR` (Omniscient supervisory control)
- Must enforce role-based information visibility server-side (trainee clients never receive masked ground truth).

### FR-4: Communication Fog Composer (Instructor Intervention)
- Live instructor interface to inject, adjust, or recover degradation dynamically during runtime.
- Real-time impact preview indicating which roles and feeds are affected prior to commit.

### FR-5: Decision Ledger & Decision Context Capture
- Capture every commander action with:
  - Timestamp (scenario-relative and UTC).
  - Selected option & decision type.
  - Trainee rationale (free-text or tag-based).
  - Subjective confidence level (Low, Medium, High).
  - **Decision-time Information Context**: Exact snapshot of reports visible, delayed, missing, and conflicting.
  - Linked post-exercise ground-truth outcome.

### FR-6: Hindsight-Safe After-Action Review (AAR)
- Clear separation between the decision evaluation (evaluated solely against information available at decision time) and the stochastic outcome.
- Automated generation of:
  - Information Asymmetry Matrix
  - Contradiction Heatmap
  - Uncertainty Budget
  - Team & Individual Chronological Timelines
  - Multi-format Export (HTML, PDF, JSON).

### FR-7: Deterministic & Counterfactual Replay
- Scrubbable event playback with variable playback speeds.
- Controlled counterfactual execution: rerun the exact scenario seed modifying a single degradation parameter to evaluate causal impact on decisions.

## 3. Non-Functional Requirements
- **Performance**: Event dispatch latency < 50ms; injection-to-client reflection < 2s.
- **Reliability**: Automatic client re-synchronization with sequence reconciliation upon reconnect.
- **Safety**: Purely synthetic abstract scenarios; strict prohibition of operational targeting, live weaponry, real-world C2 links, or cyber exploitation instructions.
- **Independence**: 100% offline operational capability without external cloud/LLM dependencies.
