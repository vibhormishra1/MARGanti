import { IMissionRepository, Mission, Task, ChecklistItem, MissionStatus, TaskStatus, Priority, Objective, Deadline, TaskDependency } from "@marg/domain";
import { StorageAdapter } from "./storage.adapter";

export class MissionLocalRepository implements IMissionRepository {
  private readonly STORE_NAME = "missions";

  constructor(private readonly storageAdapter: StorageAdapter) {}

  public async findById(id: string): Promise<Mission | null> {
    const record = await this.storageAdapter.get<any>(this.STORE_NAME, id);
    if (!record) {
      return null;
    }
    return this.toDomain(record);
  }

  public async save(mission: Mission): Promise<void> {
    const record = this.toPersistence(mission);
    await this.storageAdapter.save(this.STORE_NAME, record);
  }

  public async exists(id: string): Promise<boolean> {
    const record = await this.storageAdapter.get<any>(this.STORE_NAME, id);
    return record !== null;
  }

  public async delete(id: string): Promise<void> {
    await this.storageAdapter.delete(this.STORE_NAME, id);
  }

  public async findActiveByIncident(incidentId: string): Promise<Mission[]> {
    const records = await this.storageAdapter.query<any>({
      storeName: this.STORE_NAME,
      indexName: "incidentId",
      indexValue: incidentId,
    });
    return records
      .map(r => this.toDomain(r))
      .filter(m => m.status === MissionStatus.ACTIVE);
  }

  public async findByCommander(commanderId: string): Promise<Mission[]> {
    const records = await this.storageAdapter.query<any>({
      storeName: this.STORE_NAME,
      indexName: "commanderId",
      indexValue: commanderId,
    });
    return records.map(r => this.toDomain(r));
  }

  private toPersistence(mission: Mission): any {
    const depsArray: Record<string, Array<{ dependsOnTaskId: string; isHardDependency: boolean }>> = {};
    mission.taskDependencies.forEach((deps, taskId) => {
      depsArray[taskId] = deps.map(d => ({
        dependsOnTaskId: d.dependsOnTaskId,
        isHardDependency: d.isHardDependency,
      }));
    });

    return {
      id: mission.id,
      title: mission.title,
      incidentId: mission.incidentId,
      commanderId: mission.commanderId,
      status: mission.status,
      priority: mission.priority,
      objective: {
        description: mission.objective.description,
        successCriteria: mission.objective.successCriteria,
      },
      deadline: mission.deadline?.targetDate.toISOString(),
      tasks: mission.tasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        assignedResponderId: t.assignedResponderId,
        assignedTeamId: t.assignedTeamId,
        deadline: t.deadline?.targetDate.toISOString(),
        checklist: t.checklist.map(c => ({
          id: c.id,
          description: c.description,
          isCompleted: c.isCompleted,
          completedAt: c.completedAt?.toISOString(),
          completedBy: c.completedBy,
        })),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      taskDependencies: depsArray,
      createdAt: mission.createdAt.toISOString(),
      updatedAt: mission.updatedAt.toISOString(),
    };
  }

  private toDomain(record: any): Mission {
    const objective = (Objective.create({
      description: record.objective.description,
      successCriteria: record.objective.successCriteria,
    }) as any).getValue();

    const deadline = record.deadline ? (Deadline.create(new Date(record.deadline)) as any).getValue() : undefined;

    const tasks = record.tasks.map((t: any) => {
      const taskDeadline = t.deadline ? (Deadline.create(new Date(t.deadline)) as any).getValue() : undefined;
      const checklist = t.checklist.map((c: any) => ChecklistItem.reconstitute({
        description: c.description,
        isCompleted: c.isCompleted,
        completedAt: c.completedAt ? new Date(c.completedAt) : undefined,
        completedBy: c.completedBy,
      }, c.id));

      return Task.reconstitute({
        title: t.title,
        description: t.description,
        status: t.status as TaskStatus,
        priority: t.priority as Priority,
        assignedResponderId: t.assignedResponderId,
        assignedTeamId: t.assignedTeamId,
        deadline: taskDeadline,
        checklist,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      }, t.id);
    });

    const taskDependencies = new Map<string, TaskDependency[]>();
    if (record.taskDependencies) {
      Object.entries(record.taskDependencies).forEach(([taskId, deps]: [string, any]) => {
        const depVos = deps.map((d: any) => (TaskDependency.create(d.dependsOnTaskId, d.isHardDependency) as any).getValue());
        taskDependencies.set(taskId, depVos);
      });
    }

    return Mission.reconstitute({
      title: record.title,
      incidentId: record.incidentId,
      commanderId: record.commanderId,
      status: record.status as MissionStatus,
      priority: record.priority as Priority,
      objective,
      deadline,
      tasks,
      taskDependencies,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    }, record.id);
  }
}
