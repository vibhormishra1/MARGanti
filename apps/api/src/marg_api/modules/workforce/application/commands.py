import uuid
from datetime import UTC, datetime

from pydantic import BaseModel

from marg_api.modules.incident.domain.models import GeoLocation
from marg_api.modules.workforce.domain.models import Responder, ResponderStatus, Team, TeamStatus
from marg_api.modules.workforce.infrastructure.repositories import (
    ResponderRepository,
    TeamRepository,
)


class CreateTeamCommand(BaseModel):
    organization_id: str
    name: str
    team_leader_id: str


class CheckInCommand(BaseModel):
    responder_id: str
    shift_id: str
    latitude: float
    longitude: float


class WorkforceCommands:
    def __init__(self, team_repo: TeamRepository, responder_repo: ResponderRepository):
        self.team_repo = team_repo
        self.responder_repo = responder_repo

    async def create_team(self, command: CreateTeamCommand) -> Team:
        team = Team(
            id=str(uuid.uuid4()),
            organization_id=command.organization_id,
            name=command.name,
            team_leader_id=command.team_leader_id,
            members=[command.team_leader_id],
            status=TeamStatus.IDLE,
        )
        await self.team_repo.save(team)
        return team

    async def check_in(self, command: CheckInCommand) -> Responder:
        responder = await self.responder_repo.get_by_id(command.responder_id)
        if not responder:
            raise ValueError(f"Responder {command.responder_id} not found")

        if responder.status == ResponderStatus.INCAPACITATED:
            raise ValueError("Cannot check in while incapacitated")

        shift_found = False
        for shift in responder.shifts:
            if shift.id == command.shift_id:
                if not shift.check_in_time:
                    shift.check_in_time = datetime.now(UTC)
                shift_found = True
                break

        if not shift_found:
            raise ValueError("Shift not found")

        responder.status = ResponderStatus.ON_DUTY
        responder.current_location = GeoLocation(
            latitude=command.latitude,
            longitude=command.longitude,
        )

        await self.responder_repo.save(responder)
        return responder
