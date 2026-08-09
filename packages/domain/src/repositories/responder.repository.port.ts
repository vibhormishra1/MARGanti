import { Repository } from "./base.repository";
import { Responder } from "../aggregates/workforce/responder.aggregate";

export interface ResponderRepository extends Repository<Responder> {
  findBySkill(skill: string): Promise<Responder[]>;
  findByOrganizationId(organizationId: string): Promise<Responder[]>;
  findNearby(lat: number, lng: number, radiusKm: number): Promise<Responder[]>;
}
