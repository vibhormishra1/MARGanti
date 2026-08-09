import { Entity } from "../../entities/base.entity";
import { Result, ResultFactory } from "../../types/result.type";
import { DomainError } from "../../errors/domain.error";

export interface ChecklistItemProps {
  description: string;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
}

export class ChecklistItem extends Entity<ChecklistItemProps> {
  private constructor(props: ChecklistItemProps, id: string) {
    super(props, id);
  }

  public get description(): string {
    return this.props.description;
  }

  public get isCompleted(): boolean {
    return this.props.isCompleted;
  }

  public get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  public get completedBy(): string | undefined {
    return this.props.completedBy;
  }

  public markCompleted(responderId: string): Result<void> {
    if (this.props.isCompleted) {
      return ResultFactory.ok<void>(undefined);
    }

    this.props.isCompleted = true;
    this.props.completedAt = new Date();
    this.props.completedBy = responderId;
    return ResultFactory.ok<void>(undefined);
  }

  public markIncomplete(): Result<void> {
    this.props.isCompleted = false;
    this.props.completedAt = undefined;
    this.props.completedBy = undefined;
    return ResultFactory.ok<void>(undefined);
  }

  public static create(description: string, id?: string): Result<ChecklistItem> {
    if (!description || description.trim().length === 0) {
      return ResultFactory.fail(new DomainError('Checklist item description cannot be empty.'));
    }

    return ResultFactory.ok<ChecklistItem>(new ChecklistItem({
      description: description.trim(),
      isCompleted: false,
    }, id ?? crypto.randomUUID()));
  }

  public static reconstitute(props: ChecklistItemProps, id: string): ChecklistItem {
    return new ChecklistItem(props, id);
  }
}
