import { Result, ResultFactory } from "@marg/domain";
import { SyncEngine } from "./sync-engine";
import { SyncOperation } from "./sync-operation";
import { OfflineMutationQueue } from "@marg/storage-local";

export class MissionSyncService {
  constructor(
    private readonly syncEngine: SyncEngine,
    private readonly mutationQueue: OfflineMutationQueue
  ) {}

  public async syncOfflineMutations(): Promise<Result<void, Error>> {
    try {
      const pendingMutations = await this.mutationQueue.getPending();
      if (pendingMutations.length === 0) {
        return ResultFactory.ok<void>(undefined);
      }

      // Convert local OfflineMutation records to SyncOperation records
      const operations: SyncOperation[] = pendingMutations.map((m: any) => ({
        operationId: m.id,
        entityId: m.payload.id || m.payload.missionId || "",
        entityType: m.storeName,
        action: m.action === "CREATE" ? "CREATE" : m.action === "DELETE" ? "DELETE" : "UPDATE",
        payload: m.payload,
        timestamp: m.timestamp,
        version: m.payload.version || 1,
        metadata: {},
      }));

      const pushResult = await this.syncEngine.push(operations);

      if (pushResult.isFailure) {
        return ResultFactory.fail(new Error(pushResult.getError().message));
      }

      const val = pushResult.getValue();

      // Dequeue accepted operations
      for (const op of val.accepted) {
        // Find local mutation id corresponding to this operation
        const mutation = pendingMutations.find((m: any) => m.id === op.operationId);
        if (mutation) {
          await this.mutationQueue.dequeue(mutation.id);
        }
      }

      return ResultFactory.ok<void>(undefined);
    } catch (error: any) {
      return ResultFactory.fail(new Error(`Failed to sync offline mutations: ${error.message}`));
    }
  }
}
