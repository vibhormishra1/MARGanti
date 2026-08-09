import { Entity } from "../base.entity";
import { ResourceQuantity } from "../../value-objects/resource-quantity.vo";

export interface ReservationProps {
  reservedBy: string;
  quantity: ResourceQuantity;
  expiresAt: Date;
  purpose: string;
}

export class Reservation extends Entity<ReservationProps> {
  private constructor(props: ReservationProps, id: string) {
    super(props, id);
  }

  get reservedBy(): string { return this.props.reservedBy; }
  get quantity(): ResourceQuantity { return this.props.quantity; }
  get expiresAt(): Date { return this.props.expiresAt; }
  get purpose(): string { return this.props.purpose; }

  public isExpired(now: Date = new Date()): boolean {
    return now > this.expiresAt;
  }

  public static create(props: ReservationProps, id?: string): Reservation {
    return new Reservation(props, id ?? crypto.randomUUID());
  }
}
