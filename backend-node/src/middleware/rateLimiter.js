// Protects /run-round from being spammed.
// 30 requests per minute per IP is generous for a demo but prevents accidents.

import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Slow down." },
});
