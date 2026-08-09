from fastapi import APIRouter, Depends, HTTPException, Query

from marg_api.core.dependencies import get_workforce_commands, get_workforce_queries
from marg_api.modules.workforce.application.commands import (
    CheckInCommand,
    CreateTeamCommand,
    WorkforceCommands,
)
from marg_api.modules.workforce.application.queries import WorkforceQueries
from marg_api.modules.workforce.domain.models import Responder, Team

router = APIRouter(prefix="/workforce", tags=["workforce"])


@router.post("/teams", response_model=Team)
async def create_team(
    cmd: CreateTeamCommand,
    commands: WorkforceCommands = Depends(get_workforce_commands),
):
    return await commands.create_team(cmd)


@router.post("/responders/{responder_id}/checkin", response_model=Responder)
async def check_in_responder(
    responder_id: str,
    cmd: CheckInCommand,
    commands: WorkforceCommands = Depends(get_workforce_commands),
):
    if cmd.responder_id != responder_id:
        raise HTTPException(status_code=400, detail="Responder ID mismatch")
    try:
        return await commands.check_in(cmd)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/responders", response_model=list[Responder])
async def list_responders(
    organization_id: str = Query(...),
    queries: WorkforceQueries = Depends(get_workforce_queries),
):
    return await queries.list_responders(organization_id)
