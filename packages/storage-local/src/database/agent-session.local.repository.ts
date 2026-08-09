import { AgentSession, AgentSessionRepository, Result, ResultFactory, DomainError } from "@marg/domain";

export class AgentSessionLocalRepository implements AgentSessionRepository {
  private storage: Map<string, AgentSession> = new Map();

  async findById(id: string): Promise<AgentSession | null> {
    return this.storage.get(id) || null;
  }

  async findByIncidentId(incidentId: string): Promise<AgentSession | null> {
    for (const session of this.storage.values()) {
      if (session.incidentId === incidentId) {
        return session;
      }
    }
    return null;
  }

  async exists(id: string): Promise<boolean> {
    return this.storage.has(id);
  }

  async findActiveSessions(): Promise<AgentSession[]> {
    return Array.from(this.storage.values()).filter(
      s => s.status === "PLANNING" || s.status === "DEBATING"
    );
  }

  async save(entity: AgentSession): Promise<void> {
    this.storage.set(entity.id, entity);
  }

  async delete(id: string): Promise<void> {
    if (!this.storage.has(id)) {
      throw new DomainError(`Agent Session with id ${id} not found.`);
    }
    this.storage.delete(id);
  }
}
