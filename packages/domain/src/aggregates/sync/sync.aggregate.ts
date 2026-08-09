import { AggregateRoot } from "../aggregate-root";
import { Result, ResultFactory } from "../../types/result.type";
import { SyncOperation } from "./sync.vo";

export interface SyncQueueProps {
  operations: SyncOperation[];
  isLocked: boolean;
  lastAttemptedAt?: Date;
}

export class SyncQueue extends AggregateRoot<SyncQueueProps> {
  private constructor(props: SyncQueueProps, id: string) {
    super(props, id);
  }

  get operations(): SyncOperation[] { return [...this.props.operations]; }
  get isLocked(): boolean { return this.props.isLocked; }
  get lastAttemptedAt(): Date | undefined { return this.props.lastAttemptedAt; }

  public queueOperation(operation: SyncOperation): Result<void> {
    this.props.operations.push(operation);
    return ResultFactory.ok(undefined);
  }

  public removeOperation(operationId: string): Result<void> {
    this.props.operations = this.props.operations.filter(op => op.id !== operationId);
    return ResultFactory.ok(undefined);
  }

  public lock(): Result<void> {
    this.props.isLocked = true;
    return ResultFactory.ok(undefined);
  }

  public unlock(): Result<void> {
    this.props.isLocked = false;
    this.props.lastAttemptedAt = new Date();
    return ResultFactory.ok(undefined);
  }

  public static create(id?: string): Result<SyncQueue> {
    const queue = new SyncQueue({
      operations: [],
      isLocked: false,
    }, id ?? "global-sync-queue");

    return ResultFactory.ok(queue);
  }
}

export interface SyncConflictProps {
  entityId: string;
  entityType: string;
  localPayload: any;
  remotePayload: any;
  resolutionStrategy?: "KEEP_LOCAL" | "KEEP_REMOTE" | "MANUAL_MERGE";
  mergedPayload?: any;
}

export class SyncConflict extends AggregateRoot<SyncConflictProps> {
  private constructor(props: SyncConflictProps, id: string) {
    super(props, id);
  }

  get entityId(): string { return this.props.entityId; }
  get entityType(): string { return this.props.entityType; }
  get localPayload(): any { return this.props.localPayload; }
  get remotePayload(): any { return this.props.remotePayload; }
  get resolutionStrategy(): string | undefined { return this.props.resolutionStrategy; }
  get mergedPayload(): any { return this.props.mergedPayload; }

  public resolve(strategy: "KEEP_LOCAL" | "KEEP_REMOTE" | "MANUAL_MERGE", mergedPayload?: any): Result<void> {
    this.props.resolutionStrategy = strategy;
    if (strategy === "MANUAL_MERGE") {
      if (!mergedPayload) {
        return ResultFactory.fail(new Error("Merged payload required for manual merge."));
      }
      this.props.mergedPayload = mergedPayload;
    }
    return ResultFactory.ok(undefined);
  }

  public static create(props: Omit<SyncConflictProps, "resolutionStrategy" | "mergedPayload">, id?: string): Result<SyncConflict> {
    return ResultFactory.ok(new SyncConflict(props, id ?? crypto.randomUUID()));
  }
}
