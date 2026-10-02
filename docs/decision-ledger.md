# Decision Ledger & Context Capture Specification: FOG-LAB 26248

## 1. Philosophical Principle: Hindsight Separation
In conventional military training and AARs, commanders are frequently evaluated using "hindsight contamination"—judges know the true enemy strength, position, or decoy status, and unconsciously assume the commander should have deduced it.

FOG-LAB enforces an immutable **Decision Ledger** where every decision records:
1. `decision_id`: Globally unique identifier.
2. `timestamp`: Scenario-relative seconds and UTC clock.
3. `trainee_id` & `role`: The authorized commander.
4. `decision_type`: Dispatch, Hold, Info Request, Escalate, Recon.
5. `selected_option`: The scenario-defined course of action.
6. `rationale`: Trainee's documented justification.
7. `confidence`: Self-assessed subjective confidence (`LOW`, `MEDIUM`, `HIGH`).
8. **Decision-Time Information Snapshot**:
   - `information_seen`: Exactly which sensor feeds had arrived at the trainee's terminal.
   - `information_delayed`: Which feeds were in flight or delayed.
   - `information_missing`: Which channels were dropped or offline.
   - `conflicts_seen`: Which active contradictions were flagged on their interface.
9. `later_outcome`: Stochastic post-exercise result linked after the run.
10. `ground_truth_revelation`: The objective fact of what was physically present.

## 2. Decision Context Card
When opened in the Instructor Control Room or AAR Dashboard, the Decision Context Card reveals the exact information boundaries of the moment, creating an audit-ready, defensible training record.
