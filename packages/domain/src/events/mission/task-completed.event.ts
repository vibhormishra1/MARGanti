import { DomainEvent } from '../domain.event';

export class TaskCompletedEvent implements DomainEvent {
  public readonly dateTimeOccurred: Date;

  constructor(
    public readonly missionId: string,
    public readonly taskId: string,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): string {
    return this.missionId;
  }
}
