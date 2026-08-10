from abc import ABC, abstractmethod
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from marg_api.infrastructure.database.models import MissionModel
from marg_api.modules.mission.domain.models import (
    ChecklistItem,
    Mission,
    MissionStatus,
    Objective,
    Priority,
    Task,
    TaskDependency,
)


def _parse_dt(val: str | datetime | None) -> datetime | None:
    if val is None:
        return None
    if isinstance(val, str):
        return datetime.fromisoformat(val)
    return val


class MissionRepository(ABC):
    @abstractmethod
    async def save(self, mission: Mission) -> None:
        pass

    @abstractmethod
    async def get_by_id(self, mission_id: str) -> Mission | None:
        pass

    @abstractmethod
    async def list_all(self, limit: int = 50, offset: int = 0) -> list[Mission]:
        pass

    @abstractmethod
    async def get_by_incident_id(self, incident_id: str, limit: int = 50, offset: int = 0) -> list[Mission]:
        pass


class SQLAlchemyMissionRepository(MissionRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_domain(self, model: MissionModel) -> Mission:
        tasks = []
        for t in model.tasks or []:
            checklist = [
                ChecklistItem(
                    id=c["id"],
                    description=c["description"],
                    is_completed=c.get("is_completed", False),
                    completed_at=_parse_dt(c.get("completed_at")),
                    completed_by=c.get("completed_by"),
                )
                for c in t.get("checklist", [])
            ]
            tasks.append(
                Task(
                    id=t["id"],
                    title=t["title"],
                    description=t["description"],
                    status=t.get("status"),
                    priority=t.get("priority"),
                    assigned_responder_id=t.get("assigned_responder_id"),
                    assigned_team_id=t.get("assigned_team_id"),
                    deadline=_parse_dt(t.get("deadline")),
                    checklist=checklist,
                    created_at=_parse_dt(t["created_at"]),
                    updated_at=_parse_dt(t["updated_at"]),
                )
            )

        task_dependencies = {}
        for task_id, deps in (model.task_dependencies or {}).items():
            task_dependencies[task_id] = [
                TaskDependency(
                    depends_on_task_id=d["depends_on_task_id"],
                    is_hard_dependency=d.get("is_hard_dependency", True),
                )
                for d in deps
            ]

        return Mission(
            id=model.id,
            organization_id=model.organization_id,
            title=model.title,
            incident_id=model.incident_id,
            commander_id=model.commander_id,
            status=MissionStatus(model.status),
            priority=Priority(model.priority),
            objective=Objective(**model.objective),
            deadline=_parse_dt(model.deadline),
            tasks=tasks,
            task_dependencies=task_dependencies,
            created_at=_parse_dt(model.created_at),
            updated_at=_parse_dt(model.updated_at),
        )

    def _from_domain(self, mission: Mission) -> dict:
        tasks_json = []
        for t in mission.tasks:
            tasks_json.append(
                {
                    "id": t.id,
                    "title": t.title,
                    "description": t.description,
                    "status": t.status.value if hasattr(t.status, "value") else t.status,
                    "priority": t.priority.value if hasattr(t.priority, "value") else t.priority,
                    "assigned_responder_id": t.assigned_responder_id,
                    "assigned_team_id": t.assigned_team_id,
                    "deadline": t.deadline.isoformat() if t.deadline else None,
                    "checklist": [
                        {
                            "id": c.id,
                            "description": c.description,
                            "is_completed": c.is_completed,
                            "completed_at": c.completed_at.isoformat() if c.completed_at else None,
                            "completed_by": c.completed_by,
                        }
                        for c in t.checklist
                    ],
                    "created_at": t.created_at.isoformat() if t.created_at else None,
                    "updated_at": t.updated_at.isoformat() if t.updated_at else None,
                }
            )

        task_deps_json = {}
        for task_id, deps in mission.task_dependencies.items():
            task_deps_json[task_id] = [
                {
                    "depends_on_task_id": d.depends_on_task_id,
                    "is_hard_dependency": d.is_hard_dependency,
                }
                for d in deps
            ]

        return {
            "id": mission.id,
            "organization_id": mission.organization_id,
            "title": mission.title,
            "incident_id": mission.incident_id,
            "commander_id": mission.commander_id,
            "status": mission.status.value if hasattr(mission.status, "value") else mission.status,
            "priority": mission.priority.value if hasattr(mission.priority, "value") else mission.priority,
            "objective": mission.objective.model_dump(),
            "deadline": mission.deadline,
            "tasks": tasks_json,
            "task_dependencies": task_deps_json,
            "created_at": mission.created_at,
            "updated_at": mission.updated_at,
        }

    async def save(self, mission: Mission) -> None:
        data = self._from_domain(mission)
        model = await self.session.get(MissionModel, mission.id)
        if model is None:
            model = MissionModel(**data)
            self.session.add(model)
        else:
            for k, v in data.items():
                setattr(model, k, v)
        await self.session.flush()

    async def get_by_id(self, mission_id: str) -> Mission | None:
        model = await self.session.get(MissionModel, mission_id)
        if not model:
            return None
        return self._to_domain(model)

    async def list_all(self, limit: int = 50, offset: int = 0) -> list[Mission]:
        stmt = select(MissionModel).offset(offset).limit(limit)
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_domain(m) for m in models]

    async def get_by_incident_id(self, incident_id: str, limit: int = 50, offset: int = 0) -> list[Mission]:
        stmt = select(MissionModel).where(MissionModel.incident_id == incident_id).offset(offset).limit(limit)
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_domain(m) for m in models]
