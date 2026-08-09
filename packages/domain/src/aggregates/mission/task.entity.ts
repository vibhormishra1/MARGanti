import { Entity } from "../../entities/base.entity";
import { Result, ResultFactory } from "../../types/result.type";
import { DomainError } from "../../errors/domain.error";
import { TaskStatus } from "../../value-objects/task-status.enum";
import { Priority } from "../../value-objects/priority.enum";
import { Deadline } from "../../value-objects/deadline.vo";
import { ChecklistItem } from "./checklist-item.entity";

export interface TaskProps {
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignedResponderId?: string;
  assignedTeamId?: string;
  deadline?: Deadline;
  checklist: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export class Task extends Entity<TaskProps> {
  private constructor(props: TaskProps, id: string) {
    super(props, id);
  }

  public get title(): string {
    return this.props.title;
  }

  public get description(): string {
    return this.props.description;
  }

  public get status(): TaskStatus {
    return this.props.status;
  }

  public get priority(): Priority {
    return this.props.priority;
  }

  public get assignedResponderId(): string | undefined {
    return this.props.assignedResponderId;
  }

  public get assignedTeamId(): string | undefined {
    return this.props.assignedTeamId;
  }

  public get deadline(): Deadline | undefined {
    return this.props.deadline;
  }

  public get checklist(): ChecklistItem[] {
    return [...this.props.checklist];
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public assignToResponder(responderId: string): Result<void> {
    this.props.assignedResponderId = responderId;
    this.props.assignedTeamId = undefined;
    this.updateTimestamp();
    return ResultFactory.ok<void>(undefined);
  }

  public assignToTeam(teamId: string): Result<void> {
    this.props.assignedTeamId = teamId;
    this.props.assignedResponderId = undefined;
    this.updateTimestamp();
    return ResultFactory.ok<void>(undefined);
  }

  public unassign(): void {
    this.props.assignedResponderId = undefined;
    this.props.assignedTeamId = undefined;
    this.updateTimestamp();
  }

  public addChecklistItem(item: ChecklistItem): Result<void> {
    this.props.checklist.push(item);
    this.updateTimestamp();
    return ResultFactory.ok<void>(undefined);
  }

  public completeChecklistItem(itemId: string, responderId: string): Result<void> {
    const item = this.props.checklist.find(i => i.id === itemId);
    if (!item) {
      return ResultFactory.fail(new DomainError(`Checklist item ${itemId} not found in task ${this.id}.`));
    }
    const result = item.markCompleted(responderId);
    if (result.isSuccess) {
      this.updateTimestamp();
    }
    return result;
  }

  public start(): Result<void> {
    if (this.props.status === TaskStatus.COMPLETED) {
      return ResultFactory.fail(new DomainError('Cannot start an already completed task.'));
    }
    this.props.status = TaskStatus.IN_PROGRESS;
    this.updateTimestamp();
    return ResultFactory.ok<void>(undefined);
  }

  public block(): Result<void> {
    if (this.props.status === TaskStatus.COMPLETED) {
      return ResultFactory.fail(new DomainError('Cannot block a completed task.'));
    }
    this.props.status = TaskStatus.BLOCKED;
    this.updateTimestamp();
    return ResultFactory.ok<void>(undefined);
  }

  public complete(): Result<void> {
    const incompleteChecklist = this.props.checklist.filter(i => !i.isCompleted);
    if (incompleteChecklist.length > 0) {
      return ResultFactory.fail(new DomainError('Cannot complete task with unfinished checklist items.'));
    }
    this.props.status = TaskStatus.COMPLETED;
    this.updateTimestamp();
    return ResultFactory.ok<void>(undefined);
  }

  public resetToPending(): void {
    this.props.status = TaskStatus.PENDING;
    this.updateTimestamp();
  }

  private updateTimestamp(): void {
    this.props.updatedAt = new Date();
  }

  public static create(
    props: Omit<TaskProps, 'status' | 'checklist' | 'createdAt' | 'updatedAt'>,
    id?: string
  ): Result<Task> {
    if (!props.title || props.title.trim().length === 0) {
      return ResultFactory.fail(new DomainError('Task title cannot be empty.'));
    }

    const task = new Task({
      ...props,
      title: props.title.trim(),
      status: TaskStatus.PENDING,
      checklist: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }, id ?? crypto.randomUUID());

    return ResultFactory.ok<Task>(task);
  }

  public static reconstitute(props: TaskProps, id: string): Task {
    return new Task(props, id);
  }
}
