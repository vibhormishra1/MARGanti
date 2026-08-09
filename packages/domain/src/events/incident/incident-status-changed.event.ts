import { DomainEvent } from "../../events/domain.event";
import { IncidentStatus } from "../../aggregates/incident/incident-status.enum";

export class IncidentStatusChangedEvent implements DomainEvent {
  public readonly dateTimeOccurred: Date;
  public readonly incidentId: string;
  public readonly oldStatus: IncidentStatus;
  public readonly newStatus: IncidentStatus;
  public readonly changedBy: string;

  constructor(
    incidentId: string,
    oldStatus: IncidentStatus,
    newStatus: IncidentStatus,
    changedBy: string
  ) {
    this.dateTimeOccurred = new Date();
    this.incidentId = incidentId;
    this.oldStatus = oldStatus;
    this.newStatus = newStatus;
    this.changedBy = changedBy;
  }

  getAggregateId(): string {
    return this.incidentId;
  }
}
