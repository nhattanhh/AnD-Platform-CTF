import asyncio
import logging
import json
from datetime import datetime
from typing import Dict, Set, Any
from fastapi import WebSocket
import uuid

logger = logging.getLogger(__name__)


class EventManager:
    """
    Singleton manager for WebSocket connections and event broadcasting.
    Stores connections by game_id for targeted broadcasts.
    """
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        # Connections by game_id: {game_id: {websocket1, websocket2, ...}}
        self._game_connections: Dict[str, Set[WebSocket]] = {}
        # Global connections (receive all events)
        self._global_connections: Set[WebSocket] = set()
        # Lock for thread-safe operations
        self._lock = asyncio.Lock()
        self._initialized = True
        
        logger.info("EventManager initialized")
    
    async def connect(self, websocket: WebSocket, game_id: str | None = None):
        """
        Register a WebSocket connection.
        
        Args:
            websocket: The WebSocket connection
            game_id: Optional game ID to subscribe to specific game events.
                    If None, subscribes to all events.
        """
        await websocket.accept()
        
        async with self._lock:
            if game_id:
                if game_id not in self._game_connections:
                    self._game_connections[game_id] = set()
                self._game_connections[game_id].add(websocket)
                logger.info(f"WebSocket connected to game {game_id}")
            else:
                self._global_connections.add(websocket)
                logger.info("WebSocket connected globally")
    
    async def disconnect(self, websocket: WebSocket, game_id: str | None = None):
        """
        Unregister a WebSocket connection.
        """
        async with self._lock:
            if game_id and game_id in self._game_connections:
                self._game_connections[game_id].discard(websocket)
                if not self._game_connections[game_id]:
                    del self._game_connections[game_id]
                logger.info(f"WebSocket disconnected from game {game_id}")
            else:
                self._global_connections.discard(websocket)
                logger.info("WebSocket disconnected globally")
    
    async def _send_to_websocket(self, websocket: WebSocket, data: dict):
        """Send data to a single websocket, handling errors."""
        try:
            await websocket.send_json(data)
        except Exception as e:
            logger.warning(f"Failed to send to websocket: {e}")
    
    async def broadcast_to_game(self, game_id: str, data: dict):
        """
        Broadcast event to all connections subscribed to a specific game.
        Also broadcasts to global connections.
        """
        data["timestamp"] = datetime.utcnow().isoformat()
        
        tasks = []
        
        async with self._lock:
            if game_id in self._game_connections:
                for ws in self._game_connections[game_id]:
                    tasks.append(self._send_to_websocket(ws, data))
            
            for ws in self._global_connections:
                tasks.append(self._send_to_websocket(ws, data))
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
            logger.debug(f"Broadcasted event to game {game_id}: {data.get('event_type')}")
    
    async def broadcast_all(self, data: dict):
        """Broadcast event to ALL connections."""
        data["timestamp"] = datetime.utcnow().isoformat()
        
        tasks = []
        
        async with self._lock:
            for game_connections in self._game_connections.values():
                for ws in game_connections:
                    tasks.append(self._send_to_websocket(ws, data))
            
            for ws in self._global_connections:
                tasks.append(self._send_to_websocket(ws, data))
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
            logger.debug(f"Broadcasted event to all: {data.get('event_type')}")
    
    # === High-level event broadcast methods ===
    
    async def broadcast_submission_event(
        self,
        game_id: uuid.UUID,
        team_id: str,
        status: str,
        points: int,
        flag_owner_team_id: str | None = None,
    ):
        """Broadcast a flag submission event."""
        await self.broadcast_to_game(
            str(game_id),
            {
                "event_type": "submission",
                "game_id": str(game_id),
                "team_id": team_id,
                "status": status,
                "points": points,
                "flag_owner_team_id": flag_owner_team_id,
            }
        )
    
    async def broadcast_checker_event(
        self,
        game_id: uuid.UUID,
        team_id: str,
        status: str,
        sla_percentage: float,
        tick_number: int,
    ):
        """Broadcast a checker status event."""
        await self.broadcast_to_game(
            str(game_id),
            {
                "event_type": "checker",
                "game_id": str(game_id),
                "team_id": team_id,
                "status": status,
                "sla_percentage": sla_percentage,
                "tick_number": tick_number,
            }
        )
    
    async def broadcast_tick_event(
        self,
        game_id: uuid.UUID,
        tick_number: int,
        flags_placed: int,
    ):
        """Broadcast a new tick event."""
        await self.broadcast_to_game(
            str(game_id),
            {
                "event_type": "tick",
                "game_id": str(game_id),
                "tick_number": tick_number,
                "flags_placed": flags_placed,
            }
        )
    
    async def broadcast_scoreboard_update(
        self,
        game_id: uuid.UUID,
        entries: list[dict] | None = None,
        game_name: str | None = None,
        current_tick: int | None = None,
    ):
        """Broadcast a scoreboard update event with full scoreboard data."""
        await self.broadcast_to_game(
            str(game_id),
            {
                "event_type": "scoreboard_update",
                "game_id": str(game_id),
                "game_name": game_name,
                "current_tick": current_tick,
                "entries": entries,
            }
        )
    
    def get_connection_count(self, game_id: str | None = None) -> int:
        """Get the number of active connections."""
        if game_id:
            return len(self._game_connections.get(game_id, set()))
        return len(self._global_connections) + sum(
            len(conns) for conns in self._game_connections.values()
        )


# Singleton instance
event_manager = EventManager()
