import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_get_audit_events(async_client: AsyncClient):
    """Test retrieving audit events."""
    # This assumes the endpoint is wired up correctly and the DB is initialized
    response = await async_client.get("/api/v1/audit/events")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


async def test_generate_incident_report(async_client: AsyncClient):
    """Test generating an incident report."""
    payload = {"report_type": "INCIDENT_SUMMARY", "status_filter": ["REPORTED", "IN_PROGRESS", "RESOLVED"]}
    response = await async_client.post("/api/v1/reports/generate", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["report_type"] == "INCIDENT_SUMMARY"
    assert "sections" in data
    assert len(data["sections"]) > 0
