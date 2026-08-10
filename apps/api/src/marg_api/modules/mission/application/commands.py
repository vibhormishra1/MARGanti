import uuid
from datetime import UTC, datetime

from pydantic import BaseModel

from marg_api.modules.audit.application.services import AuditService
from marg_api.modules.mission.domain.models import (
    ChecklistItem,
    Mission,
    MissionStatus,
    Objective,
    Priority,
    Task,
    TaskDependency,
    TaskStatus,
)
from marg_api.modules.mission.infrastructure.repositories import MissionRepository


class CreateMissionCommand(BaseModel):
    title: str
    incident_id: str
    commander_id: str
    priority: Priority
    objective_description: str
    success_criteria: list[str]
    organization_id: str | None = None


class CreateTaskCommand(BaseModel):
    title: str
    description: str
    priority: Priority
    deadline: datetime | None = None


class AssignTaskCommand(BaseModel):
    responder_id: str | None = None
    team_id: str | None = None


class AddDependencyCommand(BaseModel):
    depends_on_task_id: str
    is_hard_dependency: bool = True


class MissionCommands:
    def __init__(self, repo: MissionRepository, audit_service: AuditService):
        self.repo = repo
        self.audit_service = audit_service

    async def create_mission(self, cmd: CreateMissionCommand) -> Mission:
        now = datetime.now(UTC)
        mission = Mission(
            id=f"mis-{uuid.uuid4().hex[:8]}",
            organization_id=cmd.organization_id,
            title=cmd.title,
            incident_id=cmd.incident_id,
            commander_id=cmd.commander_id,
            priority=cmd.priority,
            objective=Objective(
                description=cmd.objective_description,
                success_criteria=cmd.success_criteria,
            ),
            status=MissionStatus.DRAFT,
            created_at=now,
            updated_at=now,
        )
        await self.repo.save(mission)
        await self.audit_service.log_event(
            actor_id=cmd.commander_id,
            action="MISSION_CREATED",
            resource_type="MISSION",
            resource_id=mission.id,
            metadata_payload={"priority": mission.priority.value, "status": mission.status.value}
        )
        return mission

    async def publish_mission(self, mission_id: str) -> Mission:
        mission = await self.repo.get_by_id(mission_id)
        if not mission:
            raise ValueError("Mission not found")
        if mission.status != MissionStatus.DRAFT:
            raise ValueError("Only DRAFT missions can be published")
        if not mission.tasks:
            raise ValueError("Cannot publish mission without tasks")

        mission.status = MissionStatus.ACTIVE
        mission.updated_at = datetime.now(UTC)
        await self.repo.save(mission)
        await self.audit_service.log_event(
            actor_id=mission.commander_id,
            action="MISSION_PUBLISHED",
            resource_type="MISSION",
            resource_id=mission.id,
            metadata_payload={"new_status": mission.status.value}
        )
        return mission

    async def complete_mission(self, mission_id: str) -> Mission:
        mission = await self.repo.get_by_id(mission_id)
        if not mission:
            raise ValueError("Mission not found")
        if mission.status != MissionStatus.ACTIVE:
            raise ValueError("Only ACTIVE missions can be completed")

        for task in mission.tasks:
            if task.status != TaskStatus.COMPLETED:
                raise ValueError("Cannot complete mission with incomplete tasks")

        mission.status = MissionStatus.COMPLETED
        mission.updated_at = datetime.now(UTC)
        await self.repo.save(mission)
        return mission

    async def create_task(self, mission_id: str, cmd: CreateTaskCommand) -> Task:
        mission = await self.repo.get_by_id(mission_id)
        if not mission:
            raise ValueError("Mission not found")
        if mission.status in [MissionStatus.COMPLETED, MissionStatus.ABORTED]:
            raise ValueError("Cannot add tasks to completed/aborted mission")

        now = datetime.now(UTC)
        task = Task(
            id=f"tsk-{uuid.uuid4().hex[:8]}",
            title=cmd.title,
            description=cmd.description,
            status=TaskStatus.PENDING,
            priority=cmd.priority,
            deadline=cmd.deadline,
            created_at=now,
            updated_at=now,
        )
        mission.tasks.append(task)
        mission.task_dependencies[task.id] = []
        mission.updated_at = now
        await self.repo.save(mission)
        return task

    async def add_dependency(self, mission_id: str, task_id: str, cmd: AddDependencyCommand) -> Mission:
        mission = await self.repo.get_by_id(mission_id)
        if not mission:
            raise ValueError("Mission not found")

        if task_id == cmd.depends_on_task_id:
            raise ValueError("Task cannot depend on itself")

        task_ids = {t.id for t in mission.tasks}
        if task_id not in task_ids or cmd.depends_on_task_id not in task_ids:
            raise ValueError("Invalid task IDs provided")

        deps = mission.task_dependencies.get(task_id, [])
        if any(d.depends_on_task_id == cmd.depends_on_task_id for d in deps):
            return mission

        # Cycle detection
        temp_deps = {k: [d.depends_on_task_id for d in v] for k, v in mission.task_dependencies.items()}
        temp_deps[task_id].append(cmd.depends_on_task_id)

        if self._has_cycle(temp_deps):
            raise ValueError("Adding this dependency creates a cycle")

        new_dep = TaskDependency(
            depends_on_task_id=cmd.depends_on_task_id,
            is_hard_dependency=cmd.is_hard_dependency,
        )
        mission.task_dependencies.setdefault(task_id, []).append(new_dep)
        mission.updated_at = datetime.now(UTC)
        await self.repo.save(mission)
        return mission

    async def assign_task(self, mission_id: str, task_id: str, cmd: AssignTaskCommand) -> Task:
        mission = await self.repo.get_by_id(mission_id)
        if not mission:
            raise ValueError("Mission not found")

        task = next((t for t in mission.tasks if t.id == task_id), None)
        if not task:
            raise ValueError("Task not found")

        now = datetime.now(UTC)
        task.assigned_responder_id = cmd.responder_id
        task.assigned_team_id = cmd.team_id
        task.updated_at = now
        mission.updated_at = now
        await self.repo.save(mission)
        return task

    async def start_task(self, mission_id: str, task_id: str) -> Task:
        mission = await self.repo.get_by_id(mission_id)
        if not mission:
            raise ValueError("Mission not found")
        if mission.status != MissionStatus.ACTIVE:
            raise ValueError("Mission must be ACTIVE to start tasks")

        task = next((t for t in mission.tasks if t.id == task_id), None)
        if not task:
            raise ValueError("Task not found")
        if task.status == TaskStatus.COMPLETED:
            raise ValueError("Cannot restart completed task")

        # Verify dependencies
        for dep in mission.task_dependencies.get(task_id, []):
            if dep.is_hard_dependency:
                dep_task = next((t for t in mission.tasks if t.id == dep.depends_on_task_id), None)
                if not dep_task or dep_task.status != TaskStatus.COMPLETED:
                    raise ValueError(f"Hard dependency {dep.depends_on_task_id} is not completed")

        now = datetime.now(UTC)
        task.status = TaskStatus.IN_PROGRESS
        task.updated_at = now
        mission.updated_at = now
        await self.repo.save(mission)
        return task

    async def complete_task(self, mission_id: str, task_id: str) -> Task:
        mission = await self.repo.get_by_id(mission_id)
        if not mission:
            raise ValueError("Mission not found")

        task = next((t for t in mission.tasks if t.id == task_id), None)
        if not task:
            raise ValueError("Task not found")

        if any(not item.is_completed for item in task.checklist):
            raise ValueError("Cannot complete task with incomplete checklist items")

        now = datetime.now(UTC)
        task.status = TaskStatus.COMPLETED
        task.updated_at = now
        mission.updated_at = now
        await self.repo.save(mission)
        return task

    async def add_checklist_item(self, mission_id: str, task_id: str, description: str) -> Task:
        mission = await self.repo.get_by_id(mission_id)
        if not mission:
            raise ValueError("Mission not found")
        task = next((t for t in mission.tasks if t.id == task_id), None)
        if not task:
            raise ValueError("Task not found")

        item = ChecklistItem(
            id=f"chk-{uuid.uuid4().hex[:8]}",
            description=description,
            is_completed=False,
        )
        task.checklist.append(item)
        task.updated_at = datetime.now(UTC)
        await self.repo.save(mission)
        return task

    async def update_checklist_item(
        self, mission_id: str, task_id: str, item_id: str, is_completed: bool, responder_id: str
    ) -> Task:
        mission = await self.repo.get_by_id(mission_id)
        if not mission:
            raise ValueError("Mission not found")
        task = next((t for t in mission.tasks if t.id == task_id), None)
        if not task:
            raise ValueError("Task not found")
        item = next((i for i in task.checklist if i.id == item_id), None)
        if not item:
            raise ValueError("Checklist item not found")

        item.is_completed = is_completed
        if is_completed:
            item.completed_at = datetime.now(UTC)
            item.completed_by = responder_id
        else:
            item.completed_at = None
            item.completed_by = None

        task.updated_at = datetime.now(UTC)
        await self.repo.save(mission)
        return task

    def _has_cycle(self, graph: dict) -> bool:
        visited = set()
        rec_stack = set()

        def dfs(node):
            if node in rec_stack:
                return True
            if node in visited:
                return False

            visited.add(node)
            rec_stack.add(node)
            for neighbor in graph.get(node, []):
                if dfs(neighbor):
                    return True
            rec_stack.remove(node)
            return False

        for node in graph:
            if dfs(node):
                return True
        return False
