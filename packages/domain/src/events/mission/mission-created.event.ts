import { DomainEvent } from '../domain.event';

export class MissionCreatedEvent implements DomainEvent {
  public readonly dateTimeOccurred: Date;

  constructor(
    public readonly missionId: string,
    public readonly commanderId: string,
    public readonly incidentId: string,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): string {
    return this.missionId;
  }
}
