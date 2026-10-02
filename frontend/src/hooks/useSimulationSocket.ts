import { useState, useEffect, useRef, useCallback } from 'react';
import { RoleEnum, SimulationEvent } from '../types';

interface UseSimulationSocketOptions {
  sessionId: string | null;
  role: RoleEnum;
  participantId?: string;
  onEvent?: (event: SimulationEvent) => void;
  onStateUpdate?: (state: any) => void;
}

export function useSimulationSocket({
  sessionId,
  role,
  participantId = 'GUEST',
  onEvent,
  onStateUpdate
}: UseSimulationSocketOptions) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestState, setLatestState] = useState<any>(null);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = useCallback(() => {
    if (!sessionId) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/sessions/${sessionId}?role=${role}&participant_id=${participantId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'INIT_STATE' || msg.type === 'STATE_UPDATE') {
          setLatestState(msg.payload);
          if (onStateUpdate) onStateUpdate(msg.payload);
        } else if (msg.type === 'EVENT') {
          const simEvt: SimulationEvent = msg.payload;
          setEvents((prev) => [...prev, simEvt]);
          if (onEvent) onEvent(simEvt);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Auto reconnect after 2 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 2000);
    };

    ws.onerror = (err) => {
      console.warn('WebSocket encountered error:', err);
      ws.close();
    };
  }, [sessionId, role, participantId, onEvent, onStateUpdate]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Periodic heartbeat / state sync poll fallback if idle
  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send('PING');
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  return {
    isConnected,
    latestState,
    events,
    reconnect: connect
  };
}
