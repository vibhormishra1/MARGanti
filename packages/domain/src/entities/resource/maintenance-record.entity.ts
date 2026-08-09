import { Entity } from "../base.entity";

export interface MaintenanceRecordProps {
  reportedIssue: string;
  reportedAt: Date;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
}

export class MaintenanceRecord extends Entity<MaintenanceRecordProps> {
  private constructor(props: MaintenanceRecordProps, id: string) {
    super(props, id);
  }

  get reportedIssue(): string { return this.props.reportedIssue; }
  get reportedAt(): Date { return this.props.reportedAt; }
  get status(): string { return this.props.status; }

  public resolve(): void {
    this.props.status = "RESOLVED";
  }

  public static create(props: MaintenanceRecordProps, id?: string): MaintenanceRecord {
    return new MaintenanceRecord(props, id ?? crypto.randomUUID());
  }
}
