import { DomainEvent } from '../domain.event';

export class TaskAssignedEvent implements DomainEvent {
  public readonly dateTimeOccurred: Date;

  constructor(
    public readonly missionId: string,
    public readonly taskId: string,
    public readonly responderId?: string,
    public readonly teamId?: string,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): string {
    return this.missionId;
  }
}
