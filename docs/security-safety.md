# Security, Privacy & Safety-by-Design: FOG-LAB 26248

## 1. Safety Boundaries (Strict Defence Compliance)
In direct accordance with the problem statement guidelines from the Ministry of Defence (MoD) and Defence Services Staff College (DSSC):
- **Abstract Synthetic Scenarios**: All scenarios use synthetic grids (e.g. `GRID_7_BRAVO`, `SECTOR_2_DEFILE`), generic entity types (`Falcon-4 Drone`, `Sentinel Radar`), and fictitious tactical dilemmas.
- **Zero Weaponry or Targeting Integration**: The system contains NO real-world targeting algorithms, lethal payload calculations, ballistic metrics, or ordnance firing mechanisms.
- **Zero Cyber/EW Exploitation Procedures**: Degradation modes simulate the *functional communication consequences* of electronic interference (latency, dropout, packet loss, contradiction). It contains NO actual malicious cyber exploits, malware code, packet injection attack scripts, or radio-jamming hardware instructions.
- **Isolated Network Architecture**: The prototype runs strictly standalone and offline without connecting to operational defence networks or external cloud LLMs.

## 2. Server-Enforced Information Compartmentalization
- Ground truth is strictly segregated on the backend and never dispatched over WebSocket channels to trainee clients.
- Role-based visibility is enforced server-side: even if a client inspects browser developer tools, masked information is physically absent from network payloads.
- All session files, logs, and database records use standard sanitization.
