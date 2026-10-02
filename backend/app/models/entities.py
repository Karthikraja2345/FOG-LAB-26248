import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class ScenarioModel(Base):
    __tablename__ = "scenarios"

    id = Column(String(64), primary_key=True, index=True)
    version = Column(String(32), default="1.0.0")
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    data_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    sessions = relationship("SessionModel", back_populates="scenario")

class SessionModel(Base):
    __tablename__ = "sessions"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    session_code = Column(String(32), unique=True, index=True, nullable=False)
    scenario_id = Column(String(64), ForeignKey("scenarios.id"), nullable=False)
    status = Column(String(32), default="BRIEFING", index=True)
    seed = Column(Integer, default=424242)
    scenario_time = Column(Float, default=0.0)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    scenario = relationship("ScenarioModel", back_populates="sessions")
    participants = relationship("ParticipantModel", back_populates="session", cascade="all, delete-orphan")
    events = relationship("EventModel", back_populates="session", cascade="all, delete-orphan")
    degradations = relationship("DegradationEventModel", back_populates="session", cascade="all, delete-orphan")
    decisions = relationship("DecisionModel", back_populates="session", cascade="all, delete-orphan")
    messages = relationship("MessageModel", back_populates="session", cascade="all, delete-orphan")
    contradictions = relationship("ContradictionModel", back_populates="session", cascade="all, delete-orphan")

class ParticipantModel(Base):
    __tablename__ = "participants"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    session_id = Column(String(64), ForeignKey("sessions.id"), nullable=False, index=True)
    role = Column(String(32), nullable=False)
    display_name = Column(String(128), nullable=False)
    is_connected = Column(Boolean, default=True)
    joined_at = Column(DateTime, default=utc_now)
    last_seen = Column(DateTime, default=utc_now)

    session = relationship("SessionModel", back_populates="participants")

class EventModel(Base):
    __tablename__ = "events"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    session_id = Column(String(64), ForeignKey("sessions.id"), nullable=False, index=True)
    scenario_time = Column(Float, nullable=False)
    server_time = Column(DateTime, default=utc_now)
    event_type = Column(String(64), nullable=False, index=True)
    actor_id = Column(String(64), default="SYSTEM")
    role = Column(String(32), default="INSTRUCTOR")
    sequence_number = Column(Integer, index=True)
    visibility = Column(JSON, default=list)  # list of allowed roles
    payload = Column(JSON, default=dict)

    session = relationship("SessionModel", back_populates="events")

class DegradationEventModel(Base):
    __tablename__ = "degradation_events"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    session_id = Column(String(64), ForeignKey("sessions.id"), nullable=False, index=True)
    degradation_type = Column(String(32), nullable=False)
    source_id = Column(String(64), nullable=False)
    target_roles = Column(JSON, default=list)
    duration_seconds = Column(Integer, default=60)
    intensity = Column(Float, default=1.0)
    started_at_scenario_time = Column(Float, nullable=False)
    ended_at_scenario_time = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    parameters = Column(JSON, default=dict)

    session = relationship("SessionModel", back_populates="degradations")

class DecisionModel(Base):
    __tablename__ = "decisions"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    session_id = Column(String(64), ForeignKey("sessions.id"), nullable=False, index=True)
    trainee_id = Column(String(64), nullable=False)
    role = Column(String(32), nullable=False)
    scenario_time = Column(Float, nullable=False)
    server_time = Column(DateTime, default=utc_now)
    decision_type = Column(String(64), nullable=False)
    selected_option = Column(String(128), nullable=False)
    rationale = Column(Text, default="")
    confidence = Column(String(16), default="MEDIUM")
    info_seen = Column(JSON, default=list)
    info_delayed = Column(JSON, default=list)
    info_missing = Column(JSON, default=list)
    conflicts_seen = Column(JSON, default=list)
    later_outcome = Column(JSON, nullable=True)

    session = relationship("SessionModel", back_populates="decisions")

class MessageModel(Base):
    __tablename__ = "messages"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    session_id = Column(String(64), ForeignKey("sessions.id"), nullable=False, index=True)
    sender_id = Column(String(64), nullable=False)
    sender_role = Column(String(32), nullable=False)
    recipient_role = Column(String(32), nullable=True) # None = all
    content = Column(Text, nullable=False)
    scenario_time = Column(Float, nullable=False)
    server_time = Column(DateTime, default=utc_now)
    acknowledged_by = Column(JSON, default=list)

    session = relationship("SessionModel", back_populates="messages")

class ContradictionModel(Base):
    __tablename__ = "contradictions"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    session_id = Column(String(64), ForeignKey("sessions.id"), nullable=False, index=True)
    conflict_code = Column(String(32), index=True)
    source_a = Column(String(64), nullable=False)
    source_b = Column(String(64), nullable=False)
    topic = Column(String(128), nullable=False)
    value_a = Column(String(255), nullable=False)
    value_b = Column(String(255), nullable=False)
    detected_at = Column(Float, nullable=False)
    resolved_at = Column(Float, nullable=True)
    resolution_state = Column(String(64), default="UNRESOLVED")

    session = relationship("SessionModel", back_populates="contradictions")

class AuditEventModel(Base):
    __tablename__ = "audit_events"

    id = Column(String(64), primary_key=True, default=generate_uuid, index=True)
    session_id = Column(String(64), nullable=True, index=True)
    actor = Column(String(64), nullable=False)
    action = Column(String(64), nullable=False)
    object_type = Column(String(64), nullable=False)
    object_id = Column(String(64), nullable=False)
    timestamp = Column(DateTime, default=utc_now)
    hash_signature = Column(String(128), nullable=False)
