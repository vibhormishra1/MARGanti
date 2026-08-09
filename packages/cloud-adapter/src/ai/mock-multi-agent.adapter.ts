import { 
  IAgentOrchestratorService, 
  Incident, 
  AgentSession, 
  AgentMessage, 
  AgentConsensus,
  Result, 
  ResultFactory,
  AIAction
} from "@marg/domain";

export class MockMultiAgentAdapter implements IAgentOrchestratorService {
  
  async startSession(incident: Incident): Promise<Result<AgentSession>> {
    const sharedContext = `Incident ${incident.priority} priority. Title: ${incident.title}. Current status: ${incident.status}.`;
    return AgentSession.create({
      incidentId: incident.id,
      sharedContext
    });
  }

  async stepConversation(session: AgentSession, onMessage: (msg: AgentMessage) => void): Promise<Result<AgentSession>> {
    const roles = ["INCIDENT_COMMANDER", "LOGISTICS_OFFICER", "SAFETY_OFFICER"] as const;
    const currentStep = session.conversationHistory.length;

    if (currentStep >= roles.length) {
      // Reached end of mock debate loop
      return ResultFactory.ok(session);
    }

    const currentRole = roles[currentStep];
    
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    let content = "";
    if (currentRole === "INCIDENT_COMMANDER") {
      content = "I suggest an immediate deployment of two fire teams and an evacuation perimeter. Logistics, can we support this? Safety, what are the hazards?";
    } else if (currentRole === "LOGISTICS_OFFICER") {
      content = "We have only one fire team available within a 5-mile radius. Dispatching them now. We need mutual aid for the second team.";
    } else if (currentRole === "SAFETY_OFFICER") {
      content = "Wind conditions are blowing east. We must establish the evacuation perimeter downwind immediately to prevent inhalation injuries.";
    }

    const msgRes = AgentMessage.create({
      id: crypto.randomUUID(),
      role: currentRole,
      content,
      timestamp: new Date(),
      confidenceScore: 90,
      reasoningTrace: ["Analyzed context", `Evaluated constraints for ${currentRole}`]
    });
    if (!msgRes.isSuccess) throw new Error("Failed to create mock message");
    const msg = msgRes.getValue();

    session.addMessage(msg);
    onMessage(msg);

    return ResultFactory.ok(session);
  }

  async generateConsensus(session: AgentSession): Promise<Result<AgentSession>> {
    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const actionRes = AIAction.create({
      id: crypto.randomUUID(),
      type: "DISPATCH",
      description: "Dispatch available fire team and request mutual aid for secondary support.",
      priority: "CRITICAL"
    });
    if (!actionRes.isSuccess) throw new Error();
    const action = actionRes.getValue();

    const evacActionRes = AIAction.create({
      id: crypto.randomUUID(),
      type: "EVACUATE",
      description: "Establish downwind evacuation perimeter.",
      priority: "HIGH"
    });
    if (!evacActionRes.isSuccess) throw new Error();
    const evacAction = evacActionRes.getValue();

    const consensusRes = AgentConsensus.create({
      summary: "Agents reached consensus to dispatch immediate available resources and secure downwind evacuation area while waiting for mutual aid.",
      recommendedActions: [action, evacAction],
      overallConfidence: 88,
      conflictsResolved: [
        "Resolved Logistics constraint: Proceeding with 1 team instead of 2 initially.",
      ]
    });
    if (!consensusRes.isSuccess) throw new Error();
    const consensus = consensusRes.getValue();

    session.setConsensus(consensus);
    return ResultFactory.ok(session);
  }
}
