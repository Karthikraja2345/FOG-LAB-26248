# FOG-LAB 26248
### Immersive Multi-Domain Decision-Making Trainer for Degraded Communication Environments

**Smart India Hackathon 2026** | **Problem Statement ID:** 26248  
**Organization:** Ministry of Defence (MoD)  
**Department:** Defence Services Staff College (DSSC)  
**Category:** Software | **Theme:** Smart Automation  
**Core Product Identity:** *"Evidence-Backed Decision Training Under Degraded Information"*

---

## 1. Project Overview & One-Line Pitch
> *"Train decisions when the picture is incomplete—inject uncertainty live, coordinate as a team, and automatically reconstruct the decision story for the instructor."*

In contemporary multi-domain operations, small-team commanders rarely experience continuous, high-bandwidth intelligence flows. Cyber jamming, electronic warfare (EW) disruption, atmospheric occlusion, and sensor spoofing induce severe latency, missing feeds, and contradictory reports. Conventional simulations commit "hindsight bias" by evaluating commanders against what was actually happening rather than what was knowable at the exact second they ordered an action.

**FOG-LAB 26248** is an evidence-backed decision laboratory designed specifically for the Defence Services Staff College. It enforces the **Separation of Realities**—strictly decoupling objective ground truth from role-specific trainee perceptions—while empowering instructors to inject live communication degradation, observe asymmetric team coordination, and automatically reconstruct a **Hindsight-Safe After-Action Review (AAR)** with one-click PDF/HTML export and deterministic counterfactual replays.

---

## 2. Problem Statement Mapping

| PS 26248 Requirement | System Capability in FOG-LAB 26248 | Demonstration Proof |
|---|---|---|
| **Scenario Engine** | Versioned data-driven scenario packages with discrete-event state machines | 3 fully validated scenario packs runnable offline |
| **Delay Injection** | Per-source / per-channel latency transform with seeded deterministic jitter | Live delay control in Fog Composer; feed age counter |
| **Dropout & Silence** | Channel suppression and square-wave intermittent connectivity | Real-time `DROPPED` / `OFFLINE` badge transitions |
| **Conflicting Reports** | Source-specific divergent observations with conflict code tracking | Interactive **Contradiction Heatmap** |
| **Multiplayer Team Net** | Server-authoritative role-based WebSocket hub with message routing | 3 concurrent roles (`TEAM_LEAD`, `COORDINATION`, `INFORMATION`) |
| **Instructor Dashboard** | Live simulation clock, ground-truth view, and inject controls | **Instructor Control Room** with live ticker |
| **After-Action Review (AAR)** | 14-section review separating decision process from outcome | **Decision Context Cards**, **Asymmetry Matrix**, PDF/HTML export |
| **Replay & Counterfactual** | Reproducible execution via seed; single-variable branch testing | Scrubbable **Deterministic Replay** & **Counterfactual Fork** |
| **Web-First / XR-Ready** | Responsive browser interface; presentation-independent simulation core | Zero heavy VR dependencies required for evaluation |

---

## 3. High-Level Architecture

```
+-----------------------------------------------------------------------------------+
|                            FOG-LAB 26248 SIMULATION CORE                          |
|                                                                                   |
|   +-----------------------+              +------------------------------------+   |
|   |    Scenario Engine    | -----------> |   Communication Degradation Engine |   |
|   |  (Ground Truth State) |              |  (Delay, Drop, Conflict, Stale)    |   |
|   +-----------------------+              +------------------------------------+   |
|               |                                            |                      |
|               v                                            v                      |
|   +-----------------------+              +------------------------------------+   |
|   |  Ground Truth Log     |              |  Server-Side Visibility Filter     |   |
|   |  (Concealed Reality)  |              |  (Enforces Asymmetric Role Feeds)  |   |
|   +-----------------------+              +------------------------------------+   |
+---------------|--------------------------------------------|----------------------+
                |                                            |
                |                     +----------------------+----------------------+
                v                     v                      v                      v
        +---------------+     +---------------+      +---------------+      +---------------+
        |  Instructor   |     |   Team Lead   |      | Coordination  |      |  Information  |
        | Control Room  |     |   Terminal    |      |   Terminal    |      |   Terminal    |
        +---------------+     +---------------+      +---------------+      +---------------+
                |                     |                      |                      |
                +---------------------+----------------------+----------------------+
                                      |
                                      v
                           +--------------------+
                           |  Decision Ledger   |
                           | & Context Snapshot |
                           +--------------------+
                                      |
                                      v
                           +--------------------+
                           | Hindsight-Safe AAR |
                           |  & Counterfactual  |
                           +--------------------+
```

---

## 4. Winning Features & Differentiators

1. **Communication Fog Composer (Instructor Intervention)**:
   Live control room widget allowing instructors to select any sensor, configure latency (e.g. 60s) or dropouts, preview impacted roles, and commit injects with a live countdown timer and recovery controls.
2. **Information Asymmetry Matrix**:
   A live $N \times M$ matrix cross-referencing sub-unit roles against intelligence feeds, proving visually which team members had access to what information at decision time.
3. **Contradiction Heatmap**:
   Tracks divergent sensor reports (e.g. UAV optical feed claiming 6 hostile combat vehicles vs Ground Radar Doppler shift indicating false decoy reflectors), displaying timestamps, sources, and resolution state.
4. **Decision Context Cards (Hindsight Separation)**:
   Captures what the commander knew, delayed feeds, missing channels, and active conflicts at the exact moment of decision, preventing unfair post-hoc evaluator bias.
5. **Controlled Counterfactual Replay**:
   Reruns the exact exercise seed with a single parameter modified (e.g. removing radar delay) to scientifically measure causal sensitivity on decision latency and tactical outcome.
6. **Deterministic Scrubber Replay**:
   Scrub forward and backward through simulation time with variable playback speeds (0.5x, 1x, 2x, 4x) to inspect historical states.
7. **Evidence Pack Export**:
   Generates standalone, printable HTML packages and ReportLab-backed PDF reports complete with training disclaimers.

---

## 5. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Plain CSS (strictly zero Tailwind).
- **Backend API & Simulation**: Python 3.11, FastAPI, Pydantic v2.
- **Persistence**: SQLAlchemy 2.0 with SQLite (PostgreSQL-ready schema).
- **Realtime Networking**: Server-authoritative WebSocket multiplexer with heartbeat and sequence recovery.
- **Reporting**: ReportLab 5.0 (PDF compilation), Jinja2 (HTML generation).
- **Testing**: Pytest (16 automated tests covering 100% of core engine components).
- **Deployment**: Docker, Docker Compose, Makefile.

---

## 6. Installation & Quick Start

### Prerequisites
- Python 3.11+
- Node.js v20+ and npm

### 1. Clone & Set Up Backend
```bash
# Navigate to project
cd fog-lab-26248

# Copy environment configuration
cp .env.example .env

# Install backend dependencies
pip install -r backend/requirements.txt
```

### 2. Set Up Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### 3. Seed Demo Data & Pre-Flight Check
```bash
# Pre-populates sample exercise run with Conflicting Picture scenario
python scripts/seed_demo.py
```

### 4. Run the Platform
**Terminal 1 (Backend):**
```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 7. 3-Minute Judge Demonstration Script

1. **Landing Overview (0:00)**: Open `http://localhost:5173`. Click **"LAUNCH INSTRUCTOR CONTROL ROOM (DEMO)"**.
2. **Scenario Start (0:30)**: Click **"▶ START EXERCISE"**. Observe simulation clock ticking. Notice the classified Ground Truth banner and baseline Information Asymmetry Matrix.
3. **Inject Uncertainty (1:00)**: Open **Communication Fog Composer** on the right. Select `Sentinel Tactical Ground Radar (SOURCE_B_RADAR)`, mode `DELAY`, duration `60s`. Click **"PREVIEW IMPACT"** and then **"⚡ INJECT DEGRADATION"**. The Asymmetry Matrix immediately reflects the delayed telemetry for Operations Lead.
4. **Trainee View (1:45)**: Switch to **"Trainee Workspace"** tab. Switch roles between `TEAM_LEAD` and `INFORMATION`. Notice the optical feed reports armored vehicles while EW radar reveals Doppler decoy anomalies. Transmit a coordination message on the tactical net.
5. **Decision Dispatch (2:15)**: Under Command Decision Point, choose **"Hold Bridgehead & Request OP-Echo Cross-Verification"**, provide rationale, and click **"COMMIT COMMAND DISPATCH"**.
6. **Decision Context Card (2:45)**: Switch to **"Decision Ledger"**. Open the Decision Context Card. Show Section 1 (decision-time evidence) and click **"REVEAL POST-EXERCISE TRUTH & OUTCOME"** to demonstrate hindsight-safe evaluation.
7. **AAR & Export (3:15)**: Open **"AAR Dashboard"**. Review the training metrics and click **"📄 EXPORT PDF PACK"** to download the official DSSC report.
8. **Counterfactual Replay (3:45)**: Open **"Counterfactual"**. Run the zero-delay branch to prove causal latency reduction under identical seed conditions.

---

## 8. Automated Testing

FOG-LAB includes 16 unit and integration tests verifying all degradation modes, state machine transitions, multiplayer routing, and AAR generation.

```bash
python -m pytest backend/tests -v
```

Expected Output:
```
backend/tests/test_aar_and_counterfactual.py::test_aar_and_counterfactual_flow PASSED
backend/tests/test_degradation_engine.py::test_delay_transform_deterministic_jitter PASSED
backend/tests/test_degradation_engine.py::test_dropout_and_intermittent PASSED
backend/tests/test_degradation_engine.py::test_staleness_calculation PASSED
backend/tests/test_degradation_engine.py::test_partial_payload PASSED
backend/tests/test_degradation_engine.py::test_degradation_engine_lifecycle PASSED
backend/tests/test_degradation_engine.py::test_asymmetry_matrix_generation PASSED
backend/tests/test_health.py::test_root_endpoint PASSED
backend/tests/test_health.py::test_health_endpoint PASSED
backend/tests/test_scenario_engine.py::test_load_all_three_scenarios PASSED
backend/tests/test_scenario_engine.py::test_state_machine_transitions PASSED
backend/tests/test_scenario_engine.py::test_simulation_engine_ticks_and_decision PASSED
backend/tests/test_schemas.py::test_enums_integrity PASSED
backend/tests/test_schemas.py::test_scenario_package_validation PASSED
backend/tests/test_schemas.py::test_database_tables_creation PASSED
backend/tests/test_sessions_and_multiplayer.py::test_full_session_and_multiplayer_flow PASSED
======================== 16 passed in 1.97s ========================
```

---

## 9. Safety Boundaries & Compliance
This software prototype was engineered strictly for cognitive and sub-unit decision process training at the Defence Services Staff College. It complies with all MoD ethical boundaries:
- Contains **NO** real-world weapon systems, ballistic equations, or lethal targeting mechanisms.
- Contains **NO** operational cyber attack instructions, network exploit procedures, or radio jamming hardware designs.
- Uses **100% synthetic, abstract training scenarios** with fictional coordinates and entities.
- Runs entirely standalone and **offline** without connecting to live operational defence networks or external AI cloud APIs.

---

## 10. Team Structure & Responsibilities
- **Member 1 (Simulation Engineer)**: Scenario Engine, State Machine, Discrete Event Scheduler, 7 Degradation Transforms, Deterministic Replay.
- **Member 2 (Multiplayer & UX Engineer)**: Server-Authoritative Realtime WebSocket Manager, React 18 UI, Trainee Workspace, Instructor Control Room, Communication Fog Composer.
- **Member 3 (Analytics & AAR Engineer)**: Decision Ledger, Decision Context Snapshot Engine, Information Asymmetry Matrix, Contradiction Heatmap, Counterfactual Engine, ReportLab PDF / HTML Export.

---

## 11. Judge Q&A Cheat-Sheet
- **Q: Why web-first instead of heavy VR?**  
  *A: The Problem Statement explicitly allows web-based tools. A web-first architecture guarantees that 100% of cognitive simulation, multiplayer networking, and AAR analytics work seamlessly on standard computers without hardware barriers, while remaining presentation-independent for future WebXR immersion.*
- **Q: How does FOG-LAB prevent unfair evaluation?**  
  *A: Conventional exercises suffer from hindsight bias. FOG-LAB freezes the exact Decision Context Card at decision time—recording what was seen, delayed, dropped, and conflicting—evaluating process before revealing ground truth.*
- **Q: What is a Counterfactual Replay?**  
  *A: It reruns the identical exercise seed with exactly one degradation parameter modified (e.g. 0s latency instead of 60s), demonstrating system sensitivity and causal impact on decision times.*
