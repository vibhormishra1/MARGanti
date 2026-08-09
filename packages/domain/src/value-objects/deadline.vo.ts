import { ValueObject } from './base.value-object';
import { DomainError } from '../errors/domain.error';
import { Result, ResultFactory } from '../types/result.type';

export interface DeadlineProps {
  targetDate: Date;
}

export class Deadline extends ValueObject<DeadlineProps> {
  private constructor(props: DeadlineProps) {
    super(props);
  }

  public get targetDate(): Date {
    return new Date(this.props.targetDate.getTime());
  }

  public isOverdue(currentDate: Date = new Date()): boolean {
    return this.props.targetDate.getTime() < currentDate.getTime();
  }

  public timeRemainingMs(currentDate: Date = new Date()): number {
    return Math.max(0, this.props.targetDate.getTime() - currentDate.getTime());
  }

  public static create(targetDate: Date): Result<Deadline> {
    if (!(targetDate instanceof Date) || isNaN(targetDate.getTime())) {
      return ResultFactory.fail(new DomainError('Invalid target date provided for deadline.'));
    }
    return ResultFactory.ok<Deadline>(new Deadline({ targetDate }));
  }
}
