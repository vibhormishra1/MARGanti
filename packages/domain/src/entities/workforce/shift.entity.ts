import { Entity } from "../base.entity";

export interface ShiftProps {
  startTime: Date;
  endTime: Date;
  checkInTime: Date | null;
  checkOutTime: Date | null;
}

export class Shift extends Entity<ShiftProps> {
  private constructor(props: ShiftProps, id: string) {
    super(props, id);
  }

  get startTime(): Date { return this.props.startTime; }
  get endTime(): Date { return this.props.endTime; }
  get checkInTime(): Date | null { return this.props.checkInTime; }
  get checkOutTime(): Date | null { return this.props.checkOutTime; }

  public checkIn(now: Date = new Date()): void {
    if (!this.props.checkInTime) {
      this.props.checkInTime = now;
    }
  }

  public checkOut(now: Date = new Date()): void {
    if (!this.props.checkOutTime) {
      this.props.checkOutTime = now;
    }
  }

  public static create(props: ShiftProps, id?: string): Shift {
    return new Shift(props, id ?? crypto.randomUUID());
  }
}
