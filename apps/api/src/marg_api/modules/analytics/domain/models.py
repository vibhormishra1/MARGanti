from datetime import datetime

from pydantic import BaseModel, Field


class StatusCount(BaseModel):
    status: str
    count: int


class PriorityCount(BaseModel):
    priority: str
    count: int


class TrendDataPoint(BaseModel):
    timestamp: datetime
    count: int


class IncidentMetrics(BaseModel):
    total_incidents: int
    active_incidents: int
    by_status: list[StatusCount] = Field(default_factory=list)
    by_priority: list[PriorityCount] = Field(default_factory=list)
    trend: list[TrendDataPoint] = Field(default_factory=list)


class ResponderMetrics(BaseModel):
    total_responders: int
    active_responders: int  # e.g. DEPLOYED or ON_DUTY
    by_status: list[StatusCount] = Field(default_factory=list)


class MissionMetrics(BaseModel):
    total_missions: int
    active_missions: int
    by_status: list[StatusCount] = Field(default_factory=list)


class DashboardAnalytics(BaseModel):
    generated_at: datetime
    incidents: IncidentMetrics
    responders: ResponderMetrics
    missions: MissionMetrics
    is_offline_degraded: bool = False
