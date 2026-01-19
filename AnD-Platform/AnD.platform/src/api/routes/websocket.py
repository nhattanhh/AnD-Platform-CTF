"""
WebSocket Routes for Real-time Updates.

Provides WebSocket endpoints for real-time scoreboard updates.
"""

import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.events import connection_manager
from src.services import scoring_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/scoreboard/{game_id}")
async def scoreboard_websocket(websocket: WebSocket, game_id: str):
    """
    WebSocket endpoint for real-time scoreboard updates.
    
    Clients connect to receive instant notifications when scoreboard changes.
    On connection, sends the current scoreboard data.
    On updates, sends a notification message with the change info.
    """
    await websocket.accept()
    logger.info(f"WebSocket connection request for game {game_id}")
    
    # Register connection
    await connection_manager.connect(game_id, websocket)
    
    try:
        # Send initial scoreboard data
        async for db in get_db():
            try:
                import uuid as uuid_module
                game_uuid = uuid_module.UUID(game_id)
                scoreboard_data = await scoring_service.get_scoreboard(db, game_uuid)
                if scoreboard_data:
                    await websocket.send_json({
                        "type": "initial",
                        "game_id": game_id,
                        "entries": [
                            {
                                "team_id": s.team_id,
                                "attack_points": s.attack_points,
                                "defense_points": s.defense_points,
                                "sla_points": s.sla_points,
                                "total_points": s.total_points,
                                "rank": s.rank,
                                "flags_captured": s.flags_captured,
                                "flags_lost": s.flags_lost,
                            }
                            for s in scoreboard_data
                        ]
                    })
            except Exception as e:
                logger.error(f"Error fetching initial scoreboard: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": "Failed to fetch scoreboard"
                })
            break
        
        # Keep connection alive and wait for messages
        while True:
            # Wait for client messages (ping/pong or close)
            try:
                data = await websocket.receive_text()
                # Handle ping messages
                if data == "ping":
                    await websocket.send_text("pong")
            except WebSocketDisconnect:
                break
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for game {game_id}")
    except Exception as e:
        logger.error(f"WebSocket error for game {game_id}: {e}")
    finally:
        await connection_manager.disconnect(game_id, websocket)


@router.websocket("/ws/health")
async def health_websocket(websocket: WebSocket):
    """Simple WebSocket health check endpoint."""
    await websocket.accept()
    await websocket.send_json({"status": "connected"})
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        pass
