from marg_api.modules.incident.domain.models import Incident, IncidentStatus
from marg_api.modules.incident.infrastructure.repositories import IncidentRepository


class IncidentQueries:
    def __init__(self, repository: IncidentRepository):
        self.repository = repository

    async def get_incident(self, incident_id: str) -> Incident | None:
        return await self.repository.get_by_id(incident_id)

    async def list_incidents(
        self,
        status: IncidentStatus | None = None,
        priority: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Incident]:
        return await self.repository.search(status, priority, limit, offset)

    async def get_nearby_incidents(self, lat: float, lng: float, radius_km: float) -> list[Incident]:
        return await self.repository.find_by_radius(lat, lng, radius_km)
