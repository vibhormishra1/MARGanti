import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_team_and_checkin(async_client: AsyncClient):
    # Create Team
    team_payload = {
        "organization_id": "org-999",
        "name": "NDRF Response Unit 1",
        "team_leader_id": "resp-001",
    }
    create_res = await async_client.post("/api/workforce/teams", json=team_payload)
    assert create_res.status_code == 200
    team = create_res.json()
    assert team["name"] == "NDRF Response Unit 1"
    assert team["organization_id"] == "org-999"
    assert team["status"] == "IDLE"
