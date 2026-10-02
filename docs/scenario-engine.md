# Scenario Engine & Authoring Specification: FOG-LAB 26248

## 1. Design Overview
The Scenario Engine is a purely data-driven system. Training exercises are defined as versioned packages containing metadata, roles, initial world state, information feeds, scheduled events, degradation triggers, decision points, and evaluation criteria.

No scenario logic is hard-coded into UI components.

## 2. Scenario Package Schema
A valid scenario package follows this structure:

```json
{
  "scenario_id": "conflicting-picture",
  "version": "1.0.0",
  "title": "Scenario B: Conflicting Picture in Grid Sector 7",
  "description": "Multi-source reconnaissance reports contradictory movement signatures during an active forward reconnaissance patrol.",
  "learning_objectives": [
    "Identify and cross-reference divergent intelligence feeds",
    "Evaluate source reliability profiles under latency",
    "Coordinate sub-unit verification prior to irreversible action"
  ],
  "seed": 424242,
  "duration_seconds": 360,
  "roles": [
    { "role_id": "TEAM_LEAD", "title": "Sub-Unit Commander", "clearance_level": "CMD" },
    { "role_id": "COORDINATION", "title": "Operations & Logistics Officer", "clearance_level": "OPS" },
    { "role_id": "INFORMATION", "title": "Electronic Warfare & Signals Specialist", "clearance_level": "SIG" }
  ],
  "information_sources": [
    {
      "source_id": "SOURCE_A_UAV",
      "name": "Eagle-1 Optical Reconnaissance UAV",
      "type": "OPTICAL_FEED",
      "baseline_reliability": 0.85,
      "latency_profile": { "base_ms": 200, "jitter_ms": 50 },
      "confidence_class": "MEDIUM_HIGH"
    },
    {
      "source_id": "SOURCE_B_GROUND_RADAR",
      "name": "Sentinel Tactical Battlefield Radar",
      "type": "RADAR_TELEMETRY",
      "baseline_reliability": 0.95,
      "latency_profile": { "base_ms": 100, "jitter_ms": 20 },
      "confidence_class": "HIGH"
    },
    {
      "source_id": "SOURCE_C_HUMINT",
      "name": "Forward Observation Post Alpha",
      "type": "HUMINT_DISPATCH",
      "baseline_reliability": 0.70,
      "latency_profile": { "base_ms": 1500, "jitter_ms": 500 },
      "confidence_class": "VARIABLE"
    }
  ],
  "world_state": {
    "grid_sector": "SECTOR_7_BRAVO",
    "hostile_contact_actual": "DECOY_CONVOY_EMITTING_FALSE_RF",
    "objective_state": "UNRESOLVED"
  },
  "scheduled_events": [],
  "degradation_rules": [],
  "decision_points": [],
  "outcome_rules": [],
  "evaluation_rules": []
}
```

## 3. Scenario State Machine Transitions
```
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|   [BRIEFING] ----> [ACTIVE] ----> [DEGRADED] ----> [DECISION_WINDOW] ----> [RECOVERY]   |
|                                                                                |        |
|                                                                                v        |
|                                         [AAR_READY] <---- [RESOLUTION] <-------+        |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```
All state transitions are timestamped, actor-attributed, and stored in the append-only event ledger.
