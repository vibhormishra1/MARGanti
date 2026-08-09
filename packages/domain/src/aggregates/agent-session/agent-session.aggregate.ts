import { AggregateRoot } from "../aggregate-root";
import { Result, ResultFactory } from "../../types/result.type";
import { DomainError } from "../../errors/domain.error";
import { AgentMessage, AgentConsensus, SpecialistRole } from "./agent.vo";

export type SessionStatus = "PLANNING" | "DEBATING" | "CONSENSUS_REACHED" | "APPROVED" | "REJECTED";

export interface AgentSessionProps {
  incidentId: string;
  activeAgents: SpecialistRole[];
  sharedContext: string;
  conversationHistory: AgentMessage[];
  consensus?: AgentConsensus;
  status: SessionStatus;
  humanApprovalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AgentSession extends AggregateRoot<AgentSessionProps> {
  private constructor(props: AgentSessionProps, id: string) {
    super(props, id);
  }

  get incidentId(): string { return this.props.incidentId; }
  get activeAgents(): SpecialistRole[] { return [...this.props.activeAgents]; }
  get sharedContext(): string { return this.props.sharedContext; }
  get conversationHistory(): AgentMessage[] { return [...this.props.conversationHistory]; }
  get consensus(): AgentConsensus | undefined { return this.props.consensus; }
  get status(): SessionStatus { return this.props.status; }
  get humanApprovalNotes(): string | undefined { return this.props.humanApprovalNotes; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  public addMessage(message: AgentMessage): Result<void> {
    if (this.props.status === "APPROVED" || this.props.status === "REJECTED") {
      return ResultFactory.fail(new DomainError("Cannot add messages to a finalized session."));
    }
    if (!this.props.activeAgents.includes(message.role) && message.role !== "COORDINATOR") {
      this.props.activeAgents.push(message.role);
    }
    this.props.conversationHistory.push(message);
    this.props.updatedAt = new Date();
    return ResultFactory.ok(undefined);
  }

  public setConsensus(consensus: AgentConsensus): Result<void> {
    if (this.props.status === "APPROVED" || this.props.status === "REJECTED") {
      return ResultFactory.fail(new DomainError("Cannot set consensus on a finalized session."));
    }
    this.props.consensus = consensus;
    this.props.status = "CONSENSUS_REACHED";
    this.props.updatedAt = new Date();
    return ResultFactory.ok(undefined);
  }

  public approveConsensus(notes?: string): Result<void> {
    if (this.props.status !== "CONSENSUS_REACHED") {
      return ResultFactory.fail(new DomainError("Can only approve a session that has reached consensus."));
    }
    this.props.status = "APPROVED";
    this.props.humanApprovalNotes = notes;
    this.props.updatedAt = new Date();
    return ResultFactory.ok(undefined);
  }

  public rejectConsensus(reason: string): Result<void> {
    if (this.props.status !== "CONSENSUS_REACHED") {
      return ResultFactory.fail(new DomainError("Can only reject a session that has reached consensus."));
    }
    if (!reason || reason.trim() === "") {
      return ResultFactory.fail(new DomainError("Must provide a reason for rejecting consensus."));
    }
    this.props.status = "REJECTED";
    this.props.humanApprovalNotes = reason;
    this.props.updatedAt = new Date();
    return ResultFactory.ok(undefined);
  }

  public static create(props: { incidentId: string; sharedContext: string }, id?: string): Result<AgentSession> {
    const session = new AgentSession({
      incidentId: props.incidentId,
      sharedContext: props.sharedContext,
      activeAgents: ["COORDINATOR"],
      conversationHistory: [],
      status: "PLANNING",
      createdAt: new Date(),
      updatedAt: new Date()
    }, id ?? crypto.randomUUID());

    return ResultFactory.ok(session);
  }

  public static reconstitute(props: AgentSessionProps, id: string): Result<AgentSession> {
    return ResultFactory.ok(new AgentSession(props, id));
  }
}
