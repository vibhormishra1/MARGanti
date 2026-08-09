from abc import ABC, abstractmethod

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from marg_api.infrastructure.database.models import ResponderModel, TeamModel
from marg_api.modules.incident.domain.models import GeoLocation
from marg_api.modules.workforce.domain.models import (
    Availability,
    Certification,
    ContactInfo,
    Responder,
    ResponderStatus,
    ResponderType,
    Shift,
    Team,
    TeamStatus,
)


class ResponderRepository(ABC):
    @abstractmethod
    async def save(self, responder: Responder) -> None:
        pass

    @abstractmethod
    async def get_by_id(self, responder_id: str) -> Responder | None:
        pass

    @abstractmethod
    async def find_by_organization(self, organization_id: str) -> list[Responder]:
        pass


class TeamRepository(ABC):
    @abstractmethod
    async def save(self, team: Team) -> None:
        pass

    @abstractmethod
    async def get_by_id(self, team_id: str) -> Team | None:
        pass


class SQLAlchemyResponderRepository(ResponderRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_domain(self, model: ResponderModel) -> Responder:
        location = None
        if model.current_latitude is not None and model.current_longitude is not None:
            location = GeoLocation(latitude=model.current_latitude, longitude=model.current_longitude)

        return Responder(
            id=model.id,
            organization_id=model.organization_id,
            type=ResponderType(model.type),
            contact_info=ContactInfo(**model.contact_info),
            skills=model.skills or [],
            certifications=[
                Certification(
                    id=c["id"],
                    name=c["name"],
                    issued_at=c["issued_at"],
                    expires_at=c.get("expires_at"),
                    license_number=c["license_number"],
                )
                for c in (model.certifications or [])
            ],
            availability=[
                Availability(
                    day_of_week=a.get("day_of_week"),
                    start_time=a.get("start_time"),
                    end_time=a.get("end_time"),
                    specific_date=a.get("specific_date"),
                    is_available=a.get("is_available", True),
                )
                for a in (model.availability or [])
            ],
            status=ResponderStatus(model.status),
            current_location=location,
            shifts=[
                Shift(
                    id=s["id"],
                    start_time=s["start_time"],
                    end_time=s["end_time"],
                    check_in_time=s.get("check_in_time"),
                    check_out_time=s.get("check_out_time"),
                )
                for s in (model.shifts or [])
            ],
        )

    async def save(self, responder: Responder) -> None:
        certs_json = [
            {
                "id": c.id,
                "name": c.name,
                "issued_at": c.issued_at.isoformat() if c.issued_at else None,
                "expires_at": c.expires_at.isoformat() if c.expires_at else None,
                "license_number": c.license_number,
            }
            for c in responder.certifications
        ]
        avail_json = [
            {
                "day_of_week": a.day_of_week,
                "start_time": a.start_time,
                "end_time": a.end_time,
                "specific_date": a.specific_date.isoformat() if a.specific_date else None,
                "is_available": a.is_available,
            }
            for a in responder.availability
        ]
        shifts_json = [
            {
                "id": s.id,
                "start_time": s.start_time.isoformat() if s.start_time else None,
                "end_time": s.end_time.isoformat() if s.end_time else None,
                "check_in_time": s.check_in_time.isoformat() if s.check_in_time else None,
                "check_out_time": s.check_out_time.isoformat() if s.check_out_time else None,
            }
            for s in responder.shifts
        ]
        curr_lat = responder.current_location.latitude if responder.current_location else None
        curr_lng = responder.current_location.longitude if responder.current_location else None

        model = await self.session.get(ResponderModel, responder.id)
        if model is None:
            model = ResponderModel(
                id=responder.id,
                organization_id=responder.organization_id,
                type=responder.type.value if hasattr(responder.type, "value") else responder.type,
                contact_info=responder.contact_info.model_dump(),
                skills=responder.skills,
                certifications=certs_json,
                availability=avail_json,
                status=responder.status.value if hasattr(responder.status, "value") else responder.status,
                current_latitude=curr_lat,
                current_longitude=curr_lng,
                shifts=shifts_json,
            )
            self.session.add(model)
        else:
            model.organization_id = responder.organization_id
            model.type = responder.type.value if hasattr(responder.type, "value") else responder.type
            model.contact_info = responder.contact_info.model_dump()
            model.skills = responder.skills
            model.certifications = certs_json
            model.availability = avail_json
            model.status = responder.status.value if hasattr(responder.status, "value") else responder.status
            model.current_latitude = curr_lat
            model.current_longitude = curr_lng
            model.shifts = shifts_json
        await self.session.flush()

    async def get_by_id(self, responder_id: str) -> Responder | None:
        model = await self.session.get(ResponderModel, responder_id)
        if not model:
            return None
        return self._to_domain(model)

    async def find_by_organization(self, organization_id: str) -> list[Responder]:
        stmt = select(ResponderModel).where(ResponderModel.organization_id == organization_id)
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_domain(m) for m in models]


class SQLAlchemyTeamRepository(TeamRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_domain(self, model: TeamModel) -> Team:
        return Team(
            id=model.id,
            organization_id=model.organization_id,
            name=model.name,
            team_leader_id=model.team_leader_id,
            members=model.members or [],
            current_incident_id=model.current_incident_id,
            status=TeamStatus(model.status),
        )

    async def save(self, team: Team) -> None:
        model = await self.session.get(TeamModel, team.id)
        if model is None:
            model = TeamModel(
                id=team.id,
                organization_id=team.organization_id,
                name=team.name,
                team_leader_id=team.team_leader_id,
                members=team.members,
                current_incident_id=team.current_incident_id,
                status=team.status.value if hasattr(team.status, "value") else team.status,
            )
            self.session.add(model)
        else:
            model.organization_id = team.organization_id
            model.name = team.name
            model.team_leader_id = team.team_leader_id
            model.members = team.members
            model.current_incident_id = team.current_incident_id
            model.status = team.status.value if hasattr(team.status, "value") else team.status
        await self.session.flush()

    async def get_by_id(self, team_id: str) -> Team | None:
        model = await self.session.get(TeamModel, team_id)
        if not model:
            return None
        return self._to_domain(model)
