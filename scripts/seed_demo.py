"""
Demo Seed Script: FOG-LAB 26248
Pre-populates sample exercise run with Conflicting Picture scenario,
multi-role participants, injected delay & contradiction, decisions, and AAR records.
"""

import sys
import os

# Add root directory to pythonpath
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.database import engine, Base, SessionLocal
from backend.app.schemas.enums import RoleEnum, DegradationType, DecisionType, ConfidenceLevel
from backend.app.schemas.contracts import (
    DegradationInjectRequest, DecisionSubmitRequest, MessageSendRequest
)
from backend.app.services.session_service import session_service
from backend.app.scenario.loader import scenario_loader

def seed_demo_data():
    print("=" * 60)
    print("FOG-LAB 26248: Initializing Demo Database and Scenarios")
    print("=" * 60)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Load scenarios
    scenarios = scenario_loader.load_all(reload=True)
    print(f"[OK] Loaded {len(scenarios)} Scenario Packages:")
    for s_id, s_pkg in scenarios.items():
        print(f"    * {s_id}: {s_pkg.title} ({len(s_pkg.roles)} roles, {len(s_pkg.information_sources)} feeds)")

    # 2. Create Primary Demo Session (Conflicting Picture)
    print("\n[+] Creating Primary Demo Session ('conflicting-picture')...")
    session = session_service.create_session(
        db=db,
        scenario_id="conflicting-picture",
        seed=424242,
        session_name="DSSC Staff College Demonstration"
    )
    session_id = session.session_id
    print(f"    - Session ID: {session_id} (Code: {session.session_code})")

    # 3. Join Participants
    print("\n[+] Joining 3 Standard Sub-Unit Roles...")
    lead = session_service.join_participant(db, session_id, RoleEnum.TEAM_LEAD, "Capt. Karthik (Team Lead)")
    coord = session_service.join_participant(db, session_id, RoleEnum.COORDINATION, "Maj. Sharma (Operations Lead)")
    info = session_service.join_participant(db, session_id, RoleEnum.INFORMATION, "Lt. Verma (EW/Signals Specialist)")
    print("    - Team Lead, Coordination, and Information roles registered.")

    # 4. Start Session
    print("\n[+] Activating simulation...")
    import asyncio

    async def run_sim_steps():
        await session_service.start_session(db, session_id)

        # Tick 40 seconds
        await session_service.tick_simulation(db, session_id, delta_seconds=40.0)

        # Injected Delay on Tactical Radar (Source B)
        print("[+] Injecting live delay into Sentinel Tactical Radar (Source B)...")
        await session_service.inject_degradation(
            db=db,
            session_id=session_id,
            request=DegradationInjectRequest(
                source_id="SOURCE_B_RADAR",
                target_roles=[RoleEnum.COORDINATION],
                degradation_type=DegradationType.DELAY,
                duration_seconds=90,
                intensity=0.8,
                parameters={"delay_seconds": 60}
            )
        )

        # Tick to T=75s
        await session_service.tick_simulation(db, session_id, delta_seconds=35.0)

        # Send Team Messages
        print("[+] Emitting inter-trainee coordination messages...")
        await session_service.record_message(
            db=db,
            session_id=session_id,
            request=MessageSendRequest(
                sender_id=lead.participant_id,
                sender_role=RoleEnum.TEAM_LEAD,
                recipient_role=None,
                content="All stations: Eagle-1 optical drone reports 6 armored vehicles advancing along Axis Bravo. Verify with Radar."
            )
        )
        await session_service.record_message(
            db=db,
            session_id=session_id,
            request=MessageSendRequest(
                sender_id=info.participant_id,
                sender_role=RoleEnum.INFORMATION,
                recipient_role=RoleEnum.TEAM_LEAD,
                content="Caution Team Lead: Ground Radar is lagging, but Doppler return shows low-mass reflectors. Possible false decoys!"
            )
        )

        # Tick to T=120s (Decision Point triggered)
        await session_service.tick_simulation(db, session_id, delta_seconds=45.0)

        # Record Commander Decision
        print("[+] Recording Hindsight-Safe Decision from Team Lead...")
        await session_service.record_decision(
            db=db,
            session_id=session_id,
            request=DecisionSubmitRequest(
                trainee_id=lead.participant_id,
                role=RoleEnum.TEAM_LEAD,
                decision_type=DecisionType.ACTION_DISPATCH,
                selected_option="OPT_HOLD_AND_CROSS_VERIFY",
                rationale="Optical feed indicates armored assault, but Signals unit flagged Doppler anomaly and OP Echo reported decoy transmitters. Holding bridgehead to prevent ambush.",
                confidence=ConfidenceLevel.HIGH
            )
        )

        # Tick to recovery
        await session_service.tick_simulation(db, session_id, delta_seconds=30.0)

    asyncio.run(run_sim_steps())

    db.close()
    print("\n" + "=" * 60)
    print("DEMO DATA SEEDING COMPLETE: Ready for live demonstration.")
    print("=" * 60)

if __name__ == "__main__":
    seed_demo_data()
