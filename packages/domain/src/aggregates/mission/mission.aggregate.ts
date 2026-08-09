import { AggregateRoot } from "../aggregate-root";
import { Result, ResultFactory } from "../../types/result.type";
import { DomainError } from "../../errors/domain.error";
import { Task } from "./task.entity";
import { MissionStatus } from "../../value-objects/mission-status.enum";
import { TaskStatus } from "../../value-objects/task-status.enum";
import { Priority } from "../../value-objects/priority.enum";
import { Objective } from "../../value-objects/objective.vo";
import { Deadline } from "../../value-objects/deadline.vo";
import { TaskDependency } from "../../value-objects/task-dependency.vo";

export interface MissionProps {
  title: string;
  incidentId: string;
  commanderId: string;
  status: MissionStatus;
  priority: Priority;
  objective: Objective;
  deadline?: Deadline;
  tasks: Task[];
  taskDependencies: Map<string, TaskDependency[]>;
  createdAt: Date;
  updatedAt: Date;
}

export class Mission extends AggregateRoot<MissionProps> {
  private constructor(props: MissionProps, id: string) {
    super(props, id);
  }

  public get title(): string {
    return this.props.title;
  }

  public get incidentId(): string {
    return this.props.incidentId;
  }

  public get commanderId(): string {
    return this.props.commanderId;
  }

  public get status(): MissionStatus {
    return this.props.status;
  }

  public get priority(): Priority {
    return this.props.priority;
  }

  public get objective(): Objective {
    return this.props.objective;
  }

  public get deadline(): Deadline | undefined {
    return this.props.deadline;
  }

  public get tasks(): Task[] {
    return [...this.props.tasks];
  }

  public get taskDependencies(): Map<string, TaskDependency[]> {
    return new Map(this.props.taskDependencies);
  }
  
  public get createdAt(): Date {
    return this.props.createdAt;
  }
  
  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public addTask(task: Task): Result<void> {
    if (this.props.status === MissionStatus.COMPLETED || this.props.status === MissionStatus.ABORTED) {
      return ResultFactory.fail(new DomainError('Cannot add tasks to a completed or aborted mission.'));
    }
    
    if (this.props.tasks.some(t => t.id === task.id)) {
      return ResultFactory.fail(new DomainError(`Task with id ${task.id} already exists in mission.`));
    }

    this.props.tasks.push(task);
    this.props.taskDependencies.set(task.id, []);
    this.updateTimestamp();
    return ResultFactory.ok<void>(undefined);
  }

  public addTaskDependency(taskId: string, dependsOnTaskId: string, isHard: boolean = true): Result<void> {
    if (this.props.status !== MissionStatus.DRAFT && this.props.status !== MissionStatus.ACTIVE) {
       return ResultFactory.fail(new DomainError('Can only modify dependencies for DRAFT or ACTIVE missions.'));
    }

    if (!this.props.tasks.some(t => t.id === taskId)) {
      return ResultFactory.fail(new DomainError(`Task ${taskId} not found in mission.`));
    }

    if (!this.props.tasks.some(t => t.id === dependsOnTaskId)) {
      return ResultFactory.fail(new DomainError(`Target dependency Task ${dependsOnTaskId} not found in mission.`));
    }

    if (taskId === dependsOnTaskId) {
      return ResultFactory.fail(new DomainError('A task cannot depend on itself.'));
    }

    const depResult = TaskDependency.create(dependsOnTaskId, isHard);
    if (depResult.isFailure) {
      return ResultFactory.fail(depResult.getError());
    }

    const existingDeps = this.props.taskDependencies.get(taskId) || [];
    
    if (existingDeps.some(d => d.dependsOnTaskId === dependsOnTaskId)) {
      return ResultFactory.ok<void>(undefined);
    }

    const tempMap = new Map(this.props.taskDependencies);
    tempMap.set(taskId, [...existingDeps, depResult.getValue()]);
    
    if (this.hasCycle(tempMap)) {
      return ResultFactory.fail(new DomainError(`Adding dependency ${dependsOnTaskId} -> ${taskId} creates a cycle.`));
    }

    this.props.taskDependencies.set(taskId, tempMap.get(taskId)!);
    this.updateTimestamp();
    return ResultFactory.ok<void>(undefined);
  }

  public startTask(taskId: string): Result<void> {
    if (this.props.status !== MissionStatus.ACTIVE) {
      return ResultFactory.fail(new DomainError('Cannot start a task unless the mission is ACTIVE.'));
    }

    const task = this.getTask(taskId);
    if (!task) {
      return ResultFactory.fail(new DomainError(`Task ${taskId} not found.`));
    }

    const deps = this.props.taskDependencies.get(taskId) || [];
    for (const dep of deps) {
      if (dep.isHardDependency) {
        const targetTask = this.getTask(dep.dependsOnTaskId);
        if (targetTask && targetTask.status !== TaskStatus.COMPLETED) {
           return ResultFactory.fail(new DomainError(`Cannot start task ${taskId}. Hard dependency ${dep.dependsOnTaskId} is not completed.`));
        }
      }
    }

    const startResult = task.start();
    if (startResult.isSuccess) {
      this.updateTimestamp();
    }
    return startResult;
  }

  public completeTask(taskId: string): Result<void> {
    const task = this.getTask(taskId);
    if (!task) {
      return ResultFactory.fail(new DomainError(`Task ${taskId} not found.`));
    }

    const compResult = task.complete();
    if (compResult.isFailure) {
      return compResult;
    }

    this.updateTimestamp();
    return ResultFactory.ok<void>(undefined);
  }

  public publishMission(): Result<void> {
    if (this.props.status !== MissionStatus.DRAFT) {
      return ResultFactory.fail(new DomainError('Can only publish DRAFT missions.'));
    }

    if (this.props.tasks.length === 0) {
      return ResultFactory.fail(new DomainError('Cannot publish a mission with no tasks.'));
    }

    this.props.status = MissionStatus.ACTIVE;
    this.updateTimestamp();
    return ResultFactory.ok<void>(undefined);
  }

  public completeMission(): Result<void> {
    if (this.props.status !== MissionStatus.ACTIVE) {
      return ResultFactory.fail(new DomainError('Can only complete ACTIVE missions.'));
    }

    const hasIncompleteHardTasks = this.props.tasks.some(t => t.status !== TaskStatus.COMPLETED);
    if (hasIncompleteHardTasks) {
       return ResultFactory.fail(new DomainError('Cannot complete mission while tasks are still incomplete.'));
    }

    this.props.status = MissionStatus.COMPLETED;
    this.updateTimestamp();
    return ResultFactory.ok<void>(undefined);
  }

  private getTask(taskId: string): Task | undefined {
    return this.props.tasks.find(t => t.id === taskId);
  }

  private updateTimestamp(): void {
    this.props.updatedAt = new Date();
  }

  private hasCycle(graph: Map<string, TaskDependency[]>): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      if (recStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recStack.add(nodeId);

      const children = graph.get(nodeId) || [];
      for (const child of children) {
        if (dfs(child.dependsOnTaskId)) {
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const nodeId of graph.keys()) {
      if (dfs(nodeId)) {
        return true;
      }
    }

    return false;
  }

  public static create(
    props: Omit<MissionProps, 'status' | 'tasks' | 'taskDependencies' | 'createdAt' | 'updatedAt'>,
    id?: string
  ): Result<Mission> {
    if (!props.title || props.title.trim().length === 0) {
      return ResultFactory.fail(new DomainError('Mission title cannot be empty.'));
    }

    const mission = new Mission({
      ...props,
      title: props.title.trim(),
      status: MissionStatus.DRAFT,
      tasks: [],
      taskDependencies: new Map<string, TaskDependency[]>(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }, id ?? crypto.randomUUID());

    return ResultFactory.ok<Mission>(mission);
  }

  public static reconstitute(props: MissionProps, id: string): Mission {
    return new Mission(props, id);
  }
}

