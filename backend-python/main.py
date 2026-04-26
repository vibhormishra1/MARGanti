# Entry point.
# load_dotenv() runs FIRST — before any service or model is imported
# that might read environment variables.
# Using dotenv load_dotenv() not python-dotenv's auto-load to be explicit.

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

# ── Load env vars immediately — must be before any other local import ────────
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.simulation import router as simulation_router

# ── Structured logging ───────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: warm up the Gemini model so first request isn't slow
    from services.gemini_service import get_model
    logger.info("[Startup] Warming Gemini model...")
    get_model()
    logger.info("[Startup] Ready.")
    yield
    logger.info("[Shutdown] M.A.R.G. AI Engine shutting down.")


app = FastAPI(
    title="M.A.R.G. AI Engine",
    version="1.0.0",
    lifespan=lifespan,
)

# REQ-M3-03: CORS — only Node's port, not wildcard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],  # explicit — not wildcard
)

app.include_router(simulation_router, prefix="/simulate")


@app.get("/health")
def health():
    return {"status": "ok", "service": "marg-python-engine"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PYTHON_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
