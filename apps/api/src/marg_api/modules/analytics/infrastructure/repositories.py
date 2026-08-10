from abc import ABC, abstractmethod
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from marg_api.infrastructure.database.models import IncidentModel, MissionModel, ResponderModel
from marg_api.modules.analytics.domain.models import (
    DashboardAnalytics,
    IncidentMetrics,
    MissionMetrics,
    PriorityCount,
    ResponderMetrics,
    StatusCount,
    TrendDataPoint,
)


class AnalyticsRepository(ABC):
    @abstractmethod
    async def get_dashboard_analytics(self, organization_id: str | None = None) -> DashboardAnalytics:
        pass


class SQLAlchemyAnalyticsRepository(AnalyticsRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_dashboard_analytics(self, organization_id: str | None = None) -> DashboardAnalytics:
        # Incidents
        incident_status_stmt = select(IncidentModel.status, func.count(IncidentModel.id)).group_by(IncidentModel.status)
        if organization_id:
            incident_status_stmt = incident_status_stmt.where(IncidentModel.organization_id == organization_id)
        incident_status_res = await self.session.execute(incident_status_stmt)
        inc_status_counts = [StatusCount(status=r[0], count=r[1]) for r in incident_status_res.all()]

        incident_priority_stmt = select(IncidentModel.priority, func.count(IncidentModel.id)).group_by(IncidentModel.priority)
        if organization_id:
            incident_priority_stmt = incident_priority_stmt.where(IncidentModel.organization_id == organization_id)
        incident_priority_res = await self.session.execute(incident_priority_stmt)
        inc_priority_counts = [PriorityCount(priority=r[0], count=r[1]) for r in incident_priority_res.all()]

        total_incidents = sum(s.count for s in inc_status_counts)
        active_incidents = sum(s.count for s in inc_status_counts if s.status not in ("RESOLVED", "CLOSED"))

        # Trend (last 7 days grouped by date using cast to Date)
        # Using simple python-side grouping if DB functions are complex across SQLite/Postgres.
        # But `reported_at` can be queried for the last 7 days.
        seven_days_ago = datetime.now(UTC) - timedelta(days=7)
        trend_stmt = select(IncidentModel.reported_at).where(IncidentModel.reported_at >= seven_days_ago)
        if organization_id:
            trend_stmt = trend_stmt.where(IncidentModel.organization_id == organization_id)
        trend_res = await self.session.execute(trend_stmt)
        
        # Group by day in python to support both SQLite and Postgres easily
        trend_map = {}
        for (reported_at,) in trend_res.all():
            day = reported_at.replace(hour=0, minute=0, second=0, microsecond=0)
            trend_map[day] = trend_map.get(day, 0) + 1
            
        trend_data = [TrendDataPoint(timestamp=day, count=count) for day, count in sorted(trend_map.items())]

        incident_metrics = IncidentMetrics(
            total_incidents=total_incidents,
            active_incidents=active_incidents,
            by_status=inc_status_counts,
            by_priority=inc_priority_counts,
            trend=trend_data,
        )

        # Responders
        responder_status_stmt = select(ResponderModel.status, func.count(ResponderModel.id)).group_by(ResponderModel.status)
        if organization_id:
            responder_status_stmt = responder_status_stmt.where(ResponderModel.organization_id == organization_id)
        responder_status_res = await self.session.execute(responder_status_stmt)
        resp_status_counts = [StatusCount(status=r[0], count=r[1]) for r in responder_status_res.all()]
        
        total_responders = sum(s.count for s in resp_status_counts)
        active_responders = sum(s.count for s in resp_status_counts if s.status in ("ON_DUTY", "DEPLOYED"))

        responder_metrics = ResponderMetrics(
            total_responders=total_responders,
            active_responders=active_responders,
            by_status=resp_status_counts,
        )

        # Missions
        mission_status_stmt = select(MissionModel.status, func.count(MissionModel.id)).group_by(MissionModel.status)
        if organization_id:
            mission_status_stmt = mission_status_stmt.where(MissionModel.organization_id == organization_id)
        mission_status_res = await self.session.execute(mission_status_stmt)
        miss_status_counts = [StatusCount(status=r[0], count=r[1]) for r in mission_status_res.all()]

        total_missions = sum(s.count for s in miss_status_counts)
        active_missions = sum(s.count for s in miss_status_counts if s.status not in ("COMPLETED", "CANCELLED"))

        mission_metrics = MissionMetrics(
            total_missions=total_missions,
            active_missions=active_missions,
            by_status=miss_status_counts,
        )

        return DashboardAnalytics(
            generated_at=datetime.now(UTC),
            incidents=incident_metrics,
            responders=responder_metrics,
            missions=mission_metrics,
        )
