import { Incident } from "../aggregates/incident/incident.aggregate";
import { IncidentAnalysis } from "../aggregates/incident-analysis/incident-analysis.aggregate";
import { Result } from "../types/result.type";

export interface IAIService {
  /**
   * Generates a comprehensive AI analysis for a given incident.
   * Does NOT modify the incident directly.
   */
  analyzeIncident(incident: Incident): Promise<Result<IncidentAnalysis>>;
  
  /**
   * Optional streaming capability for real-time progressive updates
   */
  analyzeIncidentStream?(incident: Incident, onChunk: (chunk: Partial<IncidentAnalysis>) => void): Promise<Result<IncidentAnalysis>>;
}
