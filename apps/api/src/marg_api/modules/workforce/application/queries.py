from marg_api.modules.workforce.domain.models import Responder, Team
from marg_api.modules.workforce.infrastructure.repositories import (
    ResponderRepository,
    TeamRepository,
)


class WorkforceQueries:
    def __init__(self, team_repo: TeamRepository, responder_repo: ResponderRepository):
        self.team_repo = team_repo
        self.responder_repo = responder_repo

    async def list_responders(self, organization_id: str) -> list[Responder]:
        return await self.responder_repo.find_by_organization(organization_id)

    async def get_team(self, team_id: str) -> Team | None:
        return await self.team_repo.get_by_id(team_id)
