import { 
  IAIService, 
  Incident, 
  IncidentAnalysis, 
  Result, 
  ResultFactory, 
  RiskAssessment, 
  ImpactEstimation, 
  AIAction,
  IncidentPriority
} from "@marg/domain";

export class MockAIProviderAdapter implements IAIService {
  
  async analyzeIncident(incident: Incident): Promise<Result<IncidentAnalysis>> {
    // Simulate AI network latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    const riskLevel = this.calculateMockRisk(incident.priority);
    const riskRes = RiskAssessment.create({
      level: riskLevel,
      factors: [
        "Proximity to densely populated area",
        "High uncertainty of initial reports",
        "Weather conditions unfavorable"
      ]
    });
    if (!riskRes.isSuccess) throw new Error();
    const riskAssessment = riskRes.getValue();

    const impactRes = ImpactEstimation.create({
      affectedAreaRadiusMeters: 500,
      estimatedCasualties: incident.priority === IncidentPriority.CRITICAL ? 10 : 0,
      infrastructureDamage: incident.priority === IncidentPriority.HIGH ? "MINOR" : "NONE"
    });
    if (!impactRes.isSuccess) throw new Error();
    const impactEstimation = impactRes.getValue();

    const actionRes = AIAction.create({
      id: crypto.randomUUID(),
      type: "DISPATCH",
      description: "Dispatch nearest available Hazmat team and medical support",
      priority: "CRITICAL"
    });
    if (!actionRes.isSuccess) throw new Error();
    const recommendedAction = actionRes.getValue();

    const analysisResult = IncidentAnalysis.create({
      incidentId: incident.id,
      summary: `AI Assessment: This ${incident.priority} priority incident involves significant risk factors. Immediate dispatch is recommended.`,
      recommendedPriority: incident.priority === IncidentPriority.LOW ? IncidentPriority.MEDIUM : incident.priority,
      missingInformation: ["Exact number of trapped individuals", "Hazardous materials confirmation"],
      potentialDuplicateIncidentIds: [],
      recommendedActions: [recommendedAction],
      riskAssessment,
      impactEstimation,
      confidenceScore: 88,
      explanation: "Confidence is high based on pattern matching with 4 similar historical incidents in this grid sector."
    });

    return analysisResult;
  }

  private calculateMockRisk(priority: IncidentPriority): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    switch (priority) {
      case IncidentPriority.CRITICAL: return "CRITICAL";
      case IncidentPriority.HIGH: return "HIGH";
      case IncidentPriority.MEDIUM: return "MEDIUM";
      default: return "LOW";
    }
  }

  async analyzeIncidentStream(incident: Incident, onChunk: (chunk: Partial<IncidentAnalysis>) => void): Promise<Result<IncidentAnalysis>> {
    // Mocking a streaming response
    onChunk({ summary: "Analyzing..." });
    await new Promise(resolve => setTimeout(resolve, 500));
    onChunk({ summary: "AI Assessment: This incident " });
    await new Promise(resolve => setTimeout(resolve, 500));
    onChunk({ summary: "AI Assessment: This incident involves significant risk factors." });
    
    return this.analyzeIncident(incident);
  }
}
