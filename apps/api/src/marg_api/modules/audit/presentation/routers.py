from typing import Annotated

from fastapi import APIRouter, Depends, Query

from marg_api.core.dependencies import get_audit_service
from marg_api.core.security import TokenData, get_current_user
from marg_api.modules.audit.application.services import AuditService
from marg_api.modules.audit.domain.models import AuditEvent

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/events", response_model=list[AuditEvent])
async def get_audit_events(
    audit_service: Annotated[AuditService, Depends(get_audit_service)],
    current_user: Annotated[TokenData, Depends(get_current_user)],
    resource_id: str | None = Query(None, description="Filter by resource ID"),
    actor_id: str | None = Query(None, description="Filter by actor ID"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    """Retrieve audit log events."""
    return await audit_service.get_events(
        organization_id=current_user.organization_id,
        resource_id=resource_id,
        actor_id=actor_id,
        limit=limit,
        offset=offset,
    )


@router.post("/events/sync", response_model=list[AuditEvent])
async def sync_offline_audit_events(
    events: list[AuditEvent],
    audit_service: Annotated[AuditService, Depends(get_audit_service)],
    current_user: Annotated[TokenData, Depends(get_current_user)],
):
    """Sync audit events generated while offline."""
    saved_events = []
    for event in events:
        saved_event = await audit_service.log_event(
            actor_id=event.actor_id or current_user.user_id,
            action=event.action,
            resource_type=event.resource_type,
            resource_id=event.resource_id,
            result=event.result,
            actor_role=event.actor_role or current_user.role,
            organization_id=current_user.organization_id,
            metadata_payload=event.metadata_payload,
        )
        saved_events.append(saved_event)
    return saved_events
