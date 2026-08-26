import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_admin_list_users(async_client: AsyncClient):
    response = await async_client.get("/api/admin/users")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


async def test_admin_update_user(async_client: AsyncClient):
    # This relies on the database having a user, which may not exist from previous tests directly,
    # so we expect a 404 since the user 'unknown' won't be found
    response = await async_client.patch("/api/admin/users/unknown", json={"role": "commander"})
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found in your organization"


async def test_admin_update_config(async_client: AsyncClient):
    response = await async_client.put("/api/admin/config/test_config", json={"value": {"feature_flag": True}})
    assert response.status_code == 200
    data = response.json()
    assert data["key"] == "test_config"
    assert data["value"]["feature_flag"] is True

    get_response = await async_client.get("/api/admin/config/test_config")
    assert get_response.status_code == 200
    assert get_response.json()["value"]["feature_flag"] is True


async def test_admin_update_config_unauthorized(async_client: AsyncClient):
    # Try updating a config for a different organization
    response = await async_client.put(
        "/api/admin/config/test_config?organization_id=other-org", json={"value": {"feature_flag": True}}
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Cannot modify cross-tenant configuration"
