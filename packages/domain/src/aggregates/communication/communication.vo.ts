import { ValueObject } from "../../value-objects/base.value-object";
import { Result, ResultFactory } from "../../types/result.type";

export type MessageType = "TEXT" | "SYSTEM_ANNOUNCEMENT" | "AI_RECOMMENDATION" | "MENTION";

export interface MessageProps {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  readBy: string[];
}

export class Message extends ValueObject<MessageProps> {
  private constructor(props: MessageProps) {
    super(props);
  }

  get id(): string { return this.props.id; }
  get senderId(): string { return this.props.senderId; }
  get senderName(): string { return this.props.senderName; }
  get content(): string { return this.props.content; }
  get type(): MessageType { return this.props.type; }
  get timestamp(): Date { return this.props.timestamp; }
  get readBy(): string[] { return [...this.props.readBy]; }

  public static create(props: MessageProps): Result<Message> {
    if (!props.content || props.content.trim() === "") {
      return ResultFactory.fail(new Error("Message content cannot be empty."));
    }
    return ResultFactory.ok(new Message(props));
  }
}

export type NotificationType = "ASSIGNMENT" | "MISSION_UPDATE" | "PRIORITY_ALERT" | "SYSTEM_ALERT";

export interface NotificationProps {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}

export class AppNotification extends ValueObject<NotificationProps> {
  private constructor(props: NotificationProps) {
    super(props);
  }

  get id(): string { return this.props.id; }
  get recipientId(): string { return this.props.recipientId; }
  get title(): string { return this.props.title; }
  get message(): string { return this.props.message; }
  get type(): NotificationType { return this.props.type; }
  get isRead(): boolean { return this.props.isRead; }
  get createdAt(): Date { return this.props.createdAt; }

  public markAsRead(): AppNotification {
    return new AppNotification({ ...this.props, isRead: true });
  }

  public static create(props: NotificationProps): Result<AppNotification> {
    return ResultFactory.ok(new AppNotification(props));
  }
}

export interface PresenceProps {
  userId: string;
  userName: string;
  status: "ONLINE" | "AWAY" | "OFFLINE";
  currentWorkspace?: string;
  lastSeen: Date;
}

export class Presence extends ValueObject<PresenceProps> {
  private constructor(props: PresenceProps) {
    super(props);
  }

  get userId(): string { return this.props.userId; }
  get userName(): string { return this.props.userName; }
  get status(): string { return this.props.status; }
  get currentWorkspace(): string | undefined { return this.props.currentWorkspace; }
  get lastSeen(): Date { return this.props.lastSeen; }

  public static create(props: PresenceProps): Result<Presence> {
    return ResultFactory.ok(new Presence(props));
  }
}
