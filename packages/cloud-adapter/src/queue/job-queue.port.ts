import type { Result } from "@marg/domain";
import type { CloudAdapterError } from "../errors/cloud-adapter.error";
import type { JobDefinition, JobStatus, JobScheduleConfig } from "./job-definition";

/**
 * Job queue port — enqueue and manage background jobs.
 *
 * Implementations map to:
 * - Supabase Edge Functions + pg_cron
 * - Firebase Cloud Tasks
 * - AWS SQS + EventBridge Scheduler
 * - Azure Queue Storage + Azure Functions Timer
 * - BullMQ (self-hosted)
 *
 * This interface does NOT handle:
 * - Job handler implementations (consumers define those)
 * - Worker process lifecycle (infrastructure concern)
 */
export interface JobQueue {
  /**
   * Enqueue a job for immediate processing.
   * Returns the assigned job ID.
   */
  enqueue<T>(
    job: JobDefinition<T>
  ): Promise<Result<string, CloudAdapterError>>;

  /**
   * Schedule a job for future execution.
   * Supports both cron (recurring) and delay (one-shot) schedules.
   * Returns the assigned job ID.
   */
  schedule<T>(
    job: JobDefinition<T>,
    schedule: JobScheduleConfig
  ): Promise<Result<string, CloudAdapterError>>;

  /**
   * Cancel a pending or scheduled job.
   */
  cancel(jobId: string): Promise<Result<void, CloudAdapterError>>;

  /**
   * Get the current status of a job.
   */
  getStatus(jobId: string): Promise<Result<JobStatus, CloudAdapterError>>;
}
