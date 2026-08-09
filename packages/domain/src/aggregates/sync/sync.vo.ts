import { ValueObject } from "../../value-objects/base.value-object";
import { Result, ResultFactory } from "../../types/result.type";

export type OperationType = "CREATE" | "UPDATE" | "DELETE";

export interface SyncOperationProps {
  id: string;
  entityId: string;
  entityType: string;
  operation: OperationType;
  payload: any;
  timestamp: Date;
  retryCount: number;
}

export class SyncOperation extends ValueObject<SyncOperationProps> {
  private constructor(props: SyncOperationProps) {
    super(props);
  }

  get id(): string { return this.props.id; }
  get entityId(): string { return this.props.entityId; }
  get entityType(): string { return this.props.entityType; }
  get operation(): OperationType { return this.props.operation; }
  get payload(): any { return this.props.payload; }
  get timestamp(): Date { return this.props.timestamp; }
  get retryCount(): number { return this.props.retryCount; }

  public incrementRetry(): SyncOperation {
    return new SyncOperation({ ...this.props, retryCount: this.props.retryCount + 1 });
  }

  public static create(props: Omit<SyncOperationProps, "retryCount">): Result<SyncOperation> {
    return ResultFactory.ok(new SyncOperation({ ...props, retryCount: 0 }));
  }
}

export interface VersionRecordProps {
  entityId: string;
  entityType: string;
  version: number;
  lastUpdatedAt: Date;
}

export class VersionRecord extends ValueObject<VersionRecordProps> {
  private constructor(props: VersionRecordProps) {
    super(props);
  }

  get entityId(): string { return this.props.entityId; }
  get entityType(): string { return this.props.entityType; }
  get version(): number { return this.props.version; }
  get lastUpdatedAt(): Date { return this.props.lastUpdatedAt; }

  public static create(props: VersionRecordProps): Result<VersionRecord> {
    return ResultFactory.ok(new VersionRecord(props));
  }
}

export type SyncStatus = "ONLINE" | "OFFLINE" | "SYNCING" | "ERROR";
