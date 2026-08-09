import { Entity } from "../base.entity";

export interface CertificationProps {
  name: string;
  issuedAt: Date;
  expiresAt: Date | null;
  licenseNumber: string;
}

export class Certification extends Entity<CertificationProps> {
  private constructor(props: CertificationProps, id: string) {
    super(props, id);
  }

  get name(): string { return this.props.name; }
  get issuedAt(): Date { return this.props.issuedAt; }
  get expiresAt(): Date | null { return this.props.expiresAt; }
  get licenseNumber(): string { return this.props.licenseNumber; }

  public isExpired(now: Date = new Date()): boolean {
    if (!this.props.expiresAt) return false;
    return now > this.props.expiresAt;
  }

  public static create(props: CertificationProps, id?: string): Certification {
    return new Certification(props, id ?? crypto.randomUUID());
  }
}
