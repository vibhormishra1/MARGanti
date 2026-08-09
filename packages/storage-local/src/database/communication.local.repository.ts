import { Thread, ThreadRepository, NotificationRepository, AppNotification, Result, ResultFactory, DomainError } from "@marg/domain";

export class ThreadLocalRepository implements ThreadRepository {
  private storage: Map<string, Thread> = new Map();

  async findById(id: string): Promise<Thread | null> {
    return this.storage.get(id) || null;
  }

  async exists(id: string): Promise<boolean> {
    return this.storage.has(id);
  }

  async findByContext(contextId: string, contextType: string): Promise<Thread | null> {
    for (const thread of this.storage.values()) {
      if (thread.contextId === contextId && thread.contextType === contextType) {
        return thread;
      }
    }
    return null;
  }

  async save(entity: Thread): Promise<void> {
    this.storage.set(entity.id, entity);
  }

  async delete(id: string): Promise<void> {
    this.storage.delete(id);
  }
}

export class NotificationLocalRepository implements NotificationRepository {
  private storage: Map<string, AppNotification> = new Map();

  async findByRecipient(recipientId: string): Promise<AppNotification[]> {
    return Array.from(this.storage.values()).filter(n => n.recipientId === recipientId);
  }

  async save(notification: AppNotification): Promise<void> {
    this.storage.set(notification.id, notification);
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.storage.get(notificationId);
    if (notification) {
      this.storage.set(notificationId, notification.markAsRead());
    }
  }
}
