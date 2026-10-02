# Counterfactual Replay Engine: FOG-LAB 26248

## 1. Concept: Controlled Training Counterfactuals
In military staff training, commanders frequently debate:
*"What would have happened if the radar data link had not been delayed by 60 seconds?"*

FOG-LAB implements a **Controlled Counterfactual Engine**:
1. Takes an existing exercise run (Base Run).
2. Clones the exact scenario package and seed.
3. Modifies exactly **one** independent degradation parameter (e.g. `delay_seconds = 0` for Source B).
4. Re-simulates the scenario under identical deterministic conditions.
5. Re-evaluates baseline decisions against the altered information environment.
6. Computes the **Causal Sensitivity Delta**:
   - Change in information arrival time.
   - Reduction or expansion in decision latency.
   - Variation in tactical outcome.

## 2. Pedagogical Boundary & Disclaimers
The platform explicitly prints and embeds this mandatory notice on all counterfactual screens and exports:
> **NOTE:** Counterfactual replay is a controlled training exercise in causal reasoning. It illustrates system sensitivity to communication degradation parameters and does not represent an assertion of real-world operational certainty.
