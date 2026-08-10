from typing import Annotated

from fastapi import APIRouter, Depends

from marg_api.core.dependencies import get_analytics_service
from marg_api.core.security import TokenData, get_current_user
from marg_api.modules.analytics.application.services import AnalyticsService
from marg_api.modules.analytics.domain.models import DashboardAnalytics

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardAnalytics)
async def get_dashboard(
    analytics_service: Annotated[AnalyticsService, Depends(get_analytics_service)],
    current_user: Annotated[TokenData, Depends(get_current_user)],
):
    """Retrieve operational intelligence dashboard metrics."""
    return await analytics_service.get_dashboard_analytics(organization_id=current_user.organization_id)
