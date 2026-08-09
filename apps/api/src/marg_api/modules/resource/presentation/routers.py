from fastapi import APIRouter, Depends, HTTPException, Query

from marg_api.core.dependencies import get_resource_commands, get_resource_queries
from marg_api.modules.resource.application.commands import (
    AllocateResourceCommand,
    ReserveResourceCommand,
    ResourceCommands,
)
from marg_api.modules.resource.application.queries import ResourceQueries
from marg_api.modules.resource.domain.models import (
    InventoryItem,
    Reservation,
    ResourceAllocation,
    ResourceCategory,
)

router = APIRouter(prefix="/resources", tags=["resources"])


@router.get("/inventory", response_model=list[InventoryItem])
async def list_inventory(
    category: ResourceCategory | None = Query(None),
    queries: ResourceQueries = Depends(get_resource_queries),
):
    return await queries.list_inventory(category)


@router.post("/inventory/{item_id}/reserve", response_model=Reservation)
async def reserve_resource(
    item_id: str,
    cmd: ReserveResourceCommand,
    commands: ResourceCommands = Depends(get_resource_commands),
):
    if cmd.inventory_item_id != item_id:
        raise HTTPException(status_code=400, detail="Item ID mismatch")
    try:
        return await commands.reserve_resource(cmd)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/allocations", response_model=ResourceAllocation)
async def create_allocation(
    cmd: AllocateResourceCommand,
    commands: ResourceCommands = Depends(get_resource_commands),
):
    return await commands.create_allocation(cmd)


@router.get("/allocations/incident/{incident_id}", response_model=list[ResourceAllocation])
async def get_incident_allocations(
    incident_id: str,
    queries: ResourceQueries = Depends(get_resource_queries),
):
    return await queries.get_incident_allocations(incident_id)
