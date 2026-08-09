import { AggregateRoot } from "../../aggregates/aggregate-root";
import { TeamStatus } from "../../value-objects/responder-status.enum";
import { ResultFactory, Result } from "../../types/result.type";
import { DomainError } from "../../errors/domain.error";
import { TeamDispatchedEvent } from "../../events/workforce/team-dispatched.event";

export interface TeamProps {
  organizationId: string;
  name: string;
  teamLeaderId: string;
  members: string[]; // Responder IDs
  currentIncidentId: string | null;
  status: TeamStatus;
}

export class Team extends AggregateRoot<TeamProps> {
  private constructor(props: TeamProps, id: string) {
    super(props, id);
  }

  get organizationId(): string { return this.props.organizationId; }
  get name(): string { return this.props.name; }
  get teamLeaderId(): string { return this.props.teamLeaderId; }
  get members(): string[] { return [...this.props.members]; }
  get currentIncidentId(): string | null { return this.props.currentIncidentId; }
  get status(): TeamStatus { return this.props.status; }

  public static create(
    id: string,
    organizationId: string,
    name: string,
    teamLeaderId: string
  ): Team {
    return new Team({
      organizationId,
      name,
      teamLeaderId,
      members: [teamLeaderId], // Leader is implicitly a member
      currentIncidentId: null,
      status: TeamStatus.IDLE
    }, id);
  }

  public addMember(responderId: string): Result<void> {
    if (this.props.members.includes(responderId)) {
      return ResultFactory.fail(new DomainError("Responder is already a member of this team."));
    }
    this.props.members.push(responderId);
    return ResultFactory.ok(undefined);
  }

  public dispatch(incidentId: string): Result<void> {
    if (this.props.status !== TeamStatus.IDLE) {
      return ResultFactory.fail(new DomainError("Team is not idle and cannot be dispatched."));
    }
    this.props.currentIncidentId = incidentId;
    this.props.status = TeamStatus.DISPATCHED;

    this.addDomainEvent(new TeamDispatchedEvent(this.id, incidentId));
    return ResultFactory.ok(undefined);
  }
}
