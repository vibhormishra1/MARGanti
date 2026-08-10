import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_get_dashboard_analytics(async_client: AsyncClient):
    """Test retrieving dashboard analytics."""
    # Note: Requires incidents, responders, missions in DB to return meaningful > 0 counts
    response = await async_client.get("/api/analytics/dashboard")
    assert response.status_code == 200
    
    data = response.json()
    assert "incidents" in data
    assert "responders" in data
    assert "missions" in data
    assert "generated_at" in data
    
    # Check structure
    assert "total_incidents" in data["incidents"]
    assert "active_incidents" in data["incidents"]
    assert "trend" in data["incidents"]
    
    assert "total_responders" in data["responders"]
    
    assert "total_missions" in data["missions"]
