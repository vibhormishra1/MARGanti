import { Repository } from "./base.repository";
import { IncidentAnalysis } from "../aggregates/incident-analysis/incident-analysis.aggregate";

export interface IncidentAnalysisRepository extends Repository<IncidentAnalysis> {
  findByIncidentId(incidentId: string): Promise<IncidentAnalysis | null>;
  findPendingApprovals(): Promise<IncidentAnalysis[]>;
}
