from abc import ABC, abstractmethod
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from marg_api.infrastructure.database.models import OrganizationModel, SystemConfigModel, UserModel
from marg_api.modules.admin.domain.models import OrganizationUpdate, SystemConfig, UserUpdate
from marg_api.modules.auth.domain.models import UserResponse


class AdminRepository(ABC):
    @abstractmethod
    async def get_config(self, key: str, organization_id: str) -> SystemConfig | None:
        pass

    @abstractmethod
    async def save_config(self, config: SystemConfig) -> None:
        pass

    @abstractmethod
    async def list_users(self, organization_id: str | None = None) -> list[UserResponse]:
        pass

    @abstractmethod
    async def update_user(self, user_id: str, data: UserUpdate) -> UserResponse | None:
        pass

    @abstractmethod
    async def get_organization(self, organization_id: str) -> dict[str, Any] | None:
        pass

    @abstractmethod
    async def update_organization(self, organization_id: str, data: OrganizationUpdate) -> dict[str, Any] | None:
        pass


class SQLAlchemyAdminRepository(AdminRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_system_config(self, model: SystemConfigModel) -> SystemConfig:
        return SystemConfig(
            key=model.key,
            organization_id=model.organization_id,
            value=model.value,
            updated_at=model.updated_at,
            updated_by=model.updated_by,
        )

    def _to_user_response(self, model: UserModel) -> UserResponse:
        return UserResponse(
            id=model.id,
            email=model.email,
            organization_id=model.organization_id,
            role=model.role,
            is_active=model.is_active,
        )

    async def get_config(self, key: str, organization_id: str) -> SystemConfig | None:
        stmt = select(SystemConfigModel).where(
            SystemConfigModel.key == key, SystemConfigModel.organization_id == organization_id
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_system_config(model) if model else None

    async def save_config(self, config: SystemConfig) -> None:
        stmt = select(SystemConfigModel).where(
            SystemConfigModel.key == config.key, SystemConfigModel.organization_id == config.organization_id
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        if model:
            model.value = config.value
            model.updated_at = config.updated_at
            model.updated_by = config.updated_by
        else:
            model = SystemConfigModel(
                key=config.key,
                organization_id=config.organization_id,
                value=config.value,
                updated_at=config.updated_at,
                updated_by=config.updated_by,
            )
            self.session.add(model)
        await self.session.flush()

    async def list_users(self, organization_id: str | None = None) -> list[UserResponse]:
        stmt = select(UserModel)
        if organization_id:
            stmt = stmt.where(UserModel.organization_id == organization_id)
        result = await self.session.execute(stmt)
        models = result.scalars().all()
        return [self._to_user_response(m) for m in models]

    async def update_user(self, user_id: str, data: UserUpdate) -> UserResponse | None:
        model = await self.session.get(UserModel, user_id)
        if not model:
            return None

        if data.role is not None:
            model.role = data.role
        if data.is_active is not None:
            model.is_active = data.is_active

        await self.session.flush()
        return self._to_user_response(model)

    async def get_organization(self, organization_id: str) -> dict[str, Any] | None:
        model = await self.session.get(OrganizationModel, organization_id)
        if not model:
            return None
        return {"id": model.id, "name": model.name, "departments": model.departments}

    async def update_organization(self, organization_id: str, data: OrganizationUpdate) -> dict[str, Any] | None:
        model = await self.session.get(OrganizationModel, organization_id)
        if not model:
            return None

        if data.name is not None:
            model.name = data.name
        if data.departments is not None:
            model.departments = data.departments

        await self.session.flush()
        return {"id": model.id, "name": model.name, "departments": model.departments}
