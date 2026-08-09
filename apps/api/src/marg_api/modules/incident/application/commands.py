import uuid
from datetime import UTC, datetime

from pydantic import BaseModel

from marg_api.modules.incident.domain.models import (
    GeoLocation,
    Incident,
    IncidentPriority,
    IncidentStatus,
    TimelineEvent,
)
from marg_api.modules.incident.infrastructure.repositories import IncidentRepository


class ReportIncidentCommand(BaseModel):
    title: str
    description: str
    latitude: float
    longitude: float
    address: str | None = None
    priority: IncidentPriority
    reporter_id: str


class UpdateIncidentStatusCommand(BaseModel):
    incident_id: str
    new_status: IncidentStatus
    actor_id: str
    reason: str | None = None


class IncidentCommands:
    def __init__(self, repository: IncidentRepository):
        self.repository = repository

    async def report_incident(self, command: ReportIncidentCommand) -> Incident:
        now = datetime.now(UTC)
        incident_id = str(uuid.uuid4())

        timeline_event = TimelineEvent(
            id=str(uuid.uuid4()),
            timestamp=now,
            action="REPORTED",
            description=f"Incident reported with priority {command.priority}",
            actor_id=command.reporter_id,
        )

        incident = Incident(
            id=incident_id,
            title=command.title,
            description=command.description,
            location=GeoLocation(
                latitude=command.latitude,
                longitude=command.longitude,
                address=command.address,
            ),
            priority=command.priority,
            status=IncidentStatus.REPORTED,
            reporter_id=command.reporter_id,
            assigned_responders=[],
            attachments=[],
            timeline=[timeline_event],
            reported_at=now,
            created_at=now,
            updated_at=now,
        )

        await self.repository.save(incident)
        return incident

    async def update_status(self, command: UpdateIncidentStatusCommand) -> Incident:
        incident = await self.repository.get_by_id(command.incident_id)
        if not incident:
            raise ValueError(f"Incident {command.incident_id} not found")

        old_status = incident.status
        incident.status = command.new_status
        incident.updated_at = datetime.now(UTC)

        reason_txt = f": {command.reason}" if command.reason else ""

        incident.timeline.append(
            TimelineEvent(
                id=str(uuid.uuid4()),
                timestamp=incident.updated_at,
                action="STATUS_CHANGED",
                description=f"Status changed from {old_status} to {command.new_status}{reason_txt}",
                actor_id=command.actor_id,
            )
        )

        await self.repository.save(incident)
        return incident
