import uuid
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

from src.core.websocket import event_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["websocket"])


@router.websocket("/events")
async def websocket_events_global(websocket: WebSocket):
    """
    WebSocket endpoint for all game events.
    
    Connect: ws://server/ws/events
    
    Receives all events from all games.
    """
    await event_manager.connect(websocket, game_id=None)
    
    try:
        await websocket.send_json({
            "event_type": "connected",
            "message": "Connected to global event stream",
        })
        
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"event_type": "pong"})
    
    except WebSocketDisconnect:
        await event_manager.disconnect(websocket, game_id=None)
        logger.info("Global WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await event_manager.disconnect(websocket, game_id=None)


@router.websocket("/events/{game_id}")
async def websocket_events_game(websocket: WebSocket, game_id: str):
    """
    WebSocket endpoint for game-specific events.
    
    Connect: ws://server/ws/events/{game_id}
    
    Receives only events for the specified game.
    """
    await event_manager.connect(websocket, game_id=game_id)
    
    try:
        await websocket.send_json({
            "event_type": "connected",
            "message": f"Connected to event stream for game {game_id}",
            "game_id": game_id,
        })
        
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"event_type": "pong"})
    
    except WebSocketDisconnect:
        await event_manager.disconnect(websocket, game_id=game_id)
        logger.info(f"WebSocket client disconnected from game {game_id}")
    except Exception as e:
        logger.error(f"WebSocket error for game {game_id}: {e}")
        await event_manager.disconnect(websocket, game_id=game_id)


@router.get("/status")
async def websocket_status():
    """Get WebSocket connection statistics."""
    return {
        "total_connections": event_manager.get_connection_count(),
        "status": "active",
    }
