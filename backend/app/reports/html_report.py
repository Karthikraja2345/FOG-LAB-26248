from backend.app.schemas.contracts import AARSummary

class HTMLReportGenerator:
    @staticmethod
    def generate(aar: AARSummary) -> str:
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AAR Report: {aar.scenario_title} | FOG-LAB 26248</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      background: #0a0e14;
      color: #f1f5f9;
      margin: 0;
      padding: 30px;
      line-height: 1.5;
    }}
    .header {{
      border-bottom: 2px solid #243044;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }}
    .badge {{
      background: rgba(6, 182, 212, 0.15);
      color: #06b6d4;
      padding: 3px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-weight: 700;
      font-family: monospace;
    }}
    .section {{
      background: #111722;
      border: 1px solid #243044;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 20px;
    }}
    h2 {{
      color: #06b6d4;
      font-size: 15px;
      border-bottom: 1px solid #243044;
      padding-bottom: 8px;
      margin-top: 0;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 10px;
    }}
    th, td {{
      padding: 10px;
      border: 1px solid #243044;
      text-align: left;
    }}
    th {{
      background: #192231;
      color: #94a3b8;
    }}
    .card {{
      background: #192231;
      border: 1px solid #3b82f6;
      border-radius: 4px;
      padding: 14px;
      margin-top: 12px;
    }}
    .disclaimer {{
      font-size: 11px;
      color: #94a3b8;
      background: rgba(245, 158, 11, 0.1);
      border-left: 3px solid #f59e0b;
      padding: 10px;
      margin-top: 25px;
    }}
  </style>
</head>
<body>
  <div class="header">
    <span class="badge">MINISTRY OF DEFENCE (MoD) • DEFENCE SERVICES STAFF COLLEGE</span>
    <h1 style="color: #fff; margin: 10px 0 5px 0;">AFTER-ACTION REVIEW (AAR): EVIDENCE-BACKED AUDIT</h1>
    <div style="font-size: 13px; color: #94a3b8;">
      Exercise: <strong>{aar.scenario_title}</strong> (ID: {aar.scenario_id}) • Session: {aar.session_id} • Seed: {aar.seed} • Duration: T+{aar.duration_elapsed_seconds}s
    </div>
  </div>

  <div class="section">
    <h2>1. EXERCISE SUMMARY & TRAINING METRICS</h2>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
      <div><strong>Total Decisions:</strong> {aar.total_decisions}</div>
      <div><strong>Avg Decision Latency:</strong> {aar.training_metrics.get('average_decision_latency_seconds', 'N/A')}s</div>
      <div><strong>Contradiction Awareness:</strong> {aar.training_metrics.get('contradiction_awareness_rate', 'N/A')}</div>
      <div><strong>Team Coordination Messages:</strong> {aar.training_metrics.get('team_coordination_message_count', 'N/A')}</div>
      <div><strong>Stale Data Usage:</strong> {aar.training_metrics.get('stale_information_usage_count', 'N/A')}</div>
      <div><strong>Composite Uncertainty Score:</strong> {aar.uncertainty_budget.total_uncertainty_score}</div>
    </div>
  </div>

  <div class="section">
    <h2>2. HINDSIGHT-SAFE DECISION LEDGER ({len(aar.decisions)} Decisions Recorded)</h2>
"""
        for d in aar.decisions:
            html += f"""
    <div class="card">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <strong>Decision: {d.decision_id} (Role: {d.role})</strong>
        <span>Timestamp: T+{d.timestamp}s | Confidence: {d.confidence}</span>
      </div>
      <div style="font-size: 12px; margin-bottom: 6px;">
        <strong>Action Selected:</strong> <span style="color: #06b6d4;">{d.selected_option}</span>
      </div>
      <div style="font-size: 12px; font-style: italic; color: #cbd5e1; margin-bottom: 10px;">
        Rationale: "{d.rationale}"
      </div>
      <div style="font-size: 11px; color: #94a3b8;">
        Available at decision time: {len(d.information_seen)} feeds | Delayed: {len(d.information_delayed)} | Missing: {len(d.information_missing)} | Conflicts: {len(d.conflicts_seen)}
      </div>
      <div style="font-size: 11px; color: #10b981; margin-top: 6px;">
        Post-Exercise Ground Truth Fact: {d.ground_truth_revelation}
      </div>
    </div>
"""

        html += f"""
  </div>

  <div class="section">
    <h2>3. INFORMATION ASYMMETRY AUDIT</h2>
    <table>
      <thead>
        <tr>
          <th>Source</th>
          <th>Role</th>
          <th>Delivery Status</th>
          <th>Latency Added</th>
          <th>Conflicted?</th>
        </tr>
      </thead>
      <tbody>
"""
        for entry in aar.asymmetry_matrix:
            html += f"""
        <tr>
          <td>{entry.source_name}</td>
          <td>{entry.role}</td>
          <td>{entry.delivery_status}</td>
          <td>{entry.latency_added_seconds}s</td>
          <td>{'YES' if entry.is_conflicted else 'NO'}</td>
        </tr>
"""
        html += f"""
      </tbody>
    </table>
  </div>

  <div class="disclaimer">
    <strong>INSTRUCTIONAL NOTICE:</strong> {aar.disclaimer}
  </div>
</body>
</html>
"""
        return html
