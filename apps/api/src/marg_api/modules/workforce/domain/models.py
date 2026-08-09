from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field

from src.marg_api.modules.incident.domain.models import GeoLocation


class ResponderStatus(str, Enum):
    OFF_DUTY = "OFF_DUTY"
    ON_DUTY = "ON_DUTY"
    DEPLOYED = "DEPLOYED"
    FATIGUED = "FATIGUED"
    INCAPACITATED = "INCAPACITATED"


class ResponderType(str, Enum):
    PROFESSIONAL = "PROFESSIONAL"
    VOLUNTEER = "VOLUNTEER"


class TeamStatus(str, Enum):
    IDLE = "IDLE"
    DISPATCHED = "DISPATCHED"
    ON_SCENE = "ON_SCENE"
    DEMOBILIZED = "DEMOBILIZED"


class ContactInfo(BaseModel):
    email: str
    phone: str
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None


class Shift(BaseModel):
    id: str
    start_time: datetime
    end_time: datetime
    check_in_time: datetime | None = None
    check_out_time: datetime | None = None


class Certification(BaseModel):
    id: str
    name: str
    issued_at: datetime
    expires_at: datetime | None = None
    license_number: str


class Availability(BaseModel):
    day_of_week: int | None = None
    start_time: str | None = None
    end_time: str | None = None
    specific_date: datetime | None = None
    is_available: bool


class Responder(BaseModel):
    id: str
    organization_id: str
    type: ResponderType
    contact_info: ContactInfo
    skills: list[str] = Field(default_factory=list)
    certifications: list[Certification] = Field(default_factory=list)
    availability: list[Availability] = Field(default_factory=list)
    status: ResponderStatus
    current_location: GeoLocation | None = None
    shifts: list[Shift] = Field(default_factory=list)


class Team(BaseModel):
    id: str
    organization_id: str
    name: str
    team_leader_id: str
    members: list[str] = Field(default_factory=list)
    current_incident_id: str | None = None
    status: TeamStatus


class Department(BaseModel):
    id: str
    name: str


class Organization(BaseModel):
    id: str
    name: str
    departments: list[Department] = Field(default_factory=list)
