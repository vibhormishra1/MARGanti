import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_report_and_get_incident(async_client: AsyncClient):
    # Report incident
    payload = {
        "title": "Severe Flood in Sector 4",
        "description": "Rising water levels blocking access road",
        "latitude": 26.1426,
        "longitude": 91.7610,
        "address": "Guwahati Sector 4",
        "priority": "HIGH",
        "reporter_id": "user-456",
    }
    response = await async_client.post("/api/incidents/", json=payload)
    assert response.status_code == 201
    created = response.json()
    incident_id = created["id"]
    assert created["title"] == "Severe Flood in Sector 4"
    assert created["status"] == "REPORTED"

    # Get incident by ID
    get_res = await async_client.get(f"/api/incidents/{incident_id}")
    assert get_res.status_code == 200
    fetched = get_res.json()
    assert fetched["id"] == incident_id
    assert fetched["reporter_id"] == "test-user-123"

    # List incidents
    list_res = await async_client.get("/api/incidents/?priority=HIGH")
    assert list_res.status_code == 200
    incidents = list_res.json()
    assert len(incidents) == 1
    assert incidents[0]["id"] == incident_id

    patch_res = await async_client.patch(
        f"/api/incidents/{incident_id}/status?new_status=ACTIVE&actor_id=user-789&reason=Team%20dispatched"
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["status"] == "ACTIVE"


@pytest.mark.asyncio
async def test_cross_tenant_incident_access(async_client: AsyncClient):
    # 1. Create an incident in the default tenant (test-org-123)
    payload = {
        "title": "Tenant Isolation Test",
        "description": "This should not be visible to other tenants",
        "latitude": 26.1426,
        "longitude": 91.7610,
        "priority": "HIGH",
    }
    create_res = await async_client.post("/api/incidents/", json=payload)
    assert create_res.status_code == 201
    incident_id = create_res.json()["id"]

    # 2. Override the dependency to simulate a different tenant
    from marg_api.core.security import TokenData, get_current_user
    from marg_api.main import app

    def override_different_tenant():
        return TokenData(user_id="other-user", organization_id="other-org-999", role="admin")

    app.dependency_overrides[get_current_user] = override_different_tenant

    # 3. Try to access the incident from the different tenant
    get_res = await async_client.get(f"/api/incidents/{incident_id}")

    # Clean up override immediately by restoring the original mock
    from marg_api.core.security import get_current_user
    from tests.conftest import override_get_current_user

    app.dependency_overrides[get_current_user] = override_get_current_user

    # It should return 403 because the router explicitly forbids cross-tenant access
    assert get_res.status_code == 403
