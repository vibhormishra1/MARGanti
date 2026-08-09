from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field

from src.marg_api.modules.incident.domain.models import GeoLocation


class ResourceCategory(str, Enum):
    VEHICLE = "VEHICLE"
    MEDICAL = "MEDICAL"
    FOOD_WATER = "FOOD_WATER"
    SHELTER = "SHELTER"
    COMM_DEVICE = "COMM_DEVICE"
    PERSONNEL = "PERSONNEL"


class MaintenanceStatus(str, Enum):
    OPERATIONAL = "OPERATIONAL"
    NEEDS_MAINTENANCE = "NEEDS_MAINTENANCE"
    OUT_OF_SERVICE = "OUT_OF_SERVICE"


class AllocationStatus(str, Enum):
    PENDING = "PENDING"
    IN_TRANSIT = "IN_TRANSIT"
    DEPLOYED = "DEPLOYED"
    RETURNED = "RETURNED"
    CONSUMED = "CONSUMED"


class ResourceQuantity(BaseModel):
    amount: float = Field(..., ge=0)
    unit: str


class Reservation(BaseModel):
    id: str
    reserved_by: str
    quantity: ResourceQuantity
    expires_at: datetime
    purpose: str


class MaintenanceRecord(BaseModel):
    id: str
    reported_issue: str
    reported_at: datetime
    status: str


class InventoryItem(BaseModel):
    id: str
    catalog_id: str
    category: ResourceCategory
    location: GeoLocation
    total_quantity: ResourceQuantity
    available_quantity: ResourceQuantity
    maintenance_status: MaintenanceStatus
    reservations: list[Reservation] = Field(default_factory=list)
    maintenance_records: list[MaintenanceRecord] = Field(default_factory=list)
    last_updated_at: datetime


class AllocatedResource(BaseModel):
    inventory_item_id: str
    quantity: ResourceQuantity


class AllocationTimelineEvent(BaseModel):
    timestamp: datetime
    action: str
    note: str | None = None


class ResourceAllocation(BaseModel):
    id: str
    incident_id: str
    status: AllocationStatus
    assigned_to: str
    allocations: list[AllocatedResource] = Field(default_factory=list)
    dispatched_at: datetime | None = None
    timeline: list[AllocationTimelineEvent] = Field(default_factory=list)
