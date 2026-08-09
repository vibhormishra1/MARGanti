import { Repository } from "./base.repository";
import { Organization } from "../aggregates/workforce/organization.aggregate";

export interface OrganizationRepository extends Repository<Organization> {
  findByName(name: string): Promise<Organization | null>;
}
