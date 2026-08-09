from fastapi import APIRouter, Body, Depends, HTTPException, Query

from marg_api.core.dependencies import get_mission_commands, get_mission_queries
from marg_api.modules.mission.application.commands import (
    AddDependencyCommand,
    AssignTaskCommand,
    CreateMissionCommand,
    CreateTaskCommand,
    MissionCommands,
)
from marg_api.modules.mission.application.queries import MissionQueries
from marg_api.modules.mission.domain.models import Mission, Task

router = APIRouter(prefix="/missions", tags=["missions"])


@router.post("/", response_model=Mission, status_code=201)
async def create_mission(
    cmd: CreateMissionCommand,
    commands: MissionCommands = Depends(get_mission_commands),
):
    return await commands.create_mission(cmd)


@router.get("/", response_model=list[Mission])
async def list_missions(
    incident_id: str | None = Query(None),
    queries: MissionQueries = Depends(get_mission_queries),
):
    return await queries.list_missions(incident_id)


@router.get("/{mission_id}", response_model=Mission)
async def get_mission(
    mission_id: str,
    queries: MissionQueries = Depends(get_mission_queries),
):
    mission = await queries.get_mission(mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    return mission


@router.post("/{mission_id}/publish", response_model=Mission)
async def publish_mission(
    mission_id: str,
    commands: MissionCommands = Depends(get_mission_commands),
):
    try:
        return await commands.publish_mission(mission_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{mission_id}/complete", response_model=Mission)
async def complete_mission(
    mission_id: str,
    commands: MissionCommands = Depends(get_mission_commands),
):
    try:
        return await commands.complete_mission(mission_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{mission_id}/tasks", response_model=Task, status_code=201)
async def create_task(
    mission_id: str,
    cmd: CreateTaskCommand,
    commands: MissionCommands = Depends(get_mission_commands),
):
    try:
        return await commands.create_task(mission_id, cmd)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{mission_id}/tasks/{task_id}/dependencies", response_model=Mission)
async def add_dependency(
    mission_id: str,
    task_id: str,
    cmd: AddDependencyCommand,
    commands: MissionCommands = Depends(get_mission_commands),
):
    try:
        return await commands.add_dependency(mission_id, task_id, cmd)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{mission_id}/tasks/{task_id}/assign", response_model=Task)
async def assign_task(
    mission_id: str,
    task_id: str,
    cmd: AssignTaskCommand,
    commands: MissionCommands = Depends(get_mission_commands),
):
    try:
        return await commands.assign_task(mission_id, task_id, cmd)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{mission_id}/tasks/{task_id}/start", response_model=Task)
async def start_task(
    mission_id: str,
    task_id: str,
    commands: MissionCommands = Depends(get_mission_commands),
):
    try:
        return await commands.start_task(mission_id, task_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{mission_id}/tasks/{task_id}/complete", response_model=Task)
async def complete_task(
    mission_id: str,
    task_id: str,
    commands: MissionCommands = Depends(get_mission_commands),
):
    try:
        return await commands.complete_task(mission_id, task_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{mission_id}/tasks/{task_id}/checklist", response_model=Task)
async def add_checklist_item(
    mission_id: str,
    task_id: str,
    description: str = Body(..., embed=True),
    commands: MissionCommands = Depends(get_mission_commands),
):
    try:
        return await commands.add_checklist_item(mission_id, task_id, description)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{mission_id}/tasks/{task_id}/checklist/{item_id}", response_model=Task)
async def update_checklist_item(
    mission_id: str,
    task_id: str,
    item_id: str,
    is_completed: bool = Body(..., embed=True),
    responder_id: str = Body(..., embed=True),
    commands: MissionCommands = Depends(get_mission_commands),
):
    try:
        return await commands.update_checklist_item(mission_id, task_id, item_id, is_completed, responder_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
