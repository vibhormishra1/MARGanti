import express from "express";
import helmet from "helmet";
import { corsMiddleware } from "./middleware/cors.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { requireJSON } from "./middleware/requireJSON.js";
import simulationRoutes from "./routes/simulationRoutes.js";
import { initFirebase } from "./services/firebaseService.js";

// Firebase init happens once at startup — not per-request
initFirebase();

const app = express();

// Railway / cloud proxies set X-Forwarded-For — Express must trust it
// or express-rate-limit crashes with ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
app.set("trust proxy", 1);

// Security headers — FAANG standard, one-liner
// Must come before routes
app.use(helmet());

// CORS — explicit origins, no wildcard
app.use(corsMiddleware);

// Enforce Content-Type: application/json on all POST requests
// Prevents express.json() silently producing undefined body
app.use(requireJSON);

// Parse JSON body
app.use(express.json());

// Rate limiting — protects Gemini API from button-spam during demo
app.use("/api/simulation/run-round", rateLimiter);

// Routes
app.use("/api/simulation", simulationRoutes);

// Health endpoint — CRITICAL for hackathon debugging
// Check if Node is alive without touching simulation state
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "marg-node-orchestrator", ts: Date.now() });
});

// Global error handler — last middleware, 4 args required by Express
// Catches anything that calls next(err)
app.use((err, _req, res, _next) => {
  console.error("[UNHANDLED]", err.message);
  res.status(500).json({ error: "Internal server error." });
});

export default app;
