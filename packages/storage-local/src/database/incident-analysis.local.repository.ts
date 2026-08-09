import { IncidentAnalysis, IncidentAnalysisRepository, Result, ResultFactory, DomainError } from "@marg/domain";

export class IncidentAnalysisLocalRepository implements IncidentAnalysisRepository {
  private storage: Map<string, IncidentAnalysis> = new Map();

  async findById(id: string): Promise<IncidentAnalysis | null> {
    return this.storage.get(id) || null;
  }

  async findByIncidentId(incidentId: string): Promise<IncidentAnalysis | null> {
    for (const analysis of this.storage.values()) {
      if (analysis.incidentId === incidentId) {
        return analysis;
      }
    }
    return null;
  }

  async exists(id: string): Promise<boolean> {
    return this.storage.has(id);
  }

  async findPendingApprovals(): Promise<IncidentAnalysis[]> {
    return Array.from(this.storage.values()).filter(a => a.status === "PENDING_APPROVAL");
  }

  async save(entity: IncidentAnalysis): Promise<void> {
    this.storage.set(entity.id, entity);
  }

  async delete(id: string): Promise<void> {
    this.storage.delete(id);
  }
}
