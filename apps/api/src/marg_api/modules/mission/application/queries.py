from marg_api.modules.mission.domain.models import Mission
from marg_api.modules.mission.infrastructure.repositories import MissionRepository


class MissionQueries:
    def __init__(self, repo: MissionRepository):
        self.repo = repo

    async def get_mission(self, mission_id: str) -> Mission | None:
        return await self.repo.get_by_id(mission_id)

    async def list_missions(self, incident_id: str | None = None) -> list[Mission]:
        if incident_id:
            return await self.repo.get_by_incident_id(incident_id)
        return await self.repo.list_all()
