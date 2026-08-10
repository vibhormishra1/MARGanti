import uuid
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field


class AuditEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))
    actor_id: str
    actor_role: str | None = None
    organization_id: str | None = None
    action: str
    resource_type: str
    resource_id: str
    result: str = "SUCCESS"
    metadata_payload: dict[str, Any] = Field(default_factory=dict)
