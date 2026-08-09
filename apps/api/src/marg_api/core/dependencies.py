"""Centralized FastAPI dependencies for Request-Scoped DB Sessions and Repositories."""

from collections.abc import AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from marg_api.infrastructure.database.engine import get_db_session
from marg_api.modules.incident.application.commands import IncidentCommands
from marg_api.modules.incident.application.queries import IncidentQueries
from marg_api.modules.incident.infrastructure.repositories import (
    IncidentRepository,
    SQLAlchemyIncidentRepository,
)
from marg_api.modules.mission.application.commands import MissionCommands
from marg_api.modules.mission.application.queries import MissionQueries
from marg_api.modules.mission.infrastructure.repositories import (
    MissionRepository,
    SQLAlchemyMissionRepository,
)
from marg_api.modules.resource.application.commands import ResourceCommands
from marg_api.modules.resource.application.queries import ResourceQueries
from marg_api.modules.resource.infrastructure.repositories import (
    AllocationRepository,
    InventoryRepository,
    SQLAlchemyAllocationRepository,
    SQLAlchemyInventoryRepository,
)
from marg_api.modules.workforce.application.commands import WorkforceCommands
from marg_api.modules.workforce.application.queries import WorkforceQueries
from marg_api.modules.workforce.infrastructure.repositories import (
    ResponderRepository,
    SQLAlchemyResponderRepository,
    SQLAlchemyTeamRepository,
    TeamRepository,
)
from marg_api.modules.analytics.infrastructure.repositories import (
    AnalyticsRepository,
    SQLAlchemyAnalyticsRepository,
)
from marg_api.modules.analytics.application.services import AnalyticsService


# ── Database Session ───────────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession]:
    async for session in get_db_session():
        yield session


# ── Repositories (Request-Scoped) ──────────────────────────────────
def get_incident_repository(
    db: AsyncSession = Depends(get_db),
) -> IncidentRepository:
    return SQLAlchemyIncidentRepository(db)


def get_mission_repository(
    db: AsyncSession = Depends(get_db),
) -> MissionRepository:
    return SQLAlchemyMissionRepository(db)


def get_inventory_repository(
    db: AsyncSession = Depends(get_db),
) -> InventoryRepository:
    return SQLAlchemyInventoryRepository(db)


def get_allocation_repository(
    db: AsyncSession = Depends(get_db),
) -> AllocationRepository:
    return SQLAlchemyAllocationRepository(db)


def get_responder_repository(
    db: AsyncSession = Depends(get_db),
) -> ResponderRepository:
    return SQLAlchemyResponderRepository(db)


def get_team_repository(
    db: AsyncSession = Depends(get_db),
) -> TeamRepository:
    return SQLAlchemyTeamRepository(db)


def get_analytics_repository(
    db: AsyncSession = Depends(get_db),
) -> AnalyticsRepository:
    return SQLAlchemyAnalyticsRepository(db)


# ── Application Services (Commands & Queries) ─────────────────────
def get_incident_commands(
    repo: IncidentRepository = Depends(get_incident_repository),
) -> IncidentCommands:
    return IncidentCommands(repo)


def get_incident_queries(
    repo: IncidentRepository = Depends(get_incident_repository),
) -> IncidentQueries:
    return IncidentQueries(repo)


def get_mission_commands(
    repo: MissionRepository = Depends(get_mission_repository),
) -> MissionCommands:
    return MissionCommands(repo)


def get_mission_queries(
    repo: MissionRepository = Depends(get_mission_repository),
) -> MissionQueries:
    return MissionQueries(repo)


def get_resource_commands(
    inv_repo: InventoryRepository = Depends(get_inventory_repository),
    alloc_repo: AllocationRepository = Depends(get_allocation_repository),
) -> ResourceCommands:
    return ResourceCommands(inv_repo, alloc_repo)


def get_resource_queries(
    inv_repo: InventoryRepository = Depends(get_inventory_repository),
    alloc_repo: AllocationRepository = Depends(get_allocation_repository),
) -> ResourceQueries:
    return ResourceQueries(inv_repo, alloc_repo)


def get_workforce_commands(
    team_repo: TeamRepository = Depends(get_team_repository),
    resp_repo: ResponderRepository = Depends(get_responder_repository),
) -> WorkforceCommands:
    return WorkforceCommands(team_repo, resp_repo)


def get_workforce_queries(
    team_repo: TeamRepository = Depends(get_team_repository),
    resp_repo: ResponderRepository = Depends(get_responder_repository),
) -> WorkforceQueries:
    return WorkforceQueries(team_repo, resp_repo)


def get_analytics_service(
    repo: AnalyticsRepository = Depends(get_analytics_repository),
) -> AnalyticsService:
    return AnalyticsService(repo)
