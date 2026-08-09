import { Repository } from "./base.repository";
import { Thread } from "../aggregates/communication/communication.aggregate";
import { AppNotification } from "../aggregates/communication/communication.vo";

export interface ThreadRepository extends Repository<Thread> {
  findByContext(contextId: string, contextType: string): Promise<Thread | null>;
}

export interface NotificationRepository {
  findByRecipient(recipientId: string): Promise<AppNotification[]>;
  save(notification: AppNotification): Promise<void>;
  markAsRead(notificationId: string): Promise<void>;
}
