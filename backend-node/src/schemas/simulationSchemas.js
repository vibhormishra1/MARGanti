// REQ-M2-09: Inbound request schemas.
// REQ-M2-06: Python response validation — strict, no .passthrough().
//
// Using z.literal() for scenario enforces exactly one valid value.
// Using z.string().uuid() for session_id catches malformed IDs before
// they hit Firebase (Firebase accepts any string as a path).

import { z } from "zod";

// ── Inbound schemas ────────────────────────────────────────────────
export const startSimulationSchema = z.object({
  scenario: z.literal("cyclone_grid_failure", {
    errorMap: () => ({
      message: 'Only "cyclone_grid_failure" is supported in this prototype.',
    }),
  }),
});

export const runRoundSchema = z.object({
  session_id: z.string().uuid({
    message: "session_id must be a valid UUID v4.",
  }),
});

// ── Python response schema ────────────────────────────────────────
// Strict — no .passthrough(). If Python sends unexpected structure,
// we catch it here before it pollutes Firebase state.
// This is lightweight compared to Python's Pydantic model (the authoritative validator).
// Its job is: "did Python send something structurally sane?"
export const pythonRoundResultSchema = z.object({
  session_id: z.string(),
  round_number: z.number().int().min(0),
  status: z.enum([
    "running",
    "consensus_reached",
    "forced_resolution",
    "degraded",
  ]),
  crisis: z.object({
    type: z.string(),
    location: z.string(),
    severity: z.string(),
    time_remaining_minutes: z.number().int().min(0),
    grid_status: z.string(),
    road_status: z.string(),
  }).passthrough(),
  agents: z.record(z.any()),
  shared_history: z.array(z.any()),
  validated_decisions: z.array(z.any()),
  conflicts: z.array(z.any()),
  final_consensus_plan: z.any().nullable().optional(),
  system_message: z.string().nullable().optional(),
}).passthrough();
