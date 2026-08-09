import { Repository } from "./base.repository";
import { Team } from "../aggregates/workforce/team.aggregate";

export interface TeamRepository extends Repository<Team> {
  findByIncidentId(incidentId: string): Promise<Team[]>;
  findByOrganizationId(organizationId: string): Promise<Team[]>;
}
