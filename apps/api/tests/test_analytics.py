import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_get_dashboard_analytics(client: AsyncClient):
    """Test retrieving dashboard analytics."""
    response = await client.get("/api/v1/analytics/dashboard")
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
