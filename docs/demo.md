# 3-Minute Judge Demonstration Script: FOG-LAB 26248

## 1. Demo Objectives
In under 4 minutes, prove that FOG-LAB 26248 is a genuinely working simulation platform that solves Problem Statement 26248 by:
1. Simulating degraded communication (delay, contradiction, dropout).
2. Measuring multi-role coordination under asymmetric information.
3. Allowing live instructor intervention via the **Communication Fog Composer**.
4. Generating a **Hindsight-Safe After-Action Review (AAR)** with **Decision Context Cards**.
5. Executing a **Controlled Counterfactual Replay**.

---

## 2. Step-by-Step Walkthrough

### 0:00 — Introduction & Scenario Selection
- Open `http://localhost:5173`.
- Highlight system health: Backend is active, SQLite connected, DSSC compliance verified.
- Click **"Scenarios"** tab. Show the 3 loaded scenario packages:
  - *Scenario A: Silent Window*
  - *Scenario B: Conflicting Picture (Primary Demo)*
  - *Scenario C: Multi-Domain Disruption*
- Click **"Initialize Exercise Session"** on *Scenario B: Conflicting Picture*.

### 0:45 — Instructor Control Room & Initial Health
- You are now in the **Instructor Control Room**.
- Point out:
  - Ground Truth Reality banner (Eagle-1 vs Sentinel Radar vs OP Echo).
  - Information Asymmetry Matrix: initially all channels are `DELIVERED` and healthy.
  - Uncertainty Budget: composite index is 0.0 (baseline conditions).
- Click **"▶ START EXERCISE"**. Simulation clock begins ticking.

### 1:15 — Signature Feature: Communication Fog Composer
- On the right panel, open **Communication Fog Composer**.
- Select Source: `Sentinel Tactical Ground Radar (SOURCE_B_RADAR)`.
- Mode: `DELAY (Latency injection)`.
- Target Roles: Check `COORDINATION`. Duration: `60s`. Intensity: `80%`.
- Click **"PREVIEW IMPACT"**: System calculates that only Operations Lead will be impacted while Team Lead still receives live optical data.
- Click **"⚡ INJECT DEGRADATION"**.
- Point out: Active Injects countdown starts (`INJ-001`, 60s remaining).
- Point out the **Information Asymmetry Matrix**: Tactical Radar for Coordination immediately switches to `DELAYED (+45s)`.

### 1:45 — Trainee Workspace & Contradiction Emergence
- Switch tab to **"Trainee Workspace"**.
- Select role `TEAM_LEAD`.
- Feeds show Eagle-1 reporting 6 armored combat vehicles advancing fast along Axis Bravo.
- Switch role to `INFORMATION` (EW/Signals Specialist):
  - Notice the **Contradiction Alert**: Radar Doppler signature shows low-mass reflectors inconsistent with heavy armor!
- Send a coordination message on the tactical net:
  *"Caution Team Lead: Doppler returns indicate synthetic decoy reflectors!"*

### 2:15 — Commander Decision Submission
- At T=120s, the Command Decision Point triggers.
- Prompt asks whether to strike Axis Bravo immediately, hold and cross-verify with forward observation post, or flank Ridge Charlie.
- Select: **"Hold Bridgehead & Request OP-Echo Cross-Verification"**.
- Enter Rationale: *"Radar Doppler discrepancy indicates probable decoy; holding bridgehead to avoid ambush."*
- Confidence: **HIGH**.
- Click **"COMMIT COMMAND DISPATCH"**.
- Visual confirmation: Decision frozen into immutable event ledger.

### 2:45 — Decision Context Card & Evidence Inspection
- Switch to **"Decision Ledger"** tab.
- Open the newly generated **Decision Context Card**:
  - Show Section 1: Exactly what was available, delayed, missing, and conflicting at that second.
  - Show Section 2: Commander's rationale and confidence.
  - Click **"REVEAL POST-EXERCISE TRUTH & OUTCOME"**: Demonstrates how FOG-LAB separates process from outcome! Ground truth reveals that Axis Bravo was indeed an acoustic decoy and Ridge Charlie concealed the real hostile force.

### 3:15 — Hindsight-Safe AAR & Multi-Format Export
- Click **"AAR Dashboard"** tab.
- Walk through the 14 sections:
  - Training metrics: Avg decision latency, contradiction awareness rate, coordination density.
  - Information Asymmetry Matrix and Contradiction Heatmap.
  - Decision Context Card with ground truth reconciliation.
- Click **"📄 EXPORT PDF PACK"** and **"🌐 EXPORT HTML"**: Opens beautiful, printable evaluation reports ready for DSSC directing staff.

### 3:45 — Controlled Counterfactual Replay
- Click **"Counterfactual"** tab.
- Select: *"Remove Latency Injection on Tactical Radar (Source B) [60s → 0s]"*.
- Click **"⚡ EXECUTE COUNTERFACTUAL FORK"**.
- The simulation reruns the exact same seed (`424242`) with zero radar latency.
- Side-by-side comparison reveals: decision latency drops from 48s to 31s because the Doppler anomaly arrived in time.
- Emphasize the disclaimer: *"Controlled training counterfactual for tactical reflection."*
