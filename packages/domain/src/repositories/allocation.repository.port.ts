import { Repository } from "./base.repository";
import { ResourceAllocation } from "../aggregates/resource/resource-allocation.aggregate";

export interface AllocationRepository extends Repository<ResourceAllocation> {
  findByIncidentId(incidentId: string): Promise<ResourceAllocation[]>;
  findByResponderId(responderId: string): Promise<ResourceAllocation[]>;
}
