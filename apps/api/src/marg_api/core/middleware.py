import time
import uuid

import structlog
from fastapi import Request
from prometheus_client import Counter, Histogram
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = structlog.get_logger()

# Prometheus Metrics
HTTP_REQUESTS_TOTAL = Counter("http_requests_total", "Total HTTP Requests", ["method", "endpoint", "status_code"])
HTTP_REQUEST_DURATION_SECONDS = Histogram(
    "http_request_duration_seconds", "HTTP Request Duration", ["method", "endpoint"]
)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())

        # Clear previous context and bind request-specific context
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
        )

        start_time = time.perf_counter()

        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            # If an unhandled exception bubbles up, it's a 500
            status_code = 500
            raise e
        finally:
            process_time = time.perf_counter() - start_time

            # Record metrics
            HTTP_REQUESTS_TOTAL.labels(
                method=request.method, endpoint=request.url.path, status_code=str(status_code)
            ).inc()

            HTTP_REQUEST_DURATION_SECONDS.labels(method=request.method, endpoint=request.url.path).observe(process_time)

            logger.info(
                "request_completed",
                status_code=status_code,
                duration=process_time,
            )

        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-Request-ID"] = request_id
        return response
