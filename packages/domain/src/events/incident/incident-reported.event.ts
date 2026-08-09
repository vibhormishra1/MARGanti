import { DomainEvent } from "../../events/domain.event";
import { IncidentPriority } from "../../aggregates/incident/incident-priority.enum";
import { GeoLocation } from "../../value-objects/geo-location.vo";

export class IncidentReportedEvent implements DomainEvent {
  public readonly dateTimeOccurred: Date;
  public readonly incidentId: string;
  public readonly reporterId: string;
  public readonly title: string;
  public readonly priority: IncidentPriority;
  public readonly location: GeoLocation;

  constructor(
    incidentId: string,
    reporterId: string,
    title: string,
    priority: IncidentPriority,
    location: GeoLocation
  ) {
    this.dateTimeOccurred = new Date();
    this.incidentId = incidentId;
    this.reporterId = reporterId;
    this.title = title;
    this.priority = priority;
    this.location = location;
  }

  getAggregateId(): string {
    return this.incidentId;
  }
}
