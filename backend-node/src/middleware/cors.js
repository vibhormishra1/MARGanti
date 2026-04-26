// REQ-M2-08: No wildcard (*) origin.
// Using a Set instead of Array for O(1) lookup — hot path, called on every request.

import cors from "cors";

const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173", // Vite default
  "http://localhost:5174", // Vite port fallback
  "http://localhost:3000", // CRA
  // Add Firebase Hosting domain before deployment:
  // "https://your-project.web.app",
]);

export const corsMiddleware = cors({
  origin(origin, callback) {
    // Allow requests with no origin header (Postman, server-to-server, curl)
    if (!origin || ALLOWED_ORIGINS.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: ${origin} not in allowlist`));
    }
  },
  methods: ["GET", "POST", "DELETE"],
  credentials: true,
});
