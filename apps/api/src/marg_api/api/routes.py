from fastapi import APIRouter

from marg_api.modules.admin.presentation.routers import router as admin_router
from marg_api.modules.analytics.presentation.routers import router as analytics_router
from marg_api.modules.audit.presentation.routers import router as audit_router
from marg_api.modules.auth.presentation.routers import router as auth_router
from marg_api.modules.incident.presentation.routers import router as incident_router
from marg_api.modules.mission.presentation.routers import router as mission_router
from marg_api.modules.reporting.presentation.routers import router as reporting_router
from marg_api.modules.resource.presentation.routers import router as resource_router
from marg_api.modules.workforce.presentation.routers import router as workforce_router

router = APIRouter()
router.include_router(incident_router)
router.include_router(resource_router)
router.include_router(workforce_router)
router.include_router(mission_router)
router.include_router(analytics_router)
router.include_router(audit_router)
router.include_router(reporting_router)
router.include_router(admin_router)
router.include_router(auth_router)
