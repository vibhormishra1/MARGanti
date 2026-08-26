# ── Stage 1: Build ─────────────────────────────────────────────────
FROM python:3.13-slim AS builder

WORKDIR /app

# Install uv for deterministic dependency resolution
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files first for layer caching
COPY apps/api/pyproject.toml apps/api/uv.lock ./

# Install production dependencies only (no dev)
RUN uv sync --no-dev --frozen --no-install-project

# Copy application source
COPY apps/api/src ./src
COPY apps/api/alembic.ini ./alembic.ini


# ── Stage 2: Production ───────────────────────────────────────────
FROM python:3.13-slim AS production

# Security: non-root user
RUN groupadd --gid 1000 marg && \
    useradd --uid 1000 --gid 1000 --no-create-home --shell /bin/false marg

WORKDIR /app

# Copy virtual environment and application from builder
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/src /app/src
COPY --from=builder /app/alembic.ini /app/alembic.ini

# Set PATH so the venv Python is used
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH="/app/src" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    ENVIRONMENT=production

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/liveness')" || exit 1

EXPOSE 8000

# Run as non-root
USER marg

# Graceful shutdown: uvicorn handles SIGTERM correctly
CMD ["python", "-m", "uvicorn", "marg_api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--log-level", "info"]
