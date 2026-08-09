import { BaseEndpoint } from "./base.endpoint";

export interface ChecklistItemDTO {
  id: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface TaskDTO {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  assignedResponderId?: string;
  assignedTeamId?: string;
  deadline?: string;
  checklist: ChecklistItemDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface MissionDTO {
  id: string;
  title: string;
  incidentId: string;
  commanderId: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABORTED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  objective: {
    description: string;
    successCriteria: string[];
  };
  deadline?: string;
  tasks: TaskDTO[];
  taskDependencies: Record<string, Array<{ dependsOnTaskId: string; isHardDependency: boolean }>>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMissionPayload {
  title: string;
  incidentId: string;
  commanderId: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  objective: {
    description: string;
    successCriteria: string[];
  };
  deadline?: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  deadline?: string;
}

export class MissionEndpoint extends BaseEndpoint {
  public async getMissions(): Promise<MissionDTO[]> {
    return this.client.get<MissionDTO[]>("/api/v2/missions");
  }

  public async getMissionById(id: string): Promise<MissionDTO> {
    return this.client.get<MissionDTO>(`/api/v2/missions/${id}`);
  }

  public async createMission(payload: CreateMissionPayload): Promise<MissionDTO> {
    return this.client.post<MissionDTO>("/api/v2/missions", { body: payload });
  }

  public async publishMission(id: string): Promise<MissionDTO> {
    return this.client.post<MissionDTO>(`/api/v2/missions/${id}/publish`);
  }

  public async completeMission(id: string): Promise<MissionDTO> {
    return this.client.post<MissionDTO>(`/api/v2/missions/${id}/complete`);
  }

  public async createTask(missionId: string, payload: CreateTaskPayload): Promise<TaskDTO> {
    return this.client.post<TaskDTO>(`/api/v2/missions/${missionId}/tasks`, { body: payload });
  }

  public async addDependency(missionId: string, taskId: string, dependsOnTaskId: string, isHard = true): Promise<void> {
    return this.client.post<void>(`/api/v2/missions/${missionId}/tasks/${taskId}/dependencies`, {
      body: { dependsOnTaskId, isHard }
    });
  }

  public async assignTask(missionId: string, taskId: string, assignment: { responderId?: string; teamId?: string }): Promise<TaskDTO> {
    return this.client.post<TaskDTO>(`/api/v2/missions/${missionId}/tasks/${taskId}/assign`, { body: assignment });
  }

  public async startTask(missionId: string, taskId: string): Promise<TaskDTO> {
    return this.client.post<TaskDTO>(`/api/v2/missions/${missionId}/tasks/${taskId}/start`);
  }

  public async completeTask(missionId: string, taskId: string): Promise<TaskDTO> {
    return this.client.post<TaskDTO>(`/api/v2/missions/${missionId}/tasks/${taskId}/complete`);
  }

  public async updateChecklist(missionId: string, taskId: string, itemId: string, isCompleted: boolean, responderId: string): Promise<TaskDTO> {
    return this.client.put<TaskDTO>(`/api/v2/missions/${missionId}/tasks/${taskId}/checklist/${itemId}`, {
      body: { isCompleted, responderId }
    });
  }

  public async addChecklistItem(missionId: string, taskId: string, description: string): Promise<TaskDTO> {
    return this.client.post<TaskDTO>(`/api/v2/missions/${missionId}/tasks/${taskId}/checklist`, {
      body: { description }
    });
  }
}
