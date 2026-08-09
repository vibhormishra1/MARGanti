import type { Metadata } from "../types/common.types";

/**
 * Job definition — describes a unit of background work.
 */
export interface JobDefinition<T = unknown> {
  /** Unique job type identifier (e.g., "sync:push", "email:send"). */
  readonly type: string;
  /** Job payload data. */
  readonly payload: T;
  /** Optional priority (higher = more urgent). Default: 0. */
  readonly priority?: number;
  /** Optional maximum number of retry attempts. */
  readonly maxRetries?: number;
  /** Optional timeout in milliseconds for a single job execution. */
  readonly timeoutMs?: number;
  /** Optional metadata for tracking/logging. */
  readonly metadata?: Metadata;
}

/**
 * Job status — snapshot of a job's lifecycle.
 */
export interface JobStatus {
  readonly jobId: string;
  readonly type: string;
  readonly state: JobState;
  readonly attempts: number;
  readonly maxRetries: number;
  readonly createdAt: number;
  readonly startedAt: number | null;
  readonly completedAt: number | null;
  readonly failedAt: number | null;
  readonly error: string | null;
}

/**
 * Job lifecycle states.
 */
export type JobState =
  | "pending"
  | "active"
  | "completed"
  | "failed"
  | "cancelled"
  | "scheduled";

/**
 * Cron-based schedule for recurring jobs.
 */
export interface CronSchedule {
  readonly kind: "cron";
  /** Standard 5-field cron expression (e.g., "* / 5 * * * *"). */
  readonly expression: string;
  /** Optional timezone (e.g., "Asia/Kolkata"). */
  readonly timezone?: string;
}

/**
 * Delay-based schedule for one-shot deferred jobs.
 */
export interface DelaySchedule {
  readonly kind: "delay";
  /** Delay in milliseconds from now. */
  readonly delayMs: number;
}

/**
 * Union of schedule types.
 */
export type JobScheduleConfig = CronSchedule | DelaySchedule;

/**
 * Job handler function. Receives the payload and returns void on success.
 * Throwing an error signals failure.
 */
export type JobHandler<T> = (payload: T, context: JobExecutionContext) => Promise<void>;

/**
 * Context provided to job handlers during execution.
 */
export interface JobExecutionContext {
  readonly jobId: string;
  readonly attempt: number;
  readonly maxRetries: number;
}
