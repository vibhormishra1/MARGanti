from marg_api.modules.analytics.domain.models import DashboardAnalytics
from marg_api.modules.analytics.infrastructure.repositories import AnalyticsRepository


class AnalyticsService:
    def __init__(self, analytics_repo: AnalyticsRepository):
        self.analytics_repo = analytics_repo

    async def get_dashboard_analytics(self, organization_id: str | None = None) -> DashboardAnalytics:
        """Fetch dashboard analytics from the repository."""
        return await self.analytics_repo.get_dashboard_analytics(organization_id=organization_id)
