"""
WebSocket Event Manager for Real-time Updates.

Uses PostgreSQL LISTEN/NOTIFY to detect database changes and broadcast
to connected WebSocket clients.
"""

import asyncio
import json
import logging
from typing import Dict, Set, Callable, Any
from contextlib import asynccontextmanager

import asyncpg

from src.core.config import get_settings

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections grouped by game_id."""
    
    def __init__(self):
        # game_id -> set of (websocket, send_func) tuples
        self.active_connections: Dict[str, Set] = {}
        self._lock = asyncio.Lock()
    
    async def connect(self, game_id: str, websocket: Any) -> None:
        """Add a WebSocket connection for a specific game."""
        async with self._lock:
            if game_id not in self.active_connections:
                self.active_connections[game_id] = set()
            self.active_connections[game_id].add(websocket)
            logger.info(f"WebSocket connected for game {game_id}. Total: {len(self.active_connections[game_id])}")
    
    async def disconnect(self, game_id: str, websocket: Any) -> None:
        """Remove a WebSocket connection."""
        async with self._lock:
            if game_id in self.active_connections:
                self.active_connections[game_id].discard(websocket)
                if not self.active_connections[game_id]:
                    del self.active_connections[game_id]
                logger.info(f"WebSocket disconnected from game {game_id}")
    
    async def broadcast_to_game(self, game_id: str, message: dict) -> None:
        """Send a message to all connections for a specific game."""
        async with self._lock:
            connections = self.active_connections.get(game_id, set()).copy()
        
        if not connections:
            return
        
        message_json = json.dumps(message)
        disconnected = []
        
        for websocket in connections:
            try:
                await websocket.send_text(message_json)
            except Exception as e:
                logger.warning(f"Failed to send to websocket: {e}")
                disconnected.append(websocket)
        
        # Clean up disconnected websockets
        for ws in disconnected:
            await self.disconnect(game_id, ws)
    
    async def broadcast_all(self, message: dict) -> None:
        """Broadcast message to all connected clients."""
        async with self._lock:
            all_game_ids = list(self.active_connections.keys())
        
        for game_id in all_game_ids:
            await self.broadcast_to_game(game_id, message)
    
    def get_connection_count(self, game_id: str = None) -> int:
        """Get number of active connections."""
        if game_id:
            return len(self.active_connections.get(game_id, set()))
        return sum(len(conns) for conns in self.active_connections.values())


# Global connection manager instance
connection_manager = ConnectionManager()


class PostgresEventListener:
    """Listens to PostgreSQL NOTIFY events and triggers callbacks."""
    
    def __init__(self, database_url: str):
        # Convert async URL to sync for asyncpg
        self.database_url = database_url.replace("postgresql+asyncpg://", "postgresql://")
        self.connection: asyncpg.Connection | None = None
        self.running = False
        self._callbacks: Dict[str, list[Callable]] = {}
    
    def on_event(self, channel: str, callback: Callable[[dict], Any]) -> None:
        """Register a callback for a specific channel."""
        if channel not in self._callbacks:
            self._callbacks[channel] = []
        self._callbacks[channel].append(callback)
    
    async def _handle_notification(self, connection, pid, channel: str, payload: str) -> None:
        """Handle incoming PostgreSQL notification."""
        try:
            data = json.loads(payload)
            logger.debug(f"Received notification on {channel}: {data}")
            
            callbacks = self._callbacks.get(channel, [])
            for callback in callbacks:
                try:
                    result = callback(data)
                    if asyncio.iscoroutine(result):
                        await result
                except Exception as e:
                    logger.error(f"Callback error for {channel}: {e}")
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in notification: {e}")
    
    async def start(self) -> None:
        """Start listening for PostgreSQL events."""
        if self.running:
            return
        
        self.running = True
        logger.info("Starting PostgreSQL event listener...")
        
        try:
            self.connection = await asyncpg.connect(self.database_url)
            
            # Add listener for each registered channel
            for channel in self._callbacks.keys():
                await self.connection.add_listener(channel, self._handle_notification)
                logger.info(f"Listening on channel: {channel}")
            
            # Keep connection alive
            while self.running:
                await asyncio.sleep(1)
                
        except Exception as e:
            logger.error(f"PostgreSQL listener error: {e}")
            self.running = False
        finally:
            await self.stop()
    
    async def stop(self) -> None:
        """Stop the event listener."""
        self.running = False
        if self.connection:
            try:
                for channel in self._callbacks.keys():
                    await self.connection.remove_listener(channel, self._handle_notification)
                await self.connection.close()
            except Exception as e:
                logger.warning(f"Error closing listener connection: {e}")
            finally:
                self.connection = None
        logger.info("PostgreSQL event listener stopped")


# Global event listener instance (initialized on startup)
event_listener: PostgresEventListener | None = None


async def handle_scoreboard_update(data: dict) -> None:
    """Handle scoreboard update notification from PostgreSQL."""
    game_id = data.get("game_id")
    if not game_id:
        return
    
    logger.info(f"Scoreboard updated for game {game_id}")
    
    # Notify all connected clients for this game to refresh
    await connection_manager.broadcast_to_game(
        str(game_id),
        {
            "type": "scoreboard_update",
            "game_id": str(game_id),
            "team_id": data.get("team_id"),
            "operation": data.get("operation"),
            "timestamp": data.get("timestamp"),
        }
    )


async def init_event_listener() -> None:
    """Initialize and start the PostgreSQL event listener."""
    global event_listener
    
    settings = get_settings()
    event_listener = PostgresEventListener(settings.database_url)
    
    # Register scoreboard update handler
    event_listener.on_event("scoreboard_updated", handle_scoreboard_update)
    
    # Start listener in background task
    asyncio.create_task(event_listener.start())
    logger.info("Event listener initialized")


async def shutdown_event_listener() -> None:
    """Shutdown the event listener gracefully."""
    global event_listener
    if event_listener:
        await event_listener.stop()
        event_listener = None
