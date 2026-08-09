import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(async_client: AsyncClient):
    response = await async_client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["ok", "degraded"]


@pytest.mark.asyncio
async def test_version_check(async_client: AsyncClient):
    response = await async_client.get("/api/version")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "MARG API"
    assert data["version"] == "2.0.0"


@pytest.mark.asyncio
async def test_simulation_initialize(async_client: AsyncClient):
    response = await async_client.post(
        "/api/simulation/initialize",
        json={"state": "Maharashtra", "city": "Mumbai", "crisis": "Flash Floods"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["incident_id"] == "inc-12345"
    assert data["status"] == "initializing"
