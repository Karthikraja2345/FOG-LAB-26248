import uuid
import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session as DBSession

from backend.app.schemas.enums import (
    ScenarioState, RoleEnum, EventType, DeliveryStatus, DegradationType, DecisionType
)
from backend.app.schemas.contracts import (
    SessionResponse, ParticipantSchema, DegradationInjectRequest,
    DegradationActiveItem, DecisionSubmitRequest, DecisionContextCardSchema,
    MessageSendRequest, MessageRecordSchema, AsymmetryMatrixEntry,
    ContradictionItem, UncertaintyBudget, EventSchema
)
from backend.app.scenario.loader import scenario_loader
from backend.app.scenario.engine import ScenarioSimulationEngine
from backend.app.models.entities import (
    SessionModel, ParticipantModel, EventModel, DecisionModel,
    DegradationEventModel, MessageModel, ContradictionModel, AuditEventModel
)

logger = logging.getLogger("foglab.service.session")

class LiveSessionInstance:
    def __init__(self, session_id: str, session_code: str, engine: ScenarioSimulationEngine, db_session_factory):
        self.session_id = session_id
        self.session_code = session_code
        self.engine = engine
        self.db_session_factory = db_session_factory
        self.participants: Dict[str, ParticipantSchema] = {} # participant_id -> ParticipantSchema
        self.messages: List[MessageRecordSchema] = []
        self.is_running: bool = False
        self._ticker_task: Optional[asyncio.Task] = None
        self._broadcaster: Optional[Any] = None

    def set_broadcaster(self, broadcaster):
        self._broadcaster = broadcaster

    async def broadcast_event(self, event: EventSchema):
        if self._broadcaster:
            await self._broadcaster(self.session_id, event)

    async def broadcast_state(self):
        if self._broadcaster:
            # Trigger state update push to all connected roles
            for role in [RoleEnum.INSTRUCTOR, RoleEnum.TEAM_LEAD, RoleEnum.COORDINATION, RoleEnum.INFORMATION]:
                view = self.get_role_view(role)
                await self._broadcaster(self.session_id, view, direct_role=role)

    def get_role_view(self, role: RoleEnum) -> Dict[str, Any]:
        if role == RoleEnum.INSTRUCTOR:
            view = self.engine.get_instructor_view()
            view["session_id"] = self.session_id
            view["session_code"] = self.session_code
            view["participants"] = [p.model_dump() for p in self.participants.values()]
            view["messages"] = [m.model_dump() for m in self.messages]
            return view
        else:
            view = self.engine.get_trainee_view(role)
            view["session_id"] = self.session_id
            view["session_code"] = self.session_code
            view["participants"] = [p.model_dump() for p in self.participants.values()]
            # Filter messages visible to this role (broadcast or directed to this role)
            view["messages"] = [
                m.model_dump() for m in self.messages
                if m.recipient_role is None or m.recipient_role == role or m.sender_role == role
            ]
            return view

class SessionService:
    def __init__(self):
        self._live_sessions: Dict[str, LiveSessionInstance] = {}
        self._ws_broadcaster = None

    def register_broadcaster(self, broadcaster):
        self._ws_broadcaster = broadcaster
        for instance in self._live_sessions.values():
            instance.set_broadcaster(broadcaster)

    def create_session(
        self,
        db: DBSession,
        scenario_id: str,
        seed: Optional[int] = None,
        session_name: Optional[str] = None
    ) -> SessionResponse:
        pkg = scenario_loader.get_scenario(scenario_id)
        if not pkg:
            raise ValueError(f"Scenario '{scenario_id}' not found.")

        actual_seed = seed if seed is not None else pkg.seed
        session_id = f"SESS-{str(uuid.uuid4())[:8]}"
        session_code = f"FOG-{str(uuid.uuid4())[:4].upper()}"

        # Initialize simulation engine
        sim_engine = ScenarioSimulationEngine(pkg, seed=actual_seed)

        # Create live instance
        instance = LiveSessionInstance(
            session_id=session_id,
            session_code=session_code,
            engine=sim_engine,
            db_session_factory=None
        )
        if self._ws_broadcaster:
            instance.set_broadcaster(self._ws_broadcaster)

        self._live_sessions[session_id] = instance

        # Persist to database
        db_session = SessionModel(
            id=session_id,
            session_code=session_code,
            scenario_id=pkg.scenario_id,
            status=ScenarioState.BRIEFING.value,
            seed=actual_seed,
            scenario_time=0.0
        )
        db.add(db_session)
        db.commit()

        logger.info("Created session %s (Code: %s) for scenario %s", session_id, session_code, scenario_id)
        return self._to_response(instance, db_session)

    def get_live_session(self, session_id: str) -> Optional[LiveSessionInstance]:
        return self._live_sessions.get(session_id)

    def get_session_by_code(self, session_code: str) -> Optional[LiveSessionInstance]:
        for inst in self._live_sessions.values():
            if inst.session_code.upper() == session_code.upper():
                return inst
        return None

    def join_participant(
        self,
        db: DBSession,
        session_id: str,
        role: RoleEnum,
        display_name: str
    ) -> ParticipantSchema:
        instance = self.get_live_session(session_id)
        if not instance:
            raise ValueError(f"Active session {session_id} not found.")

        # Find existing participant for this role or create new
        existing_id = None
        for pid, p in instance.participants.items():
            if p.role == role:
                existing_id = pid
                break

        pid = existing_id if existing_id else f"USR-{str(uuid.uuid4())[:6]}"
        participant = ParticipantSchema(
            participant_id=pid,
            session_id=session_id,
            role=role,
            display_name=display_name,
            is_connected=True,
            joined_at=datetime.now(timezone.utc),
            last_seen=datetime.now(timezone.utc)
        )
        instance.participants[pid] = participant

        # Persist / update in database
        db_p = db.query(ParticipantModel).filter_by(id=pid).first()
        if not db_p:
            db_p = ParticipantModel(
                id=pid,
                session_id=session_id,
                role=role.value,
                display_name=display_name,
                is_connected=True
            )
            db.add(db_p)
        else:
            db_p.is_connected = True
            db_p.last_seen = datetime.now(timezone.utc)
        db.commit()

        logger.info("Participant %s joined session %s as %s", display_name, session_id, role.value)
        return participant

    async def start_session(self, db: DBSession, session_id: str) -> SessionResponse:
        instance = self.get_live_session(session_id)
        if not instance:
            raise ValueError(f"Active session {session_id} not found.")

        if instance.engine.state_machine.current_state == ScenarioState.BRIEFING:
            evt = instance.engine.start_simulation()
            instance.is_running = True

            # Update DB
            db_session = db.query(SessionModel).filter_by(id=session_id).first()
            if db_session:
                db_session.status = instance.engine.state_machine.current_state.value
                db_session.start_time = datetime.now(timezone.utc)
                db.commit()

            await instance.broadcast_event(evt)
            await instance.broadcast_state()

        db_session = db.query(SessionModel).filter_by(id=session_id).first()
        return self._to_response(instance, db_session)

    async def pause_session(self, db: DBSession, session_id: str) -> SessionResponse:
        instance = self.get_live_session(session_id)
        if not instance:
            raise ValueError(f"Active session {session_id} not found.")

        instance.is_running = False
        evt = instance.engine.emit_event(
            EventType.SESSION_PAUSED, "INSTRUCTOR", RoleEnum.INSTRUCTOR, {"scenario_time": instance.engine.scenario_time}
        )
        await instance.broadcast_event(evt)
        await instance.broadcast_state()

        db_session = db.query(SessionModel).filter_by(id=session_id).first()
        return self._to_response(instance, db_session)

    async def resume_session(self, db: DBSession, session_id: str) -> SessionResponse:
        instance = self.get_live_session(session_id)
        if not instance:
            raise ValueError(f"Active session {session_id} not found.")

        instance.is_running = True
        evt = instance.engine.emit_event(
            EventType.SESSION_RESUMED, "INSTRUCTOR", RoleEnum.INSTRUCTOR, {"scenario_time": instance.engine.scenario_time}
        )
        await instance.broadcast_event(evt)
        await instance.broadcast_state()

        db_session = db.query(SessionModel).filter_by(id=session_id).first()
        return self._to_response(instance, db_session)

    async def end_session(self, db: DBSession, session_id: str) -> SessionResponse:
        instance = self.get_live_session(session_id)
        if not instance:
            raise ValueError(f"Active session {session_id} not found.")

        instance.is_running = False
        if instance.engine.state_machine.can_transition_to(ScenarioState.RESOLUTION):
            instance.engine.state_machine.transition_to(ScenarioState.RESOLUTION, instance.engine.scenario_time, "Instructor ended session")
        if instance.engine.state_machine.can_transition_to(ScenarioState.AAR_READY):
            instance.engine.state_machine.transition_to(ScenarioState.AAR_READY, instance.engine.scenario_time, "AAR compiled")

        evt = instance.engine.emit_event(
            EventType.SESSION_ENDED, "INSTRUCTOR", RoleEnum.INSTRUCTOR, {"scenario_time": instance.engine.scenario_time}
        )
        db_session = db.query(SessionModel).filter_by(id=session_id).first()
        if db_session:
            db_session.status = instance.engine.state_machine.current_state.value
            db_session.end_time = datetime.now(timezone.utc)
            db.commit()

        await instance.broadcast_event(evt)
        await instance.broadcast_state()
        return self._to_response(instance, db_session)

    async def tick_simulation(self, db: DBSession, session_id: str, delta_seconds: float = 1.0) -> List[EventSchema]:
        instance = self.get_live_session(session_id)
        if not instance or not instance.is_running:
            return []

        emitted = instance.engine.tick(delta_seconds=delta_seconds)

        # Update DB scenario time & state
        db_session = db.query(SessionModel).filter_by(id=session_id).first()
        if db_session:
            db_session.scenario_time = instance.engine.scenario_time
            db_session.status = instance.engine.state_machine.current_state.value
            db.commit()

        # Persist newly emitted events
        for evt in emitted:
            db_evt = EventModel(
                id=evt.event_id,
                session_id=session_id,
                scenario_time=evt.scenario_time,
                server_time=evt.server_time,
                event_type=evt.event_type.value,
                actor_id=evt.actor_id,
                role=evt.role.value,
                sequence_number=evt.sequence_number,
                visibility=[r.value for r in evt.visibility],
                payload=evt.payload
            )
            db.add(db_evt)
            await instance.broadcast_event(evt)

        db.commit()
        await instance.broadcast_state()
        return emitted

    async def inject_degradation(
        self,
        db: DBSession,
        session_id: str,
        request: DegradationInjectRequest,
        actor_id: str = "INSTRUCTOR"
    ) -> DegradationActiveItem:
        instance = self.get_live_session(session_id)
        if not instance:
            raise ValueError(f"Active session {session_id} not found.")

        active_item, evt = instance.engine.inject_live_degradation(request, actor_id=actor_id)

        # Persist to database
        db_deg = DegradationEventModel(
            id=active_item.inject_id,
            session_id=session_id,
            degradation_type=active_item.degradation_type.value,
            source_id=active_item.source_id,
            target_roles=[r.value for r in active_item.target_roles],
            duration_seconds=active_item.duration_seconds,
            intensity=active_item.intensity,
            started_at_scenario_time=active_item.started_at_scenario_time,
            is_active=True,
            parameters=active_item.parameters
        )
        db.add(db_deg)
        db.commit()

        await instance.broadcast_event(evt)
        await instance.broadcast_state()
        return active_item

    async def recover_degradation(
        self,
        db: DBSession,
        session_id: str,
        inject_id: str,
        actor_id: str = "INSTRUCTOR"
    ) -> bool:
        instance = self.get_live_session(session_id)
        if not instance:
            raise ValueError(f"Active session {session_id} not found.")

        evt = instance.engine.recover_live_degradation(inject_id, actor_id=actor_id)
        if evt:
            # Update DB
            db_deg = db.query(DegradationEventModel).filter_by(id=inject_id).first()
            if db_deg:
                db_deg.is_active = False
                db_deg.ended_at_scenario_time = instance.engine.scenario_time
                db.commit()

            await instance.broadcast_event(evt)
            await instance.broadcast_state()
            return True
        return False

    async def record_decision(
        self,
        db: DBSession,
        session_id: str,
        request: DecisionSubmitRequest
    ) -> DecisionContextCardSchema:
        instance = self.get_live_session(session_id)
        if not instance:
            raise ValueError(f"Active session {session_id} not found.")

        card = instance.engine.capture_decision(request)

        # Persist decision to DB
        db_dec = DecisionModel(
            id=card.decision_id,
            session_id=session_id,
            trainee_id=card.trainee_id,
            role=card.role.value,
            scenario_time=card.timestamp,
            decision_type=card.decision_type.value,
            selected_option=card.selected_option,
            rationale=card.rationale,
            confidence=card.confidence.value,
            info_seen=card.information_seen,
            info_delayed=card.information_delayed,
            info_missing=card.information_missing,
            conflicts_seen=card.conflicts_seen,
            later_outcome=card.later_outcome
        )
        db.add(db_dec)
        db.commit()

        await instance.broadcast_state()
        return card

    async def record_message(
        self,
        db: DBSession,
        session_id: str,
        request: MessageSendRequest
    ) -> MessageRecordSchema:
        instance = self.get_live_session(session_id)
        if not instance:
            raise ValueError(f"Active session {session_id} not found.")

        msg = MessageRecordSchema(
            message_id=f"MSG-{len(instance.messages) + 1:04d}",
            session_id=session_id,
            sender_id=request.sender_id,
            sender_role=request.sender_role,
            recipient_role=request.recipient_role,
            content=request.content,
            scenario_time=round(instance.engine.scenario_time, 1),
            timestamp_utc=datetime.now(timezone.utc),
            acknowledged_by=[]
        )
        instance.messages.append(msg)

        # Persist to DB
        db_msg = MessageModel(
            id=msg.message_id,
            session_id=session_id,
            sender_id=msg.sender_id,
            sender_role=msg.sender_role.value,
            recipient_role=msg.recipient_role.value if msg.recipient_role else None,
            content=msg.content,
            scenario_time=msg.scenario_time
        )
        db.add(db_msg)
        db.commit()

        evt = instance.engine.emit_event(
            EventType.MESSAGE_SENT,
            request.sender_id,
            request.sender_role,
            {"message_id": msg.message_id, "content": msg.content, "recipient": msg.recipient_role.value if msg.recipient_role else "ALL"}
        )
        await instance.broadcast_event(evt)
        await instance.broadcast_state()
        return msg

    def _to_response(self, instance: LiveSessionInstance, db_session: Optional[SessionModel]) -> SessionResponse:
        return SessionResponse(
            session_id=instance.session_id,
            session_code=instance.session_code,
            scenario_id=instance.engine.package.scenario_id,
            scenario_title=instance.engine.package.title,
            status=instance.engine.state_machine.current_state,
            seed=instance.engine.seed,
            scenario_time=round(instance.engine.scenario_time, 1),
            duration_seconds=instance.engine.package.duration_seconds,
            participants=list(instance.participants.values()),
            active_degradations_count=len(instance.engine.degradation_engine.active_injects),
            created_at=db_session.created_at if db_session else datetime.now(timezone.utc)
        )

session_service = SessionService()
