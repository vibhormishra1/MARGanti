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
    assert fetched["reporter_id"] == "user-456"

    # List incidents
    list_res = await async_client.get("/api/incidents/?priority=HIGH")
    assert list_res.status_code == 200
    incidents = list_res.json()
    assert len(incidents) == 1
    assert incidents[0]["id"] == incident_id

    # Update status
    patch_res = await async_client.patch(
        f"/api/incidents/{incident_id}/status?new_status=ACTIVE&actor_id=user-789&reason=Team%20dispatched"
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["status"] == "ACTIVE"
