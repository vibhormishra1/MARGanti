from marg_api.modules.resource.domain.models import (
    InventoryItem,
    ResourceAllocation,
    ResourceCategory,
)
from marg_api.modules.resource.infrastructure.repositories import (
    AllocationRepository,
    InventoryRepository,
)


class ResourceQueries:
    def __init__(self, inventory_repo: InventoryRepository, allocation_repo: AllocationRepository):
        self.inventory_repo = inventory_repo
        self.allocation_repo = allocation_repo

    async def list_inventory(self, category: ResourceCategory | None = None) -> list[InventoryItem]:
        if category:
            return await self.inventory_repo.search_by_category(category)
        return []

    async def get_incident_allocations(self, incident_id: str) -> list[ResourceAllocation]:
        return await self.allocation_repo.find_by_incident_id(incident_id)
