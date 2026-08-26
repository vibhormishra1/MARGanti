"""Centralized FastAPI dependencies for Request-Scoped DB Sessions and Repositories."""

from collections.abc import AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from marg_api.infrastructure.database.engine import get_db_session
from marg_api.modules.admin.application.services import AdminService
from marg_api.modules.admin.infrastructure.repositories import (
    AdminRepository,
    SQLAlchemyAdminRepository,
)
from marg_api.modules.analytics.application.services import AnalyticsService
from marg_api.modules.analytics.infrastructure.repositories import (
    AnalyticsRepository,
    SQLAlchemyAnalyticsRepository,
)
from marg_api.modules.audit.application.services import AuditService
from marg_api.modules.audit.infrastructure.repositories import (
    AuditRepository,
    SQLAlchemyAuditRepository,
)
from marg_api.modules.auth.application.services import AuthService
from marg_api.modules.auth.infrastructure.repositories import (
    AuthRepository,
    SQLAlchemyAuthRepository,
)
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
from marg_api.modules.reporting.application.services import ReportingService
from marg_api.modules.reporting.infrastructure.repositories import (
    ReportingRepository,
    SQLAlchemyReportingRepository,
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


def get_audit_repository(
    db: AsyncSession = Depends(get_db),
) -> AuditRepository:
    return SQLAlchemyAuditRepository(db)


def get_reporting_repository(
    db: AsyncSession = Depends(get_db),
) -> ReportingRepository:
    return SQLAlchemyReportingRepository(db)


def get_auth_repository(
    db: AsyncSession = Depends(get_db),
) -> AuthRepository:
    return SQLAlchemyAuthRepository(db)


def get_admin_repository(
    db: AsyncSession = Depends(get_db),
) -> AdminRepository:
    return SQLAlchemyAdminRepository(db)


# ── Application Services (Commands & Queries) ─────────────────────
def get_audit_service(
    repo: AuditRepository = Depends(get_audit_repository),
) -> AuditService:
    return AuditService(repo)


def get_incident_commands(
    repo: IncidentRepository = Depends(get_incident_repository),
    audit_service: AuditService = Depends(get_audit_service),
) -> IncidentCommands:
    return IncidentCommands(repo, audit_service)


def get_incident_queries(
    repo: IncidentRepository = Depends(get_incident_repository),
) -> IncidentQueries:
    return IncidentQueries(repo)


def get_mission_commands(
    repo: MissionRepository = Depends(get_mission_repository),
    audit_service: AuditService = Depends(get_audit_service),
) -> MissionCommands:
    return MissionCommands(repo, audit_service)


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


def get_reporting_service(
    repo: ReportingRepository = Depends(get_reporting_repository),
) -> ReportingService:
    return ReportingService(repo)


def get_auth_service(
    repo: AuthRepository = Depends(get_auth_repository),
) -> AuthService:
    return AuthService(repo)


def get_admin_service(
    repo: AdminRepository = Depends(get_admin_repository),
    audit_service: AuditService = Depends(get_audit_service),
) -> AdminService:
    return AdminService(repo, audit_service)
