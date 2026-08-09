import { Incident } from "../aggregates/incident/incident.aggregate";
import { AgentSession } from "../aggregates/agent-session/agent-session.aggregate";
import { AgentMessage } from "../aggregates/agent-session/agent.vo";
import { Result } from "../types/result.type";

export interface IAgentOrchestratorService {
  /**
   * Starts a new multi-agent orchestration session for an incident.
   */
  startSession(incident: Incident): Promise<Result<AgentSession>>;

  /**
   * Advances the conversation by having the coordinator or specialists debate the situation.
   */
  stepConversation(session: AgentSession, onMessage: (msg: AgentMessage) => void): Promise<Result<AgentSession>>;

  /**
   * Directs the agents to finalize their debate and formulate a unified consensus.
   */
  generateConsensus(session: AgentSession): Promise<Result<AgentSession>>;
}
