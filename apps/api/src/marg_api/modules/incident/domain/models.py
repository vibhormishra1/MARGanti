from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class IncidentPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class IncidentStatus(str, Enum):
    DRAFT = "DRAFT"
    REPORTED = "REPORTED"
    ASSESSED = "ASSESSED"
    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class GeoLocation(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    address: str | None = None
    grid_cell: str | None = None


class TimelineEvent(BaseModel):
    id: str
    timestamp: datetime
    action: str
    description: str
    actor_id: str


class Incident(BaseModel):
    id: str
    organization_id: str
    title: str
    description: str
    location: GeoLocation
    priority: IncidentPriority
    status: IncidentStatus
    reporter_id: str
    assigned_responders: list[str] = Field(default_factory=list)
    attachments: list[str] = Field(default_factory=list)
    timeline: list[TimelineEvent] = Field(default_factory=list)
    reported_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    tags: list[str] = Field(default_factory=list)
