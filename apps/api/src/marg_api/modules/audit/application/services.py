from marg_api.modules.audit.domain.models import AuditEvent
from marg_api.modules.audit.infrastructure.repositories import AuditRepository


class AuditService:
    def __init__(self, audit_repo: AuditRepository):
        self.audit_repo = audit_repo

    async def log_event(
        self,
        actor_id: str,
        action: str,
        resource_type: str,
        resource_id: str,
        result: str = "SUCCESS",
        actor_role: str | None = None,
        organization_id: str | None = None,
        metadata_payload: dict | None = None
    ) -> AuditEvent:
        event = AuditEvent(
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            result=result,
            actor_role=actor_role,
            organization_id=organization_id,
            metadata_payload=metadata_payload or {},
        )
        await self.audit_repo.record_event(event)
        return event

    async def get_events(
        self,
        organization_id: str | None = None,
        resource_id: str | None = None,
        actor_id: str | None = None,
        limit: int = 100,
        offset: int = 0
    ) -> list[AuditEvent]:
        return await self.audit_repo.query_events(
            organization_id=organization_id,
            resource_id=resource_id,
            actor_id=actor_id,
            limit=limit,
            offset=offset
        )
