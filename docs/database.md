# Database Schema & Entity Relational Model: FOG-LAB 26248

## 1. Relational Topology
The database is implemented using SQLAlchemy 2.0 with a SQLite engine for local/demo execution and full compatibility with PostgreSQL for production staff college deployments.

```
+-------------------+           1:N           +---------------------+
|   scenarios       | ----------------------> |     sessions        |
+-------------------+                         +---------------------+
| id (PK)           |                         | id (PK)             |
| version           |                         | session_code (UQ)   |
| title             |                         | scenario_id (FK)    |
| data_json         |                         | status              |
+-------------------+                         | seed                |
                                              | scenario_time       |
                                              +---------------------+
                                                         |
                   +-------------------+-----------------+--------------------+
                   | 1:N               | 1:N             | 1:N                | 1:N
                   v                   v                 v                    v
         +-------------------+ +---------------+ +-----------------+  +-------------------+
         |   participants    | |    events     | | degradation_ev  |  |    decisions      |
         +-------------------+ +---------------+ +-----------------+  +-------------------+
         | id (PK)           | | id (PK)       | | id (PK)         |  | id (PK)           |
         | session_id (FK)   | | session_id(FK)| | session_id(FK)  |  | session_id(FK)    |
         | role              | | scenario_time | | source_id       |  | trainee_id        |
         | display_name      | | event_type    | | degradation_type|  | decision_type     |
         | is_connected      | | actor_id      | | is_active       |  | selected_option   |
         +-------------------+ | payload (JSON)| | parameters(JSON)|  | info_seen (JSON)  |
                               +---------------+ +-----------------+  | later_outcome     |
                                                                      +-------------------+
```

## 2. Key Entities
- `scenarios`: Immutable scenario packages with learning objectives and world states.
- `sessions`: Live simulation exercise instances tracking time, seed, and state transitions.
- `participants`: Trainees and instructors attached to a session with roles and presence indicators.
- `events`: Append-only, sequenced event store with server-side visibility tags.
- `degradation_events`: Historical record of all live and scheduled injects with parameters.
- `decisions`: Comprehensive Decision Ledger recording decision-time information context and rationale.
- `messages`: Inter-trainee coordination log with sender role, recipient, and timestamps.
- `contradictions`: Tracked divergences between distinct sensor observations.
- `audit_events`: Tamper-evident cryptographic audit logs for evaluators.
