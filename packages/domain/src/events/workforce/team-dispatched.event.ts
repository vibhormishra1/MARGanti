import { DomainEvent } from "../../events/domain.event";

export class TeamDispatchedEvent implements DomainEvent {
  public readonly dateTimeOccurred: Date;
  public readonly teamId: string;
  public readonly incidentId: string;

  constructor(teamId: string, incidentId: string) {
    this.dateTimeOccurred = new Date();
    this.teamId = teamId;
    this.incidentId = incidentId;
  }

  getAggregateId(): string {
    return this.teamId;
  }
}
