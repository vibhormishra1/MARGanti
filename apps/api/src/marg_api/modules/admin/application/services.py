from datetime import UTC, datetime
from typing import Any

from marg_api.modules.admin.domain.models import OrganizationUpdate, SystemConfig, UserUpdate
from marg_api.modules.admin.infrastructure.repositories import AdminRepository
from marg_api.modules.audit.application.services import AuditService
from marg_api.modules.auth.domain.models import UserResponse


class AdminService:
    def __init__(self, repo: AdminRepository, audit_service: AuditService):
        self.repo = repo
        self.audit_service = audit_service

    async def _audit(self, actor_id: str, actor_role: str, org_id: str, action: str, resource_type: str, resource_id: str, result: str, metadata: dict[str, Any]):
        await self.audit_service.log_event(
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            result=result,
            actor_role=actor_role,
            organization_id=org_id,
            metadata_payload=metadata,
        )

    async def get_config(self, key: str, organization_id: str) -> SystemConfig | None:
        return await self.repo.get_config(key, organization_id)

    async def update_config(self, key: str, organization_id: str, value: dict[str, Any], actor_id: str, actor_role: str) -> SystemConfig:
        config = SystemConfig(
            key=key,
            organization_id=organization_id,
            value=value,
            updated_at=datetime.now(UTC),
            updated_by=actor_id
        )
        await self.repo.save_config(config)
        await self._audit(actor_id, actor_role, organization_id, "UPDATE", "SystemConfig", f"{organization_id}:{key}", "SUCCESS", value)
        return config

    async def list_users(self, organization_id: str | None = None) -> list[UserResponse]:
        return await self.repo.list_users(organization_id)

    async def update_user(self, user_id: str, data: UserUpdate, actor_id: str, actor_role: str, actor_org_id: str) -> UserResponse:
        user = await self.repo.update_user(user_id, data)
        if not user:
            raise ValueError("User not found")
        await self._audit(actor_id, actor_role, actor_org_id, "UPDATE", "User", user_id, "SUCCESS", data.model_dump(exclude_none=True))
        return user

    async def get_organization(self, organization_id: str) -> dict[str, Any] | None:
        return await self.repo.get_organization(organization_id)

    async def update_organization(self, organization_id: str, data: OrganizationUpdate, actor_id: str, actor_role: str) -> dict[str, Any]:
        org = await self.repo.update_organization(organization_id, data)
        if not org:
            raise ValueError("Organization not found")
        await self._audit(actor_id, actor_role, organization_id, "UPDATE", "Organization", organization_id, "SUCCESS", data.model_dump(exclude_none=True))
        return org
