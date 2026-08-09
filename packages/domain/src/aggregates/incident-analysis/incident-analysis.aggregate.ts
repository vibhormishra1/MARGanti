import { AggregateRoot } from "../aggregate-root";
import { Result, ResultFactory } from "../../types/result.type";
import { DomainError } from "../../errors/domain.error";
import { RiskAssessment, ImpactEstimation, AIAction } from "./ai-analysis.vo";
import { IncidentPriority } from "../incident/incident-priority.enum";

export type AnalysisStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

export interface AuditEvent {
  id: string;
  timestamp: Date;
  action: string;
  actorId: string;
  notes?: string;
}

export interface IncidentAnalysisProps {
  incidentId: string;
  summary: string;
  recommendedPriority: IncidentPriority;
  missingInformation: string[];
  potentialDuplicateIncidentIds: string[];
  recommendedActions: AIAction[];
  riskAssessment: RiskAssessment;
  impactEstimation: ImpactEstimation;
  confidenceScore: number;
  explanation: string;
  status: AnalysisStatus;
  auditTrail: AuditEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export class IncidentAnalysis extends AggregateRoot<IncidentAnalysisProps> {
  private constructor(props: IncidentAnalysisProps, id: string) {
    super(props, id);
  }

  get incidentId(): string { return this.props.incidentId; }
  get summary(): string { return this.props.summary; }
  get recommendedPriority(): IncidentPriority { return this.props.recommendedPriority; }
  get missingInformation(): string[] { return [...this.props.missingInformation]; }
  get potentialDuplicateIncidentIds(): string[] { return [...this.props.potentialDuplicateIncidentIds]; }
  get recommendedActions(): AIAction[] { return [...this.props.recommendedActions]; }
  get riskAssessment(): RiskAssessment { return this.props.riskAssessment; }
  get impactEstimation(): ImpactEstimation { return this.props.impactEstimation; }
  get confidenceScore(): number { return this.props.confidenceScore; }
  get explanation(): string { return this.props.explanation; }
  get status(): AnalysisStatus { return this.props.status; }
  get auditTrail(): AuditEvent[] { return [...this.props.auditTrail]; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  public approve(actorId: string, notes?: string): Result<void> {
    if (this.props.status !== "PENDING_APPROVAL") {
      return ResultFactory.fail(new DomainError("Can only approve a pending analysis."));
    }
    
    this.props.status = "APPROVED";
    this.addAuditEvent("APPROVAL", actorId, notes);
    this.props.updatedAt = new Date();
    
    return ResultFactory.ok(undefined);
  }

  public reject(actorId: string, reason: string): Result<void> {
    if (this.props.status !== "PENDING_APPROVAL") {
      return ResultFactory.fail(new DomainError("Can only reject a pending analysis."));
    }
    if (!reason || reason.trim().length === 0) {
      return ResultFactory.fail(new DomainError("Must provide a reason for rejecting analysis."));
    }

    this.props.status = "REJECTED";
    this.addAuditEvent("REJECTION", actorId, reason);
    this.props.updatedAt = new Date();
    
    return ResultFactory.ok(undefined);
  }

  private addAuditEvent(action: string, actorId: string, notes?: string): void {
    this.props.auditTrail.push({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      action,
      actorId,
      notes
    });
  }

  public static create(
    props: Omit<IncidentAnalysisProps, "status" | "auditTrail" | "createdAt" | "updatedAt">,
    id?: string
  ): Result<IncidentAnalysis> {
    if (props.confidenceScore < 0 || props.confidenceScore > 100) {
      return ResultFactory.fail(new DomainError("Confidence score must be between 0 and 100."));
    }

    const analysis = new IncidentAnalysis({
      ...props,
      status: "PENDING_APPROVAL",
      auditTrail: [{
        id: crypto.randomUUID(),
        timestamp: new Date(),
        action: "ANALYSIS_GENERATED",
        actorId: "SYSTEM_AI"
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    }, id ?? crypto.randomUUID());

    return ResultFactory.ok(analysis);
  }

  public static reconstitute(props: IncidentAnalysisProps, id: string): Result<IncidentAnalysis> {
    return ResultFactory.ok(new IncidentAnalysis(props, id));
  }
}
