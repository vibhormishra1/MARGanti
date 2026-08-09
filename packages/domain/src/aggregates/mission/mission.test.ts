import { describe, it, expect } from "vitest";
import { Mission } from "./mission.aggregate";
import { Task } from "./task.entity";
import { MissionStatus } from "../../value-objects/mission-status.enum";
import { TaskStatus } from "../../value-objects/task-status.enum";
import { Priority } from "../../value-objects/priority.enum";
import { Objective } from "../../value-objects/objective.vo";
import { Deadline } from "../../value-objects/deadline.vo";

describe("Mission Aggregate", () => {
  it("should create a mission with initial draft status", () => {
    const objectiveRes = Objective.create({
      description: "Perform search and rescue",
      successCriteria: ["Locate and extract target"]
    });
    expect(objectiveRes.isSuccess).toBe(true);
    const objective = (objectiveRes as any).getValue();

    const missionRes = Mission.create({
      title: "Rescue Mission Alpha",
      incidentId: "incident-1",
      commanderId: "commander-1",
      priority: Priority.HIGH,
      objective
    });

    expect(missionRes.isSuccess).toBe(true);
    const mission = (missionRes as any).getValue();
    expect(mission.status).toBe(MissionStatus.DRAFT);
    expect(mission.tasks.length).toBe(0);
  });

  it("should add tasks and dependencies correctly", () => {
    const objective = (Objective.create({
      description: "Perform search and rescue",
      successCriteria: ["Locate and extract target"]
    }) as any).getValue();

    const mission = (Mission.create({
      title: "Rescue Mission Alpha",
      incidentId: "incident-1",
      commanderId: "commander-1",
      priority: Priority.HIGH,
      objective
    }) as any).getValue();

    const task1 = (Task.create({
      title: "Locate target",
      description: "Use drone mapping",
      priority: Priority.HIGH
    }) as any).getValue();

    const task2 = (Task.create({
      title: "Extract target",
      description: "Ground team extraction",
      priority: Priority.CRITICAL
    }) as any).getValue();

    const addT1 = mission.addTask(task1);
    const addT2 = mission.addTask(task2);
    expect(addT1.isSuccess).toBe(true);
    expect(addT2.isSuccess).toBe(true);

    const addDep = mission.addTaskDependency(task2.id, task1.id, true);
    expect(addDep.isSuccess).toBe(true);

    const deps = mission.taskDependencies.get(task2.id);
    expect(deps).toBeDefined();
    expect(deps![0].dependsOnTaskId).toBe(task1.id);
    expect(deps![0].isHardDependency).toBe(true);
  });
});
