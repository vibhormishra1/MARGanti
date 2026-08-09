import { AggregateRoot } from "../../aggregates/aggregate-root";
import { ResourceQuantity } from "../../value-objects/resource-quantity.vo";
import { ResultFactory, Result } from "../../types/result.type";
import { DomainError } from "../../errors/domain.error";
import { ResourceAllocatedEvent } from "../../events/resource/resource-allocated.event";

export enum AllocationStatus {
  PENDING = "PENDING",
  IN_TRANSIT = "IN_TRANSIT",
  DEPLOYED = "DEPLOYED",
  RETURNED = "RETURNED",
  CONSUMED = "CONSUMED"
}

export interface AllocatedResource {
  inventoryItemId: string;
  quantity: ResourceQuantity;
}

export interface ResourceAllocationProps {
  incidentId: string;
  allocations: AllocatedResource[];
  status: AllocationStatus;
  assignedTo: string;
  dispatchedAt?: Date;
  timeline: { timestamp: Date, action: string, note?: string }[];
}

export class ResourceAllocation extends AggregateRoot<ResourceAllocationProps> {
  private constructor(props: ResourceAllocationProps, id: string) {
    super(props, id);
  }

  get incidentId(): string { return this.props.incidentId; }
  get status(): AllocationStatus { return this.props.status; }
  get assignedTo(): string { return this.props.assignedTo; }
  get allocations(): AllocatedResource[] { return [...this.props.allocations]; }

  public static allocate(
    id: string,
    incidentId: string,
    assignedTo: string,
    allocations: AllocatedResource[]
  ): Result<ResourceAllocation> {
    if (allocations.length === 0) {
      return ResultFactory.fail(new DomainError("Must allocate at least one resource."));
    }

    const allocation = new ResourceAllocation({
      incidentId,
      assignedTo,
      allocations,
      status: AllocationStatus.PENDING,
      timeline: [{ timestamp: new Date(), action: "CREATED" }]
    }, id);

    allocation.addDomainEvent(new ResourceAllocatedEvent(id, incidentId, assignedTo));
    
    return ResultFactory.ok(allocation);
  }

  public updateStatus(newStatus: AllocationStatus, note?: string): void {
    this.props.status = newStatus;
    if (newStatus === AllocationStatus.IN_TRANSIT && !this.props.dispatchedAt) {
      this.props.dispatchedAt = new Date();
    }
    this.props.timeline.push({ timestamp: new Date(), action: `STATUS_CHANGED_TO_${newStatus}`, note });
  }
}
