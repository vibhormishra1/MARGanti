export type MissionStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABORTED';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Objective {
  description: string;
  successCriteria: string[];
}

export interface ChecklistItem {
  id: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignedResponderId?: string;
  assignedTeamId?: string;
  deadline?: string;
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Mission {
  id: string;
  title: string;
  incidentId: string;
  commanderId: string;
  status: MissionStatus;
  priority: Priority;
  objective: Objective;
  deadline?: string;
  tasks: Task[];
  taskDependencies: Record<string, Array<{ dependsOnTaskId: string; isHardDependency: boolean }>>;
  createdAt: string;
  updatedAt: string;
}
