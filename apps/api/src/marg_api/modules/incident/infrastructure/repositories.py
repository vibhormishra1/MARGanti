import math
from abc import ABC, abstractmethod

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from marg_api.infrastructure.database.models import IncidentModel
from marg_api.modules.incident.domain.models import GeoLocation, Incident, IncidentStatus


class IncidentRepository(ABC):
    @abstractmethod
    async def save(self, incident: Incident) -> None:
        pass

    @abstractmethod
    async def get_by_id(self, incident_id: str) -> Incident | None:
        pass

    @abstractmethod
    async def search(
        self,
        status: IncidentStatus | None = None,
        priority: str | None = None,
        limit: int = 50,
        offset: int = 0,
        organization_id: str | None = None,
    ) -> list[Incident]:
        pass

    @abstractmethod
    async def find_by_radius(
        self, lat: float, lng: float, radius_km: float, organization_id: str | None = None
    ) -> list[Incident]:
        pass


class SQLAlchemyIncidentRepository(IncidentRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_domain(self, model: IncidentModel) -> Incident:
        return Incident(
            id=model.id,
            organization_id=model.organization_id,
            title=model.title,
            description=model.description,
            location=GeoLocation(
                latitude=model.latitude,
                longitude=model.longitude,
                address=model.address,
                grid_cell=model.grid_cell,
            ),
            priority=model.priority,
            status=IncidentStatus(model.status),
            reporter_id=model.reporter_id,
            reported_at=model.reported_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
            tags=model.tags or [],
        )

    async def save(self, incident: Incident) -> None:
        model = await self.session.get(IncidentModel, incident.id)
        if model is None:
            model = IncidentModel(
                id=incident.id,
                organization_id=incident.organization_id,
                title=incident.title,
                description=incident.description,
                latitude=incident.location.latitude,
                longitude=incident.location.longitude,
                address=incident.location.address,
                grid_cell=incident.location.grid_cell,
                priority=incident.priority,
                status=incident.status.value if isinstance(incident.status, IncidentStatus) else incident.status,
                reporter_id=incident.reporter_id,
                reported_at=incident.reported_at,
                created_at=incident.created_at,
                updated_at=incident.updated_at,
                tags=incident.tags,
            )
            self.session.add(model)
        else:
            model.title = incident.title
            model.description = incident.description
            model.latitude = incident.location.latitude
            model.longitude = incident.location.longitude
            model.address = incident.location.address
            model.grid_cell = incident.location.grid_cell
            model.priority = incident.priority
            model.status = incident.status.value if isinstance(incident.status, IncidentStatus) else incident.status
            model.updated_at = incident.updated_at
            model.tags = incident.tags
        await self.session.flush()

    async def get_by_id(self, incident_id: str) -> Incident | None:
        model = await self.session.get(IncidentModel, incident_id)
        if not model:
            return None
        return self._to_domain(model)

    async def search(
        self,
        status: IncidentStatus | None = None,
        priority: str | None = None,
        limit: int = 50,
        offset: int = 0,
        organization_id: str | None = None,
    ) -> list[Incident]:
        stmt = select(IncidentModel)
        if organization_id:
            stmt = stmt.where(IncidentModel.organization_id == organization_id)
        if status:
            stmt = stmt.where(IncidentModel.status == status.value)
        if priority:
            stmt = stmt.where(IncidentModel.priority == priority)
        stmt = stmt.offset(offset).limit(limit)
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_domain(m) for m in models]

    async def find_by_radius(
        self, lat: float, lng: float, radius_km: float, organization_id: str | None = None
    ) -> list[Incident]:
        stmt = select(IncidentModel)
        if organization_id:
            stmt = stmt.where(IncidentModel.organization_id == organization_id)

        # Optimization: Apply a rough bounding box in SQL to drastically reduce rows fetched
        # 1 degree of latitude is roughly 111 km
        delta_lat = radius_km / 111.0
        # 1 degree of longitude is roughly 111 km * cos(latitude)
        delta_lng = radius_km / (111.0 * math.cos(math.radians(lat))) if math.cos(math.radians(lat)) != 0 else 0

        stmt = stmt.where(IncidentModel.latitude >= lat - delta_lat)
        stmt = stmt.where(IncidentModel.latitude <= lat + delta_lat)
        stmt = stmt.where(IncidentModel.longitude >= lng - delta_lng)
        stmt = stmt.where(IncidentModel.longitude <= lng + delta_lng)

        result = await self.session.execute(stmt)
        models = result.scalars().all()

        matching = []
        for m in models:
            dlat = math.radians(m.latitude - lat)
            dlng = math.radians(m.longitude - lng)
            a = (
                math.sin(dlat / 2) ** 2
                + math.cos(math.radians(lat)) * math.cos(math.radians(m.latitude)) * math.sin(dlng / 2) ** 2
            )
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            dist = 6371 * c
            if dist <= radius_km:
                matching.append(self._to_domain(m))
        return matching
