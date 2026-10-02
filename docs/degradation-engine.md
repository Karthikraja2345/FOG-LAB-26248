# Communication Degradation Engine: FOG-LAB 26248

## 1. Core Principles
The degradation engine sits directly between the Scenario Engine (ground truth) and the Realtime WebSocket Manager (trainee perceptions). It implements a non-destructive pipeline: **ground truth events are never altered or destroyed; only their delivery timing, visibility, payload completeness, and consistency are transformed**.

## 2. Supported Degradation Modes

| Mode | Mathematical / Functional Model | Pedagogical Training Impact |
|---|---|---|
| **Delay** | $T_{\text{deliver}} = T_{\text{gen}} + \Delta_{\text{delay}} + \mathcal{N}(0, \sigma^2)$ | Forces commanders to decide with unconfirmed intelligence |
| **Dropout** | $\mathbb{I}_{\text{visible}}(t) = 0$ for $t \in [t_{\text{start}}, t_{\text{start}} + D]$ | Induces communication silence; tests backup operating procedures |
| **Intermittent** | $\mathbb{I}_{\text{visible}}(t) = \text{SquareWave}(t, \text{period}, \text{duty\_cycle})$ | Tests update discipline and data re-assembly |
| **Contradiction** | Delivers report $R_A$ with value $V_1$ to Role A and report $R_B$ with value $V_2$ to Role B ($V_1 \neq V_2$) | Forces cross-source validation and team cross-talk |
| **Staleness** | Observation value frozen at $t_{\text{freeze}}$; age indicator increments steadily | Tests temporal awareness and awareness of decaying data validity |
| **Partial Payload** | $P_{\text{delivered}} = P_{\text{original}} \setminus \{ \text{masked\_fields} \}$ | Tests restrained inference rather than unwarranted assumption |
| **Recovery** | Restores delivery pipeline; optionally flushes buffered queue or delivers correction | Evaluates how teams update prior hypotheses |

## 3. Communication Fog Composer Workflow
1. **Target Selection**: Select source/feed (`SOURCE_A`, `SOURCE_B`, `COMM_LINK_SATCOM`) and target roles (`TEAM_LEAD`, `COORDINATION`, `INFORMATION`).
2. **Transform Configuration**: Choose degradation primitive, duration ($D$), and intensity ($I \in [0.0, 1.0]$).
3. **Impact Preview**: Previews affected clients and feed changes before commit.
4. **Execution & Event Broadcast**: Injects degradation event, begins countdown timer, and notifies connected clients via WebSocket.
5. **Manual / Auto Recovery**: Instructor can terminate or restore the channel at any point.
