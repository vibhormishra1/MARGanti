import { AggregateRoot } from "../../aggregates/aggregate-root";
import { ContactInfo } from "../../value-objects/contact-info.vo";
import { Availability } from "../../value-objects/availability.vo";
import { ResponderStatus, ResponderType } from "../../value-objects/responder-status.enum";
import { Certification } from "../../entities/workforce/certification.entity";
import { Shift } from "../../entities/workforce/shift.entity";
import { GeoLocation } from "../../value-objects/geo-location.vo";
import { ResultFactory, Result } from "../../types/result.type";
import { DomainError } from "../../errors/domain.error";
import { ResponderCheckedInEvent } from "../../events/workforce/responder-checked-in.event";

export interface ResponderProps {
  organizationId: string;
  type: ResponderType;
  contactInfo: ContactInfo;
  skills: string[];
  certifications: Certification[];
  availability: Availability[];
  status: ResponderStatus;
  currentLocation: GeoLocation | null;
  shifts: Shift[];
}

export class Responder extends AggregateRoot<ResponderProps> {
  private constructor(props: ResponderProps, id: string) {
    super(props, id);
  }

  get organizationId(): string { return this.props.organizationId; }
  get type(): ResponderType { return this.props.type; }
  get contactInfo(): ContactInfo { return this.props.contactInfo; }
  get skills(): string[] { return [...this.props.skills]; }
  get certifications(): Certification[] { return [...this.props.certifications]; }
  get availability(): Availability[] { return [...this.props.availability]; }
  get status(): ResponderStatus { return this.props.status; }
  get currentLocation(): GeoLocation | null { return this.props.currentLocation; }
  get shifts(): Shift[] { return [...this.props.shifts]; }

  public static create(
    id: string,
    organizationId: string,
    type: ResponderType,
    contactInfo: ContactInfo,
    skills: string[]
  ): Responder {
    return new Responder({
      organizationId,
      type,
      contactInfo,
      skills,
      certifications: [],
      availability: [],
      status: ResponderStatus.OFF_DUTY,
      currentLocation: null,
      shifts: []
    }, id);
  }

  public checkIn(shiftId: string, location: GeoLocation | null): Result<void> {
    const shift = this.props.shifts.find(s => s.id === shiftId);
    if (!shift) {
      return ResultFactory.fail(new DomainError("Shift not found."));
    }
    
    if (this.props.status === ResponderStatus.INCAPACITATED) {
      return ResultFactory.fail(new DomainError("Cannot check in while incapacitated."));
    }

    shift.checkIn();
    this.props.status = ResponderStatus.ON_DUTY;
    this.props.currentLocation = location;

    this.addDomainEvent(new ResponderCheckedInEvent(this.id, location));
    return ResultFactory.ok(undefined);
  }

  public updateLocation(location: GeoLocation): void {
    this.props.currentLocation = location;
  }
}
