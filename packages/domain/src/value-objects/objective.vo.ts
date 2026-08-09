import { ValueObject } from './base.value-object';
import { DomainError } from '../errors/domain.error';
import { Result, ResultFactory } from '../types/result.type';

export interface ObjectiveProps {
  description: string;
  successCriteria: string[];
}

export class Objective extends ValueObject<ObjectiveProps> {
  private constructor(props: ObjectiveProps) {
    super(props);
  }

  public get description(): string {
    return this.props.description;
  }

  public get successCriteria(): string[] {
    return [...this.props.successCriteria];
  }

  public static create(props: ObjectiveProps): Result<Objective> {
    if (!props.description || props.description.trim().length === 0) {
      return ResultFactory.fail(new DomainError('Objective description cannot be empty.'));
    }
    
    if (!props.successCriteria || props.successCriteria.length === 0) {
      return ResultFactory.fail(new DomainError('Objective must have at least one success criterion.'));
    }

    const cleanCriteria = props.successCriteria
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (cleanCriteria.length === 0) {
      return ResultFactory.fail(new DomainError('Objective success criteria cannot be empty strings.'));
    }

    return ResultFactory.ok<Objective>(new Objective({
      description: props.description.trim(),
      successCriteria: cleanCriteria,
    }));
  }
}
