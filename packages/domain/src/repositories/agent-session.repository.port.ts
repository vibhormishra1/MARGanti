import { Repository } from "./base.repository";
import { AgentSession } from "../aggregates/agent-session/agent-session.aggregate";

export interface AgentSessionRepository extends Repository<AgentSession> {
  findByIncidentId(incidentId: string): Promise<AgentSession | null>;
  findActiveSessions(): Promise<AgentSession[]>;
}
