import { ValueObject } from './base.value-object';
import { DomainError } from '../errors/domain.error';
import { Result, ResultFactory } from '../types/result.type';

export interface TaskDependencyProps {
  dependsOnTaskId: string;
  isHardDependency: boolean;
}

export class TaskDependency extends ValueObject<TaskDependencyProps> {
  private constructor(props: TaskDependencyProps) {
    super(props);
  }

  public get dependsOnTaskId(): string {
    return this.props.dependsOnTaskId;
  }

  public get isHardDependency(): boolean {
    return this.props.isHardDependency;
  }

  public static create(dependsOnTaskId: string, isHardDependency: boolean = true): Result<TaskDependency> {
    if (!dependsOnTaskId || dependsOnTaskId.trim().length === 0) {
      return ResultFactory.fail(new DomainError('Dependency must reference a valid TaskId.'));
    }

    return ResultFactory.ok<TaskDependency>(new TaskDependency({
      dependsOnTaskId: dependsOnTaskId.trim(),
      isHardDependency
    }));
  }
}
