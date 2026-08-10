from typing import Annotated

from fastapi import APIRouter, Depends

from marg_api.core.dependencies import get_reporting_service
from marg_api.core.security import TokenData, get_current_user
from marg_api.modules.reporting.application.services import ReportingService
from marg_api.modules.reporting.domain.models import ReportRequest, ReportResponse

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("/generate", response_model=ReportResponse)
async def generate_report(
    request: ReportRequest,
    reporting_service: Annotated[ReportingService, Depends(get_reporting_service)],
    current_user: Annotated[TokenData, Depends(get_current_user)],
):
    """Generate operational reports."""
    # Enforce tenant isolation
    request.organization_id = current_user.organization_id
    return await reporting_service.generate_report(request)
