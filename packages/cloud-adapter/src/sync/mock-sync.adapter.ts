import { ISyncService, SyncOperation, SyncConflict, Result, ResultFactory } from "@marg/domain";
import { SyncQueueLocalRepository, SyncConflictLocalRepository } from "@marg/storage-local";

export class MockSyncAdapter implements ISyncService {
  constructor(
    private queueRepo: SyncQueueLocalRepository,
    private conflictRepo: SyncConflictLocalRepository
  ) {}

  async enqueueMutation(operation: SyncOperation): Promise<Result<void>> {
    const queue = await this.queueRepo.getGlobalQueue();
    queue.queueOperation(operation);
    await this.queueRepo.save(queue);
    return ResultFactory.ok(undefined);
  }

  async pushOperations(): Promise<Result<{ conflicts: SyncConflict[] }>> {
    const queue = await this.queueRepo.getGlobalQueue();
    
    if (queue.isLocked) return ResultFactory.ok({ conflicts: [] });
    queue.lock();
    await this.queueRepo.save(queue);

    // Simulate network delay for pushing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const conflicts: SyncConflict[] = [];

    // Process operations (mock logic)
    for (const op of queue.operations) {
      // Artificially create a conflict for demonstration purposes if the entityId contains "conflict"
      if (op.entityId.includes("conflict")) {
        const cRes = SyncConflict.create({
          entityId: op.entityId,
          entityType: op.entityType,
          localPayload: op.payload,
          remotePayload: { ...op.payload, name: "Remote Edited Name" }
        });
        if (cRes.isSuccess) {
          const conflict = cRes.getValue();
          await this.conflictRepo.save(conflict);
          conflicts.push(conflict);
        }
      }
      
      queue.removeOperation(op.id);
    }

    queue.unlock();
    await this.queueRepo.save(queue);

    return ResultFactory.ok({ conflicts });
  }

  async pullUpdates(): Promise<Result<void>> {
    // Mock pulling remote state
    await new Promise(resolve => setTimeout(resolve, 1000));
    return ResultFactory.ok(undefined);
  }
}
