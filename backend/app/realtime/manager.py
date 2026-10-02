import json
import logging
from typing import Dict, List, Optional, Any
from fastapi import WebSocket, WebSocketDisconnect
from backend.app.schemas.enums import RoleEnum
from backend.app.schemas.contracts import EventSchema

logger = logging.getLogger("foglab.realtime.manager")

class ConnectionManager:
    def __init__(self):
        # session_id -> list of (WebSocket, role, participant_id)
        self.active_connections: Dict[str, List[Dict[str, Any]]] = {}

    async def connect(self, websocket: WebSocket, session_id: str, role: RoleEnum, participant_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        
        conn_entry = {
            "ws": websocket,
            "role": role,
            "participant_id": participant_id
        }
        self.active_connections[session_id].append(conn_entry)
        logger.info("Client %s joined session %s via WebSocket as %s", participant_id, session_id, role.value)

    def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id] = [
                c for c in self.active_connections[session_id] if c["ws"] != websocket
            ]
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]
        logger.info("Client disconnected from session %s", session_id)

    async def broadcast_to_session(self, session_id: str, data: Any, direct_role: Optional[RoleEnum] = None):
        if session_id not in self.active_connections:
            return

        is_event = isinstance(data, EventSchema)
        payload = data.model_dump(mode="json") if hasattr(data, "model_dump") else data

        for conn in list(self.active_connections[session_id]):
            ws: WebSocket = conn["ws"]
            client_role: RoleEnum = conn["role"]

            # Role filtering: if direct_role is specified, send only to matching role
            if direct_role is not None and client_role != direct_role:
                continue

            # If event, check server-side visibility
            if is_event:
                if client_role != RoleEnum.INSTRUCTOR and client_role not in data.visibility:
                    # Trainee not authorized to receive this event
                    continue

            try:
                msg_type = "EVENT" if is_event else "STATE_UPDATE"
                await ws.send_json({"type": msg_type, "payload": payload})
            except Exception as e:
                logger.warning("Failed to dispatch WebSocket message to %s: %s", conn["participant_id"], str(e))

ws_manager = ConnectionManager()
