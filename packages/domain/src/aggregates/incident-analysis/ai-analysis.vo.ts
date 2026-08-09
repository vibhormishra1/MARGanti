import { ValueObject } from "../../value-objects/base.value-object";
import { Result, ResultFactory } from "../../types/result.type";

export interface RiskAssessmentProps {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  factors: string[];
}

export class RiskAssessment extends ValueObject<RiskAssessmentProps> {
  private constructor(props: RiskAssessmentProps) {
    super(props);
  }

  get level(): string { return this.props.level; }
  get factors(): string[] { return [...this.props.factors]; }

  public static create(props: RiskAssessmentProps): Result<RiskAssessment> {
    if (!["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(props.level)) {
      return ResultFactory.fail(new Error("Invalid risk level"));
    }
    return ResultFactory.ok(new RiskAssessment(props));
  }
}

export interface ImpactEstimationProps {
  affectedAreaRadiusMeters: number;
  estimatedCasualties: number;
  infrastructureDamage: "NONE" | "MINOR" | "SEVERE" | "TOTAL";
}

export class ImpactEstimation extends ValueObject<ImpactEstimationProps> {
  private constructor(props: ImpactEstimationProps) {
    super(props);
  }

  get affectedAreaRadiusMeters(): number { return this.props.affectedAreaRadiusMeters; }
  get estimatedCasualties(): number { return this.props.estimatedCasualties; }
  get infrastructureDamage(): string { return this.props.infrastructureDamage; }

  public static create(props: ImpactEstimationProps): Result<ImpactEstimation> {
    if (props.affectedAreaRadiusMeters < 0 || props.estimatedCasualties < 0) {
      return ResultFactory.fail(new Error("Impact estimations cannot be negative."));
    }
    return ResultFactory.ok(new ImpactEstimation(props));
  }
}

export interface AIActionProps {
  id: string;
  type: "DISPATCH" | "EVACUATE" | "CONTAIN" | "NOTIFY" | "RESOURCE_REQUEST";
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export class AIAction extends ValueObject<AIActionProps> {
  private constructor(props: AIActionProps) {
    super(props);
  }

  get id(): string { return this.props.id; }
  get type(): string { return this.props.type; }
  get description(): string { return this.props.description; }
  get priority(): string { return this.props.priority; }

  public static create(props: AIActionProps): Result<AIAction> {
    if (!props.description || props.description.trim().length === 0) {
      return ResultFactory.fail(new Error("Action description cannot be empty"));
    }
    return ResultFactory.ok(new AIAction(props));
  }
}
