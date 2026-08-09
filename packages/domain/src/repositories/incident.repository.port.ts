import { Repository } from "./base.repository";
import { Incident } from "../aggregates/incident/incident.aggregate";
import { IncidentStatus } from "../aggregates/incident/incident-status.enum";

export interface IncidentSearchCriteria {
  status?: IncidentStatus;
  priority?: string;
  reporterId?: string;
  assignedResponderId?: string;
}

export interface IncidentRepository extends Repository<Incident> {
  search(criteria: IncidentSearchCriteria, limit?: number, offset?: number): Promise<Incident[]>;
  findByRadius(lat: number, lng: number, radiusKm: number): Promise<Incident[]>;
}
