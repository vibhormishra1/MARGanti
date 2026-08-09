/**
 * Abstracted clock for deterministic time-based testing.
 *
 * Production code uses RealClock. Tests use FakeClock to control time
 * without setTimeout/setInterval flakiness.
 */
export interface Clock {
  /** Returns current time in milliseconds since Unix epoch. */
  now(): number;

  /** Returns current time as ISO 8601 string. */
  isoNow(): string;

  /**
   * Async delay for the given milliseconds.
   * FakeClock resolves immediately; RealClock uses setTimeout.
   */
  delay(ms: number): Promise<void>;
}

/**
 * Real clock backed by Date and setTimeout.
 */
export class RealClock implements Clock {
  now(): number {
    return Date.now();
  }

  isoNow(): string {
    return new Date().toISOString();
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Fake clock for deterministic testing.
 * Time only advances when explicitly told to via `advance()`.
 */
export class FakeClock implements Clock {
  private currentMs: number;

  constructor(startMs: number = 0) {
    this.currentMs = startMs;
  }

  now(): number {
    return this.currentMs;
  }

  isoNow(): string {
    return new Date(this.currentMs).toISOString();
  }

  delay(_ms: number): Promise<void> {
    return Promise.resolve();
  }

  /** Advance the clock by the given number of milliseconds. */
  advance(ms: number): void {
    this.currentMs += ms;
  }

  /** Set the clock to an absolute timestamp. */
  setTime(ms: number): void {
    this.currentMs = ms;
  }
}
