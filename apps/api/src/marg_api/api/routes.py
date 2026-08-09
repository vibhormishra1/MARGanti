from fastapi import APIRouter
from pydantic import BaseModel

from marg_api.modules.incident.presentation.routers import router as incident_router
from marg_api.modules.mission.presentation.routers import router as mission_router
from marg_api.modules.resource.presentation.routers import router as resource_router
from marg_api.modules.workforce.presentation.routers import router as workforce_router
from marg_api.modules.analytics.presentation.routers import router as analytics_router

router = APIRouter()
router.include_router(incident_router)
router.include_router(resource_router)
router.include_router(workforce_router)
router.include_router(mission_router)
router.include_router(analytics_router)


class SimulationRequest(BaseModel):
    state: str
    city: str
    crisis: str


class SimulationResponse(BaseModel):
    incident_id: str
    status: str
    message: str


@router.post("/simulation/initialize", response_model=SimulationResponse)
def initialize_simulation(request: SimulationRequest):
    """Initializes a crisis simulation based on state, city, and crisis description."""
    return SimulationResponse(
        incident_id="inc-12345",
        status="initializing",
        message=f"Simulation initialized for {request.crisis} in {request.city}, {request.state}",
    )
