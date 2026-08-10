from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field


class ReportRequest(BaseModel):
    report_type: str  # e.g., 'INCIDENT_SUMMARY', 'MISSION_PERFORMANCE'
    start_date: datetime | None = None
    end_date: datetime | None = None
    organization_id: str | None = None
    status_filter: list[str] | None = None

class ReportSection(BaseModel):
    title: str
    data: list[dict[str, Any]] | dict[str, Any]

class ReportResponse(BaseModel):
    id: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    report_type: str
    sections: list[ReportSection]
    metadata: dict[str, Any] = Field(default_factory=dict)
