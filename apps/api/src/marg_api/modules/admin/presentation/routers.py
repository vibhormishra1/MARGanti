from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from marg_api.core.dependencies import get_admin_service
from marg_api.core.security import TokenData, require_role
from marg_api.modules.admin.application.services import AdminService
from marg_api.modules.admin.domain.models import OrganizationUpdate, SystemConfig, SystemConfigUpdate, UserUpdate
from marg_api.modules.auth.domain.models import UserResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/config/{key}", response_model=SystemConfig)
async def get_config(
    key: str,
    organization_id: str | None = None,
    service: AdminService = Depends(get_admin_service),
    current_user: TokenData = Depends(require_role(["admin"])),
):
    # Only allow fetching their own config, unless they are looking at GLOBAL (maybe allowed if needed)
    target_org = organization_id or current_user.organization_id
    if target_org != current_user.organization_id and target_org != "GLOBAL":
        raise HTTPException(status_code=403, detail="Cannot access cross-tenant configuration")

    config = await service.get_config(key, target_org)
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return config


@router.put("/config/{key}", response_model=SystemConfig)
async def update_config(
    key: str,
    cmd: SystemConfigUpdate,
    organization_id: str | None = None,
    service: AdminService = Depends(get_admin_service),
    current_user: TokenData = Depends(require_role(["admin"])),
):
    target_org = organization_id or current_user.organization_id
    if target_org != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Cannot modify cross-tenant configuration")

    return await service.update_config(key, target_org, cmd.value, current_user.user_id, current_user.role)


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    service: AdminService = Depends(get_admin_service), current_user: TokenData = Depends(require_role(["admin"]))
):
    return await service.list_users(organization_id=current_user.organization_id)


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    cmd: UserUpdate,
    service: AdminService = Depends(get_admin_service),
    current_user: TokenData = Depends(require_role(["admin"])),
):
    # Enforce tenant isolation on user update: Admin can only update users in their own org
    # We must fetch the user first
    users = await service.list_users(organization_id=current_user.organization_id)
    if not any(u.id == user_id for u in users):
        raise HTTPException(status_code=404, detail="User not found in your organization")

    try:
        return await service.update_user(
            user_id, cmd, current_user.user_id, current_user.role, current_user.organization_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/organization", response_model=dict[str, Any])
async def get_organization(
    service: AdminService = Depends(get_admin_service), current_user: TokenData = Depends(require_role(["admin"]))
):
    org = await service.get_organization(current_user.organization_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.patch("/organization", response_model=dict[str, Any])
async def update_organization(
    cmd: OrganizationUpdate,
    service: AdminService = Depends(get_admin_service),
    current_user: TokenData = Depends(require_role(["admin"])),
):
    try:
        return await service.update_organization(
            current_user.organization_id, cmd, current_user.user_id, current_user.role
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
