import { Repository } from "./base.repository";
import { Mission } from "../aggregates/mission/mission.aggregate";

export interface IMissionRepository extends Repository<Mission> {
  findActiveByIncident(incidentId: string): Promise<Mission[]>;
  findByCommander(commanderId: string): Promise<Mission[]>;
}
