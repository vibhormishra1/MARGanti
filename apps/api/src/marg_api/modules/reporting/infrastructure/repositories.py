import uuid
from abc import ABC, abstractmethod

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from marg_api.infrastructure.database.models import IncidentModel, MissionModel
from marg_api.modules.reporting.domain.models import ReportRequest, ReportResponse, ReportSection


class ReportingRepository(ABC):
    @abstractmethod
    async def generate_report(self, request: ReportRequest) -> ReportResponse:
        pass


class SQLAlchemyReportingRepository(ReportingRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def generate_report(self, request: ReportRequest) -> ReportResponse:
        sections = []
        
        if request.report_type == 'INCIDENT_SUMMARY':
            stmt = select(IncidentModel)
            if request.organization_id:
                stmt = stmt.where(IncidentModel.organization_id == request.organization_id)
            if request.start_date:
                stmt = stmt.where(IncidentModel.reported_at >= request.start_date)
            if request.end_date:
                stmt = stmt.where(IncidentModel.reported_at <= request.end_date)
            if request.status_filter:
                stmt = stmt.where(IncidentModel.status.in_(request.status_filter))
                
            result = await self.session.execute(stmt)
            incidents = result.scalars().all()
            
            data = [
                {
                    "id": inc.id,
                    "title": inc.title,
                    "status": inc.status,
                    "priority": inc.priority,
                    "reported_at": inc.reported_at.isoformat()
                } for inc in incidents
            ]
            
            sections.append(ReportSection(title="Incident List", data=data))
            sections.append(ReportSection(title="Summary", data={"total_incidents": len(incidents)}))
            
        elif request.report_type == 'MISSION_PERFORMANCE':
            stmt = select(MissionModel)
            if request.organization_id:
                stmt = stmt.where(MissionModel.organization_id == request.organization_id)
            if request.start_date:
                stmt = stmt.where(MissionModel.created_at >= request.start_date)
            if request.end_date:
                stmt = stmt.where(MissionModel.created_at <= request.end_date)
            if request.status_filter:
                stmt = stmt.where(MissionModel.status.in_(request.status_filter))
                
            result = await self.session.execute(stmt)
            missions = result.scalars().all()
            
            data = [
                {
                    "id": m.id,
                    "title": m.title,
                    "status": m.status,
                    "priority": m.priority,
                    "created_at": m.created_at.isoformat()
                } for m in missions
            ]
            
            sections.append(ReportSection(title="Mission List", data=data))
            sections.append(ReportSection(title="Summary", data={"total_missions": len(missions)}))
        else:
            sections.append(ReportSection(title="Empty Report", data={"message": "Unsupported report type"}))
            
        return ReportResponse(
            id=str(uuid.uuid4()),
            report_type=request.report_type,
            sections=sections,
            metadata={
                "start_date": request.start_date.isoformat() if request.start_date else None,
                "end_date": request.end_date.isoformat() if request.end_date else None,
                "filters_applied": bool(request.status_filter)
            }
        )
