import { AggregateRoot } from "../aggregate-root";
import { Result, ResultFactory } from "../../types/result.type";
import { DomainError } from "../../errors/domain.error";
import { Message } from "./communication.vo";

export type ThreadContextType = "INCIDENT" | "MISSION" | "TEAM" | "DIRECT";

export interface ThreadProps {
  contextId: string; // ID of the Incident, Mission, etc.
  contextType: ThreadContextType;
  title: string;
  messages: Message[];
  participants: string[]; // User IDs
  createdAt: Date;
  updatedAt: Date;
}

export class Thread extends AggregateRoot<ThreadProps> {
  private constructor(props: ThreadProps, id: string) {
    super(props, id);
  }

  get contextId(): string { return this.props.contextId; }
  get contextType(): ThreadContextType { return this.props.contextType; }
  get title(): string { return this.props.title; }
  get messages(): Message[] { return [...this.props.messages]; }
  get participants(): string[] { return [...this.props.participants]; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  public addMessage(message: Message): Result<void> {
    this.props.messages.push(message);
    if (!this.props.participants.includes(message.senderId)) {
      this.props.participants.push(message.senderId);
    }
    this.props.updatedAt = new Date();
    return ResultFactory.ok(undefined);
  }

  public static create(props: Omit<ThreadProps, "messages" | "createdAt" | "updatedAt">, id?: string): Result<Thread> {
    const thread = new Thread({
      ...props,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }, id ?? crypto.randomUUID());

    return ResultFactory.ok(thread);
  }

  public static reconstitute(props: ThreadProps, id: string): Result<Thread> {
    return ResultFactory.ok(new Thread(props, id));
  }
}
