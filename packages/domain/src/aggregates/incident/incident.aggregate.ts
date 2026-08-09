import { AggregateRoot } from "../../aggregates/aggregate-root";
import { GeoLocation } from "../../value-objects/geo-location.vo";
import { IncidentStatus } from "./incident-status.enum";
import { IncidentPriority } from "./incident-priority.enum";
import { ResultFactory, Result } from "../../types/result.type";
import { IncidentReportedEvent } from "../../events/incident/incident-reported.event";
import { IncidentStatusChangedEvent } from "../../events/incident/incident-status-changed.event";
import { DomainError } from "../../errors/domain.error";

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  action: string;
  description: string;
  actorId: string;
}

export interface IncidentProps {
  title: string;
  description: string;
  location: GeoLocation;
  priority: IncidentPriority;
  status: IncidentStatus;
  reporterId: string;
  assignedResponders: string[];
  attachments: string[];
  timeline: TimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export class Incident extends AggregateRoot<IncidentProps> {
  private constructor(props: IncidentProps, id: string) {
    super(props, id);
  }

  get title(): string { return this.props.title; }
  get description(): string { return this.props.description; }
  get location(): GeoLocation { return this.props.location; }
  get priority(): IncidentPriority { return this.props.priority; }
  get status(): IncidentStatus { return this.props.status; }
  get reporterId(): string { return this.props.reporterId; }
  get assignedResponders(): string[] { return [...this.props.assignedResponders]; }
  get attachments(): string[] { return [...this.props.attachments]; }
  get timeline(): TimelineEvent[] { return [...this.props.timeline]; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  /**
   * Create a new Incident (Factory method)
   */
  public static report(
    id: string,
    title: string,
    description: string,
    location: GeoLocation,
    priority: IncidentPriority,
    reporterId: string
  ): Result<Incident> {
    if (!title || title.trim().length === 0) {
      return ResultFactory.fail(new DomainError("Title cannot be empty."));
    }

    const now = new Date();
    
    const incident = new Incident({
      title,
      description,
      location,
      priority,
      status: IncidentStatus.REPORTED,
      reporterId,
      assignedResponders: [],
      attachments: [],
      timeline: [{
        id: crypto.randomUUID(),
        timestamp: now,
        action: "REPORTED",
        description: `Incident reported with priority ${priority}`,
        actorId: reporterId
      }],
      createdAt: now,
      updatedAt: now
    }, id);

    incident.addDomainEvent(new IncidentReportedEvent(id, reporterId, title, priority, location));
    
    return ResultFactory.ok(incident);
  }

  /**
   * Reconstitute an existing Incident from persistence
   */
  public static load(props: IncidentProps, id: string): Result<Incident> {
    return ResultFactory.ok(new Incident(props, id));
  }

  /**
   * State Transition: Change Status
   */
  public changeStatus(newStatus: IncidentStatus, actorId: string, reason?: string): Result<void> {
    const oldStatus = this.props.status;
    
    if (oldStatus === IncidentStatus.CLOSED) {
      return ResultFactory.fail(new DomainError("Cannot change status of a CLOSED incident."));
    }

    if (newStatus === IncidentStatus.CLOSED && oldStatus !== IncidentStatus.RESOLVED) {
      return ResultFactory.fail(new DomainError("Incident must be RESOLVED before it can be CLOSED."));
    }

    this.props.status = newStatus;
    this.props.updatedAt = new Date();

    this.addTimelineEvent(
      "STATUS_CHANGED", 
      `Status changed from ${oldStatus} to ${newStatus}${reason ? `: ${reason}` : ''}`, 
      actorId
    );

    this.addDomainEvent(new IncidentStatusChangedEvent(this.id, oldStatus, newStatus, actorId));
    
    return ResultFactory.ok(undefined);
  }

  /**
   * Assign a responder
   */
  public assignResponder(responderId: string, actorId: string): Result<void> {
    if (this.props.status === IncidentStatus.CLOSED || this.props.status === IncidentStatus.RESOLVED) {
      return ResultFactory.fail(new DomainError("Cannot assign responders to inactive incidents."));
    }

    if (this.props.assignedResponders.includes(responderId)) {
      return ResultFactory.fail(new DomainError("Responder is already assigned to this incident."));
    }

    this.props.assignedResponders.push(responderId);
    this.props.updatedAt = new Date();
    
    // Auto-transition to ACTIVE if it was REPORTED or ASSESSED
    if (this.props.status === IncidentStatus.REPORTED || this.props.status === IncidentStatus.ASSESSED) {
      this.changeStatus(IncidentStatus.ACTIVE, actorId, "Auto-transitioned upon responder assignment");
    }

    this.addTimelineEvent("RESPONDER_ASSIGNED", `Responder ${responderId} assigned`, actorId);
    
    return ResultFactory.ok(undefined);
  }

  /**
   * Add attachment
   */
  public addAttachment(url: string, actorId: string): Result<void> {
    if (this.props.attachments.includes(url)) return ResultFactory.ok(undefined);
    
    this.props.attachments.push(url);
    this.props.updatedAt = new Date();
    this.addTimelineEvent("ATTACHMENT_ADDED", `Attachment added: ${url}`, actorId);
    
    return ResultFactory.ok(undefined);
  }

  /**
   * Internal helper to add timeline events
   */
  private addTimelineEvent(action: string, description: string, actorId: string): void {
    this.props.timeline.push({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      action,
      description,
      actorId
    });
  }
}
