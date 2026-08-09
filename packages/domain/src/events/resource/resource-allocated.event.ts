import { DomainEvent } from "../../events/domain.event";

export class ResourceAllocatedEvent implements DomainEvent {
  public readonly dateTimeOccurred: Date;
  public readonly allocationId: string;
  public readonly incidentId: string;
  public readonly assignedTo: string;

  constructor(
    allocationId: string,
    incidentId: string,
    assignedTo: string
  ) {
    this.dateTimeOccurred = new Date();
    this.allocationId = allocationId;
    this.incidentId = incidentId;
    this.assignedTo = assignedTo;
  }

  getAggregateId(): string {
    return this.allocationId;
  }
}
