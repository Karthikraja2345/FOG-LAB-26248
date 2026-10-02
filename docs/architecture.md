# System Architecture: FOG-LAB 26248

## 1. Architectural Topology

```
+-------------------------------------------------------------------------------+
|                             FOG-LAB SIMULATION CORE                           |
|                                                                               |
|   +-------------------+         +-----------------------------------------+   |
|   |  Scenario Engine  | ------> |      Communication Degradation Engine   |   |
|   |  (Ground Truth)   |         | (Delay, Drop, Conflict, Stale, Recovery)|   |
|   +-------------------+         +-----------------------------------------+   |
|             |                                        |                        |
|             |                                        v                        |
|             |                       +-------------------------------------+   |
|             |                       |   Server-Side Visibility Filter     |   |
|             |                       | (Enforces Role-Based Information)   |   |
|             |                       +-------------------------------------+   |
|             |                                        |                        |
|             v                                        v                        |
|   +-------------------+             +-------------------------------------+   |
|   |  Ground Truth Log |             |     Server-Authoritative Realtime   |   |
|   |  (Post-AAR Truth) |             |     WebSocket Hub & State Manager   |   |
|   +-------------------+             +-------------------------------------+   |
+-------------|----------------------------------------|------------------------+
              |                                        |
              |                   +--------------------+--------------------+
              |                   |                    |                    |
              v                   v                    v                    v
      +---------------+   +---------------+    +---------------+    +---------------+
      |  Instructor   |   |   Team Lead   |    | Coordination  |    |  Information  |
      | Control Room  |   |   Workspace   |    |   Workspace   |    |   Workspace   |
      +---------------+   +---------------+    +---------------+    +---------------+
              |                   |                    |                    |
              +-------------------+--------------------+--------------------+
                                  |
                                  v
                       +---------------------+
                       |   Decision Ledger   |
                       |  & Context Snapshot |
                       +---------------------+
                                  |
                                  v
                       +---------------------+
                       | Hindsight-Safe AAR  |
                       |  & Counterfactual   |
                       +---------------------+
```

## 2. Core Architectural Invariant: Dual-Reality Boundary
1. **Ground Truth Space**:
   - Represents the canonical, omniscient simulation state.
   - Managed exclusively by `backend.app.scenario.engine`.
   - Never directly transmitted to trainee socket channels.
2. **Observed Perception Space**:
   - Distinct, filtered data streams generated for each role (`TEAM_LEAD`, `COORDINATION`, `INFORMATION`).
   - Processed through degradation transforms:
     - $T_{delivery} = T_{generated} + \Delta_{delay} + J_{deterministic}$
     - Feed dropouts mask state vectors for duration $D$.
     - Contradictions emit competing observations targeting specific channels.
   - When a trainee submits a decision, the system records the exact cryptographic/hash snapshot of the observed perception space.

## 3. Technology Mapping
- **Backend API & Orchestration**: Python 3.11 + FastAPI + Pydantic v2.
- **Data Persistence**: SQLAlchemy ORM with SQLite database (PostgreSQL-ready schema design).
- **Multiplayer State Synchronization**: Server-authoritative WebSocket manager with sequenced message queue and replay recovery.
- **Frontend Presentation**: React 18 + TypeScript + Vite. Styling implemented with plain CSS and CSS Modules (strictly zero Tailwind).
- **Analytics & Report Generation**: Specialized Python reporting service generating structured JSON, self-contained HTML reports, and ReportLab-backed PDFs.
