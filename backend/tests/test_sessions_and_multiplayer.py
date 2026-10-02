import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.schemas.enums import RoleEnum, DegradationType, DecisionType, ConfidenceLevel

client = TestClient(app)

def test_full_session_and_multiplayer_flow():
    # 1. List scenarios and select Conflicting Picture
    scen_resp = client.get("/api/scenarios")
    assert scen_resp.status_code == 200
    scenarios = scen_resp.json()
    assert len(scenarios) >= 3

    # 2. Create Session
    create_resp = client.post("/api/sessions", json={"scenario_id": "conflicting-picture", "seed": 424242})
    assert create_resp.status_code == 200
    session_data = create_resp.json()
    session_id = session_data["session_id"]
    assert session_data["status"] == "BRIEFING"

    # 3. Three Trainees Join
    lead_join = client.post(f"/api/sessions/{session_id}/join?role=TEAM_LEAD&display_name=Capt.%20Karthik")
    assert lead_join.status_code == 200
    assert lead_join.json()["role"] == "TEAM_LEAD"

    coord_join = client.post(f"/api/sessions/{session_id}/join?role=COORDINATION&display_name=Maj.%20Sharma")
    assert coord_join.status_code == 200

    info_join = client.post(f"/api/sessions/{session_id}/join?role=INFORMATION&display_name=Lt.%20Verma")
    assert info_join.status_code == 200

    # 4. Start Session
    start_resp = client.post(f"/api/sessions/{session_id}/start")
    assert start_resp.status_code == 200
    assert start_resp.json()["status"] == "ACTIVE"

    # 5. Instructor Injects Delay via Fog Composer
    inject_resp = client.post(
        f"/api/sessions/{session_id}/instructor/inject",
        json={
            "source_id": "SOURCE_B_RADAR",
            "target_roles": ["COORDINATION"],
            "degradation_type": "DELAY",
            "duration_seconds": 60,
            "intensity": 0.8,
            "parameters": {"delay_seconds": 45}
        }
    )
    assert inject_resp.status_code == 200
    inject_data = inject_resp.json()
    inject_id = inject_data["inject_id"]
    assert inject_data["degradation_type"] == "DELAY"

    # 6. Verify Asymmetry Matrix
    asym_resp = client.get(f"/api/sessions/{session_id}/instructor/asymmetry")
    assert asym_resp.status_code == 200
    matrix = asym_resp.json()
    assert len(matrix) > 0
    radar_coord = next(e for e in matrix if e["source_id"] == "SOURCE_B_RADAR" and e["role"] == "COORDINATION")
    assert radar_coord["delivery_status"] == "DELAYED"

    # 7. Team Message Dispatch
    msg_resp = client.post(
        f"/api/sessions/{session_id}/messages",
        json={
            "sender_id": lead_join.json()["participant_id"],
            "sender_role": "TEAM_LEAD",
            "recipient_role": None,
            "content": "All stations: Radar telemetry is lagging. Report visual contacts immediately."
        }
    )
    assert msg_resp.status_code == 200
    assert "Radar telemetry is lagging" in msg_resp.json()["content"]

    # 8. Trainee Submits Decision
    dec_resp = client.post(
        f"/api/sessions/{session_id}/decisions",
        json={
            "trainee_id": lead_join.json()["participant_id"],
            "role": "TEAM_LEAD",
            "decision_type": "ACTION_DISPATCH",
            "selected_option": "OPT_HOLD_AND_CROSS_VERIFY",
            "rationale": "Holding bridgehead while Signals unit validates decoy status.",
            "confidence": "HIGH"
        }
    )
    assert dec_resp.status_code == 200
    dec_card = dec_resp.json()
    assert dec_card["selected_option"] == "OPT_HOLD_AND_CROSS_VERIFY"
    assert dec_card["later_outcome"]["outcome_state"] == "DECOY_EXPOSED_ZERO_CASUALTIES"

    # 9. Recover Delayed Source
    recov_resp = client.post(f"/api/sessions/{session_id}/instructor/recover/{inject_id}")
    assert recov_resp.status_code == 200
    assert recov_resp.json()["recovered"] is True

    # 10. Check Timeline
    timeline_resp = client.get(f"/api/sessions/{session_id}/timeline")
    assert timeline_resp.status_code == 200
    timeline = timeline_resp.json()
    assert len(timeline) >= 2 # SESSION_STARTED, DEGRADATION_STARTED, etc.
