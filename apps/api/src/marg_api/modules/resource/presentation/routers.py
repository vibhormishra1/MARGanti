from fastapi import APIRouter, Depends, HTTPException, Query

from marg_api.core.dependencies import get_resource_commands, get_resource_queries
from marg_api.core.security import TokenData, get_current_user
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
    current_user: TokenData = Depends(get_current_user),
):
    items = await queries.list_inventory(category)
    return [i for i in items if getattr(i, "organization_id", None) == current_user.organization_id or not hasattr(i, "organization_id")]


@router.post("/inventory/{item_id}/reserve", response_model=Reservation)
async def reserve_resource(
    item_id: str,
    cmd: ReserveResourceCommand,
    commands: ResourceCommands = Depends(get_resource_commands),
    current_user: TokenData = Depends(get_current_user),
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
    current_user: TokenData = Depends(get_current_user),
):
    # Depending on domain logic, we ideally want to enforce tenant check 
    # either by adding organization_id to AllocateResourceCommand or trusting incident_id isolation
    return await commands.create_allocation(cmd)


@router.get("/allocations/incident/{incident_id}", response_model=list[ResourceAllocation])
async def get_incident_allocations(
    incident_id: str,
    queries: ResourceQueries = Depends(get_resource_queries),
    current_user: TokenData = Depends(get_current_user),
):
    return await queries.get_incident_allocations(incident_id)
