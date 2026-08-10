from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class MissionStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    ABORTED = "ABORTED"


class TaskStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    BLOCKED = "BLOCKED"
    COMPLETED = "COMPLETED"


class Priority(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class Objective(BaseModel):
    description: str
    success_criteria: list[str] = Field(default_factory=list)


class ChecklistItem(BaseModel):
    id: str
    description: str
    is_completed: bool = False
    completed_at: datetime | None = None
    completed_by: str | None = None


class Task(BaseModel):
    id: str
    title: str
    description: str
    status: TaskStatus = TaskStatus.PENDING
    priority: Priority = Priority.MEDIUM
    assigned_responder_id: str | None = None
    assigned_team_id: str | None = None
    deadline: datetime | None = None
    checklist: list[ChecklistItem] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class TaskDependency(BaseModel):
    depends_on_task_id: str
    is_hard_dependency: bool = True


class Mission(BaseModel):
    id: str
    organization_id: str
    title: str
    incident_id: str
    commander_id: str
    status: MissionStatus = MissionStatus.DRAFT
    priority: Priority = Priority.MEDIUM
    objective: Objective
    deadline: datetime | None = None
    tasks: list[Task] = Field(default_factory=list)
    task_dependencies: dict[str, list[TaskDependency]] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime
