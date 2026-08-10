from datetime import datetime
from typing import Any

from pydantic import BaseModel


class SystemConfig(BaseModel):
    key: str
    organization_id: str
    value: dict[str, Any]
    updated_at: datetime
    updated_by: str

class SystemConfigUpdate(BaseModel):
    value: dict[str, Any]

class UserUpdate(BaseModel):
    role: str | None = None
    is_active: bool | None = None

class OrganizationUpdate(BaseModel):
    name: str | None = None
    departments: list[dict[str, Any]] | None = None
