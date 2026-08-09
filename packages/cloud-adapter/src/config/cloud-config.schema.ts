import { z } from "zod";

/**
 * Zod schema for cloud adapter configuration.
 * Validated at startup to catch misconfiguration early.
 */

export const retryConfigSchema = z.object({
  maxAttempts: z.number().int().min(1).max(10).default(3),
  baseDelayMs: z.number().int().min(100).max(60_000).default(1_000),
  maxDelayMs: z.number().int().min(1_000).max(300_000).default(30_000),
  backoffMultiplier: z.number().min(1).max(10).default(2),
  jitter: z.boolean().default(true),
});

export const authConfigSchema = z.object({
  autoRefreshToken: z.boolean().default(true),
  refreshThresholdMs: z.number().int().min(1_000).default(60_000),
  persistSession: z.boolean().default(true),
});

export const syncConfigSchema = z.object({
  batchSize: z.number().int().min(1).max(1_000).default(50),
  conflictStrategy: z
    .enum(["LAST_WRITE_WINS", "CLIENT_WINS", "SERVER_WINS", "MANUAL", "MERGE"])
    .default("LAST_WRITE_WINS"),
  syncIntervalMs: z.number().int().min(5_000).default(30_000),
  maxRetries: z.number().int().min(0).max(10).default(3),
});

export const storageConfigSchema = z.object({
  maxFileSizeBytes: z.number().int().min(0).default(50 * 1024 * 1024),
  defaultBucket: z.string().min(1).default("default"),
  signedUrlExpiryMs: z.number().int().min(60_000).default(3_600_000),
});

export const realtimeConfigSchema = z.object({
  reconnectIntervalMs: z.number().int().min(1_000).default(5_000),
  maxReconnectAttempts: z.number().int().min(0).default(10),
  heartbeatIntervalMs: z.number().int().min(5_000).default(30_000),
});

export const cloudConfigSchema = z.object({
  provider: z.string().min(1),
  region: z.string().optional(),
  auth: authConfigSchema.default({}),
  sync: syncConfigSchema.default({}),
  storage: storageConfigSchema.default({}),
  realtime: realtimeConfigSchema.default({}),
  retry: retryConfigSchema.default({}),
  providerOptions: z.record(z.unknown()).optional(),
});
