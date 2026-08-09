from abc import ABC, abstractmethod

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from marg_api.infrastructure.database.models import InventoryItemModel, ResourceAllocationModel
from marg_api.modules.incident.domain.models import GeoLocation
from marg_api.modules.resource.domain.models import (
    AllocatedResource,
    AllocationStatus,
    AllocationTimelineEvent,
    InventoryItem,
    MaintenanceRecord,
    MaintenanceStatus,
    Reservation,
    ResourceAllocation,
    ResourceCategory,
    ResourceQuantity,
)


class InventoryRepository(ABC):
    @abstractmethod
    async def save(self, item: InventoryItem) -> None:
        pass

    @abstractmethod
    async def get_by_id(self, item_id: str) -> InventoryItem | None:
        pass

    @abstractmethod
    async def search_by_category(self, category: ResourceCategory) -> list[InventoryItem]:
        pass


class AllocationRepository(ABC):
    @abstractmethod
    async def save(self, allocation: ResourceAllocation) -> None:
        pass

    @abstractmethod
    async def get_by_id(self, allocation_id: str) -> ResourceAllocation | None:
        pass

    @abstractmethod
    async def find_by_incident_id(self, incident_id: str) -> list[ResourceAllocation]:
        pass


class SQLAlchemyInventoryRepository(InventoryRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_domain(self, model: InventoryItemModel) -> InventoryItem:
        return InventoryItem(
            id=model.id,
            catalog_id=model.catalog_id,
            category=ResourceCategory(model.category),
            location=GeoLocation(
                latitude=model.latitude,
                longitude=model.longitude,
            ),
            total_quantity=ResourceQuantity(**model.total_quantity),
            available_quantity=ResourceQuantity(**model.available_quantity),
            maintenance_status=MaintenanceStatus(model.maintenance_status),
            reservations=[
                Reservation(
                    id=r["id"],
                    reserved_by=r["reserved_by"],
                    quantity=ResourceQuantity(**r["quantity"]),
                    expires_at=r["expires_at"],
                    purpose=r["purpose"],
                )
                for r in (model.reservations or [])
            ],
            maintenance_records=[
                MaintenanceRecord(
                    id=m["id"],
                    reported_issue=m["reported_issue"],
                    reported_at=m["reported_at"],
                    status=m["status"],
                )
                for m in (model.maintenance_records or [])
            ],
            last_updated_at=model.last_updated_at,
        )

    async def save(self, item: InventoryItem) -> None:
        model = await self.session.get(InventoryItemModel, item.id)
        res_json = [
            {
                "id": r.id,
                "reserved_by": r.reserved_by,
                "quantity": r.quantity.model_dump(),
                "expires_at": r.expires_at.isoformat() if r.expires_at else None,
                "purpose": r.purpose,
            }
            for r in item.reservations
        ]
        maint_json = [
            {
                "id": m.id,
                "reported_issue": m.reported_issue,
                "reported_at": m.reported_at.isoformat() if m.reported_at else None,
                "status": m.status,
            }
            for m in item.maintenance_records
        ]
        if model is None:
            model = InventoryItemModel(
                id=item.id,
                catalog_id=item.catalog_id,
                category=item.category.value if hasattr(item.category, "value") else item.category,
                latitude=item.location.latitude,
                longitude=item.location.longitude,
                total_quantity=item.total_quantity.model_dump(),
                available_quantity=item.available_quantity.model_dump(),
                maintenance_status=item.maintenance_status.value
                if hasattr(item.maintenance_status, "value")
                else item.maintenance_status,
                reservations=res_json,
                maintenance_records=maint_json,
                last_updated_at=item.last_updated_at,
            )
            self.session.add(model)
        else:
            model.catalog_id = item.catalog_id
            model.category = item.category.value if hasattr(item.category, "value") else item.category
            model.latitude = item.location.latitude
            model.longitude = item.location.longitude
            model.total_quantity = item.total_quantity.model_dump()
            model.available_quantity = item.available_quantity.model_dump()
            model.maintenance_status = (
                item.maintenance_status.value if hasattr(item.maintenance_status, "value") else item.maintenance_status
            )
            model.reservations = res_json
            model.maintenance_records = maint_json
            model.last_updated_at = item.last_updated_at
        await self.session.flush()

    async def get_by_id(self, item_id: str) -> InventoryItem | None:
        model = await self.session.get(InventoryItemModel, item_id)
        if not model:
            return None
        return self._to_domain(model)

    async def search_by_category(self, category: ResourceCategory) -> list[InventoryItem]:
        stmt = select(InventoryItemModel).where(
            InventoryItemModel.category == (category.value if hasattr(category, "value") else category)
        )
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_domain(m) for m in models]


class SQLAlchemyAllocationRepository(AllocationRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_domain(self, model: ResourceAllocationModel) -> ResourceAllocation:
        return ResourceAllocation(
            id=model.id,
            incident_id=model.incident_id,
            status=AllocationStatus(model.status),
            assigned_to=model.assigned_to,
            allocations=[
                AllocatedResource(
                    inventory_item_id=a["inventory_item_id"],
                    quantity=ResourceQuantity(**a["quantity"]),
                )
                for a in (model.allocations or [])
            ],
            dispatched_at=model.dispatched_at,
            timeline=[
                AllocationTimelineEvent(
                    timestamp=t["timestamp"],
                    action=t["action"],
                    note=t.get("note"),
                )
                for t in (model.timeline or [])
            ],
        )

    async def save(self, allocation: ResourceAllocation) -> None:
        alloc_json = [
            {
                "inventory_item_id": a.inventory_item_id,
                "quantity": a.quantity.model_dump(),
            }
            for a in allocation.allocations
        ]
        timeline_json = [
            {
                "timestamp": t.timestamp.isoformat() if t.timestamp else None,
                "action": t.action,
                "note": t.note,
            }
            for t in allocation.timeline
        ]
        model = await self.session.get(ResourceAllocationModel, allocation.id)
        if model is None:
            model = ResourceAllocationModel(
                id=allocation.id,
                incident_id=allocation.incident_id,
                status=allocation.status.value if hasattr(allocation.status, "value") else allocation.status,
                assigned_to=allocation.assigned_to,
                allocations=alloc_json,
                dispatched_at=allocation.dispatched_at,
                timeline=timeline_json,
            )
            self.session.add(model)
        else:
            model.incident_id = allocation.incident_id
            model.status = allocation.status.value if hasattr(allocation.status, "value") else allocation.status
            model.assigned_to = allocation.assigned_to
            model.allocations = alloc_json
            model.dispatched_at = allocation.dispatched_at
            model.timeline = timeline_json
        await self.session.flush()

    async def get_by_id(self, allocation_id: str) -> ResourceAllocation | None:
        model = await self.session.get(ResourceAllocationModel, allocation_id)
        if not model:
            return None
        return self._to_domain(model)

    async def find_by_incident_id(self, incident_id: str) -> list[ResourceAllocation]:
        stmt = select(ResourceAllocationModel).where(ResourceAllocationModel.incident_id == incident_id)
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_domain(m) for m in models]
