from marg_api.modules.reporting.domain.models import ReportRequest, ReportResponse
from marg_api.modules.reporting.infrastructure.repositories import ReportingRepository


class ReportingService:
    def __init__(self, reporting_repo: ReportingRepository):
        self.reporting_repo = reporting_repo

    async def generate_report(self, request: ReportRequest) -> ReportResponse:
        return await self.reporting_repo.generate_report(request)
