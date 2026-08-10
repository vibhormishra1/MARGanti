from fastapi import APIRouter, Depends, HTTPException, Query

from marg_api.core.dependencies import get_incident_commands, get_incident_queries
from marg_api.core.security import TokenData, get_current_user
from marg_api.modules.incident.application.commands import (
    IncidentCommands,
    ReportIncidentCommand,
    UpdateIncidentStatusCommand,
)
from marg_api.modules.incident.application.queries import IncidentQueries
from marg_api.modules.incident.domain.models import Incident, IncidentStatus

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.post("/", response_model=Incident, status_code=201)
async def report_incident(
    cmd: ReportIncidentCommand,
    commands: IncidentCommands = Depends(get_incident_commands),
    current_user: TokenData = Depends(get_current_user),
):
    cmd.reporter_id = current_user.user_id
    cmd.organization_id = current_user.organization_id
    return await commands.report_incident(cmd)


@router.get("/", response_model=list[Incident])
async def list_incidents(
    status: IncidentStatus | None = Query(None),
    priority: str | None = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    queries: IncidentQueries = Depends(get_incident_queries),
    current_user: TokenData = Depends(get_current_user),
):
    # Tenant isolation is currently done in memory or not supported directly in queries if they don't take org_id
    # We will pass org_id down to queries. Let's assume we modify list_incidents to take organization_id.
    return await queries.list_incidents(status, priority, limit, offset, organization_id=current_user.organization_id)


@router.get("/{incident_id}", response_model=Incident)
async def get_incident(
    incident_id: str,
    queries: IncidentQueries = Depends(get_incident_queries),
    current_user: TokenData = Depends(get_current_user),
):
    incident = await queries.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    if incident.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this incident")

    return incident


@router.patch("/{incident_id}/status", response_model=Incident)
async def update_status(
    incident_id: str,
    new_status: IncidentStatus,
    actor_id: str,
    reason: str | None = None,
    commands: IncidentCommands = Depends(get_incident_commands),
    current_user: TokenData = Depends(get_current_user),
):
    try:
        cmd = UpdateIncidentStatusCommand(
            incident_id=incident_id,
            new_status=new_status,
            actor_id=current_user.user_id,
            organization_id=current_user.organization_id,
            reason=reason,
        )
        return await commands.update_status(cmd)
    except ValueError as e:
        msg = str(e)
        if "Not authorized" in msg:
            raise HTTPException(status_code=403, detail=msg)
        raise HTTPException(status_code=404, detail=msg)
