import type { JobHandler } from "./job-definition";

/**
 * Job scheduler port — registers handlers and manages the worker lifecycle.
 *
 * Separated from JobQueue because:
 * - Queue is used by producers (enqueue/schedule)
 * - Scheduler is used by consumers (register handlers, start/stop worker)
 *
 * This interface does NOT handle:
 * - Job handler business logic (consumers define handlers)
 * - Process management (infrastructure concern)
 */
export interface JobScheduler {
  /**
   * Register a handler for a specific job type.
   * Only one handler per job type is allowed.
   */
  register<T>(jobType: string, handler: JobHandler<T>): void;

  /**
   * Start processing jobs. Begins pulling from the queue.
   */
  start(): Promise<void>;

  /**
   * Stop processing. In-flight jobs complete; no new jobs are pulled.
   */
  stop(): Promise<void>;

  /**
   * Returns true if the scheduler is currently processing jobs.
   */
  isRunning(): boolean;
}
