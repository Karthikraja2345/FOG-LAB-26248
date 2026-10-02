import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_aar_and_counterfactual_flow():
    # 1. Create and prepare session
    create_resp = client.post("/api/sessions", json={"scenario_id": "conflicting-picture", "seed": 424242})
    assert create_resp.status_code == 200
    session_id = create_resp.json()["session_id"]

    # 2. Join Trainee & Start
    client.post(f"/api/sessions/{session_id}/join?role=TEAM_LEAD&display_name=Col.%20Rajesh")
    client.post(f"/api/sessions/{session_id}/start")

    # 3. Inject degradation & tick
    client.post(
        f"/api/sessions/{session_id}/instructor/inject",
        json={
            "source_id": "SOURCE_B_RADAR",
            "target_roles": ["COORDINATION"],
            "degradation_type": "DELAY",
            "duration_seconds": 60,
            "intensity": 0.8,
            "parameters": {"delay_seconds": 40}
        }
    )
    client.post(f"/api/sessions/{session_id}/tick?delta=60.0")

    # 4. Submit Decision
    client.post(
        f"/api/sessions/{session_id}/decisions",
        json={
            "trainee_id": "TRAINEE-01",
            "role": "TEAM_LEAD",
            "decision_type": "ACTION_DISPATCH",
            "selected_option": "OPT_HOLD_AND_CROSS_VERIFY",
            "rationale": "Holding position due to radar delay and possible decoy spoofing.",
            "confidence": "HIGH"
        }
    )

    # 5. Fetch AAR Summary
    aar_resp = client.get(f"/api/sessions/{session_id}/aar")
    assert aar_resp.status_code == 200
    aar = aar_resp.json()
    assert aar["total_decisions"] == 1
    assert len(aar["decisions"]) == 1
    assert aar["decisions"][0]["selected_option"] == "OPT_HOLD_AND_CROSS_VERIFY"
    assert "DSSC" in aar["disclaimer"] or "Defence Services Staff College" in aar["disclaimer"]

    # 6. Test HTML Export
    html_resp = client.get(f"/api/sessions/{session_id}/aar/export?format=html")
    assert html_resp.status_code == 200
    assert "text/html" in html_resp.headers["content-type"]
    assert "AFTER-ACTION REVIEW" in html_resp.text
    assert "OPT_HOLD_AND_CROSS_VERIFY" in html_resp.text

    # 7. Test PDF Export
    pdf_resp = client.get(f"/api/sessions/{session_id}/aar/export?format=pdf")
    assert pdf_resp.status_code == 200
    assert "application/pdf" in pdf_resp.headers["content-type"]
    # PDF magic bytes
    assert pdf_resp.content.startswith(b"%PDF")

    # 8. Test Counterfactual Replay
    cf_resp = client.post(
        f"/api/sessions/{session_id}/counterfactual",
        json={
            "base_session_id": session_id,
            "variable_to_modify": "REMOVE_DELAY_SOURCE_B",
            "custom_parameters": {}
        }
    )
    assert cf_resp.status_code == 200
    cf = cf_resp.json()
    assert cf["modified_variable"] == "REMOVE_DELAY_SOURCE_B"
    assert "counterfactual zero-delay" in cf["variance_narrative"]
    assert len(cf["counterfactual_decision_latencies"]) > 0
