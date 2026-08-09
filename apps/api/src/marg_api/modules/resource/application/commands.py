import uuid
from datetime import UTC, datetime

from pydantic import BaseModel

from marg_api.modules.resource.domain.models import (
    AllocatedResource,
    AllocationStatus,
    AllocationTimelineEvent,
    Reservation,
    ResourceAllocation,
    ResourceQuantity,
)
from marg_api.modules.resource.infrastructure.repositories import (
    AllocationRepository,
    InventoryRepository,
)


class ReserveResourceCommand(BaseModel):
    inventory_item_id: str
    reserved_by: str
    quantity: ResourceQuantity
    expires_at: datetime
    purpose: str


class AllocateResourceCommand(BaseModel):
    incident_id: str
    assigned_to: str
    allocations: list[AllocatedResource]


class ResourceCommands:
    def __init__(self, inventory_repo: InventoryRepository, allocation_repo: AllocationRepository):
        self.inventory_repo = inventory_repo
        self.allocation_repo = allocation_repo

    async def reserve_resource(self, command: ReserveResourceCommand) -> Reservation:
        item = await self.inventory_repo.get_by_id(command.inventory_item_id)
        if not item:
            raise ValueError(f"InventoryItem {command.inventory_item_id} not found")

        if item.maintenance_status == "OUT_OF_SERVICE":
            raise ValueError("Cannot reserve out of service items")

        if item.available_quantity.unit != command.quantity.unit:
            raise ValueError("Unit mismatch")

        if item.available_quantity.amount < command.quantity.amount:
            raise ValueError("Insufficient quantity available")

        reservation = Reservation(
            id=str(uuid.uuid4()),
            reserved_by=command.reserved_by,
            quantity=command.quantity,
            expires_at=command.expires_at,
            purpose=command.purpose,
        )

        item.reservations.append(reservation)
        item.available_quantity.amount -= command.quantity.amount
        item.last_updated_at = datetime.now(UTC)

        await self.inventory_repo.save(item)
        return reservation

    async def create_allocation(self, command: AllocateResourceCommand) -> ResourceAllocation:
        now = datetime.now(UTC)

        allocation = ResourceAllocation(
            id=str(uuid.uuid4()),
            incident_id=command.incident_id,
            status=AllocationStatus.PENDING,
            assigned_to=command.assigned_to,
            allocations=command.allocations,
            timeline=[AllocationTimelineEvent(timestamp=now, action="CREATED")],
        )

        await self.allocation_repo.save(allocation)
        return allocation
