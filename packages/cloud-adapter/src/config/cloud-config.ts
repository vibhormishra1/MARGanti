import { z } from "zod";
import { ResultFactory, type Result } from "@marg/domain";
import { CloudAdapterError } from "../errors/cloud-adapter.error";
import {
  cloudConfigSchema,
  retryConfigSchema,
  authConfigSchema,
  syncConfigSchema,
  storageConfigSchema,
  realtimeConfigSchema,
} from "./cloud-config.schema";

/**
 * Inferred configuration types from Zod schemas.
 */
export type CloudConfig = z.infer<typeof cloudConfigSchema>;
export type RetryConfig = z.infer<typeof retryConfigSchema>;
export type AuthConfig = z.infer<typeof authConfigSchema>;
export type SyncConfig = z.infer<typeof syncConfigSchema>;
export type StorageConfig = z.infer<typeof storageConfigSchema>;
export type RealtimeConfig = z.infer<typeof realtimeConfigSchema>;

/** Conflict resolution strategy identifiers. */
export type ConflictStrategy = SyncConfig["conflictStrategy"];

/**
 * Validates and parses raw configuration input.
 * Returns a Result to follow the domain's error-as-value pattern.
 */
export function parseCloudConfig(
  raw: unknown
): Result<CloudConfig, CloudAdapterError> {
  const result = cloudConfigSchema.safeParse(raw);
  if (result.success) {
    return ResultFactory.ok(result.data);
  }
  const message = result.error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("; ");
  return ResultFactory.fail(
    new CloudAdapterError(`Invalid cloud configuration: ${message}`, {
      code: "CLOUD_CONFIG_INVALID",
      metadata: { issues: result.error.issues },
    })
  );
}

/**
 * Creates a CloudConfig with defaults, merging partial overrides.
 */
export function createDefaultConfig(
  overrides: Partial<CloudConfig> & Pick<CloudConfig, "provider">
): CloudConfig {
  return cloudConfigSchema.parse(overrides);
}
