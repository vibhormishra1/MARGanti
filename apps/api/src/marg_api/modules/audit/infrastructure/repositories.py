from abc import ABC, abstractmethod

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from marg_api.infrastructure.database.models import AuditRecordModel
from marg_api.modules.audit.domain.models import AuditEvent


class AuditRepository(ABC):
    @abstractmethod
    async def record_event(self, event: AuditEvent) -> None:
        pass

    @abstractmethod
    async def query_events(
        self,
        resource_id: str | None = None,
        actor_id: str | None = None,
        limit: int = 100,
        offset: int = 0
    ) -> list[AuditEvent]:
        pass


class SQLAlchemyAuditRepository(AuditRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def record_event(self, event: AuditEvent) -> None:
        model = AuditRecordModel(
            id=event.id,
            timestamp=event.timestamp,
            actor_id=event.actor_id,
            actor_role=event.actor_role,
            organization_id=event.organization_id,
            action=event.action,
            resource_type=event.resource_type,
            resource_id=event.resource_id,
            result=event.result,
            metadata_payload=event.metadata_payload,
        )
        self.session.add(model)
        await self.session.flush()

    async def query_events(
        self,
        organization_id: str | None = None,
        resource_id: str | None = None,
        actor_id: str | None = None,
        limit: int = 100,
        offset: int = 0
    ) -> list[AuditEvent]:
        stmt = select(AuditRecordModel).order_by(desc(AuditRecordModel.timestamp))
        if organization_id:
            stmt = stmt.where(AuditRecordModel.organization_id == organization_id)
        if resource_id:
            stmt = stmt.where(AuditRecordModel.resource_id == resource_id)
        if actor_id:
            stmt = stmt.where(AuditRecordModel.actor_id == actor_id)
            
        stmt = stmt.limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        
        events = []
        for row in result.scalars():
            events.append(
                AuditEvent(
                    id=row.id,
                    timestamp=row.timestamp,
                    actor_id=row.actor_id,
                    actor_role=row.actor_role,
                    organization_id=row.organization_id,
                    action=row.action,
                    resource_type=row.resource_type,
                    resource_id=row.resource_id,
                    result=row.result,
                    metadata_payload=row.metadata_payload,
                )
            )
        return events
