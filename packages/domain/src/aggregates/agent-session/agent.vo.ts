import { ValueObject } from "../../value-objects/base.value-object";
import { Result, ResultFactory } from "../../types/result.type";
import { AIAction } from "../incident-analysis/ai-analysis.vo";

export type SpecialistRole = 
  | "COORDINATOR" 
  | "INCIDENT_COMMANDER" 
  | "OPERATIONS_OFFICER" 
  | "LOGISTICS_OFFICER" 
  | "MEDICAL_COORDINATOR" 
  | "TRANSPORTATION_COORDINATOR" 
  | "COMMUNICATIONS_OFFICER" 
  | "INTELLIGENCE_ANALYST" 
  | "SAFETY_OFFICER";

export interface AgentMessageProps {
  id: string;
  role: SpecialistRole;
  content: string;
  timestamp: Date;
  confidenceScore?: number;
  reasoningTrace?: string[];
}

export class AgentMessage extends ValueObject<AgentMessageProps> {
  private constructor(props: AgentMessageProps) {
    super(props);
  }

  get id(): string { return this.props.id; }
  get role(): SpecialistRole { return this.props.role; }
  get content(): string { return this.props.content; }
  get timestamp(): Date { return this.props.timestamp; }
  get confidenceScore(): number | undefined { return this.props.confidenceScore; }
  get reasoningTrace(): string[] | undefined { return this.props.reasoningTrace ? [...this.props.reasoningTrace] : undefined; }

  public static create(props: AgentMessageProps): Result<AgentMessage> {
    if (!props.content || props.content.trim().length === 0) {
      return ResultFactory.fail(new Error("Agent message content cannot be empty."));
    }
    return ResultFactory.ok(new AgentMessage(props));
  }
}

export interface AgentConsensusProps {
  summary: string;
  recommendedActions: AIAction[];
  overallConfidence: number;
  conflictsResolved: string[];
}

export class AgentConsensus extends ValueObject<AgentConsensusProps> {
  private constructor(props: AgentConsensusProps) {
    super(props);
  }

  get summary(): string { return this.props.summary; }
  get recommendedActions(): AIAction[] { return [...this.props.recommendedActions]; }
  get overallConfidence(): number { return this.props.overallConfidence; }
  get conflictsResolved(): string[] { return [...this.props.conflictsResolved]; }

  public static create(props: AgentConsensusProps): Result<AgentConsensus> {
    if (props.overallConfidence < 0 || props.overallConfidence > 100) {
      return ResultFactory.fail(new Error("Overall confidence must be between 0 and 100."));
    }
    return ResultFactory.ok(new AgentConsensus(props));
  }
}
