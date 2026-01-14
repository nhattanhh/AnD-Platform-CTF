"""
WebSocket event schemas for real-time game events.
"""

import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

from src.models.submission import SubmissionStatus
from src.models.service_status import CheckStatus


class BaseEvent(BaseModel):
    """Base class for all WebSocket events."""
    event_type: str
    timestamp: datetime = None
    
    class Config:
        from_attributes = True


class SubmissionEvent(BaseEvent):
    """Event fired when a team submits a flag."""
    event_type: str = "submission"
    game_id: uuid.UUID
    team_id: str
    status: SubmissionStatus
    points: int
    flag_owner_team_id: Optional[str] = None


class CheckerEvent(BaseEvent):
    """Event fired when checker reports service status."""
    event_type: str = "checker"
    game_id: uuid.UUID
    team_id: str
    status: CheckStatus
    sla_percentage: float
    tick_number: int


class TickEvent(BaseEvent):
    """Event fired when a new tick starts."""
    event_type: str = "tick"
    game_id: uuid.UUID
    tick_number: int
    flags_placed: int


class ScoreboardEntry(BaseModel):
    """Single entry in scoreboard update."""
    team_id: str
    attack_points: int
    defense_points: int
    sla_points: int
    total_points: int
    rank: int
    flags_captured: int
    flags_lost: int


class ScoreboardUpdateEvent(BaseEvent):
    """Event fired when scoreboard changes."""
    event_type: str = "scoreboard_update"
    game_id: uuid.UUID
    entries: Optional[list[ScoreboardEntry]] = None


class ConnectionEvent(BaseEvent):
    """Event sent on WebSocket connection."""
    event_type: str = "connected"
    message: str = "Connected to event stream"
    game_id: Optional[uuid.UUID] = None
