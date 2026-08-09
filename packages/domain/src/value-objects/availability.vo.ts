import { ValueObject } from "./base.value-object";
import { ResultFactory, Result } from "../types/result.type";

interface AvailabilityProps {
  dayOfWeek?: number; // 0-6
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  specificDate?: Date;
  isAvailable: boolean;
}

export class Availability extends ValueObject<AvailabilityProps> {
  private constructor(props: AvailabilityProps) {
    super(props);
  }

  get dayOfWeek(): number | undefined { return this.props.dayOfWeek; }
  get startTime(): string | undefined { return this.props.startTime; }
  get endTime(): string | undefined { return this.props.endTime; }
  get specificDate(): Date | undefined { return this.props.specificDate; }
  get isAvailable(): boolean { return this.props.isAvailable; }

  public static create(props: AvailabilityProps): Result<Availability> {
    if (props.dayOfWeek !== undefined && (props.dayOfWeek < 0 || props.dayOfWeek > 6)) {
      return ResultFactory.fail(new Error("Invalid day of week"));
    }
    return ResultFactory.ok(new Availability(props));
  }
}
