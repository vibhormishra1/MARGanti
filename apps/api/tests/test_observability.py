import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio

async def test_liveness_endpoint(async_client: AsyncClient):
    response = await async_client.get("/api/liveness")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

async def test_readiness_endpoint(async_client: AsyncClient):
    response = await async_client.get("/api/readiness")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}

async def test_metrics_endpoint(async_client: AsyncClient):
    # First make a request to generate some metrics
    await async_client.get("/api/liveness")
    
    response = await async_client.get("/api/metrics")
    assert response.status_code == 200
    assert "http_requests_total" in response.text
    assert "http_request_duration_seconds" in response.text

async def test_correlation_id_propagation(async_client: AsyncClient):
    response = await async_client.get("/api/liveness", headers={"X-Request-ID": "test-id-123"})
    assert response.status_code == 200
    assert response.headers.get("x-request-id") == "test-id-123"

async def test_correlation_id_generation(async_client: AsyncClient):
    response = await async_client.get("/api/liveness")
    assert response.status_code == 200
    assert "x-request-id" in response.headers
    assert len(response.headers.get("x-request-id")) > 0
