import { DomainEvent } from "../../events/domain.event";
import { GeoLocation } from "../../value-objects/geo-location.vo";

export class ResponderCheckedInEvent implements DomainEvent {
  public readonly dateTimeOccurred: Date;
  public readonly responderId: string;
  public readonly location: GeoLocation | null;

  constructor(responderId: string, location: GeoLocation | null) {
    this.dateTimeOccurred = new Date();
    this.responderId = responderId;
    this.location = location;
  }

  getAggregateId(): string {
    return this.responderId;
  }
}
