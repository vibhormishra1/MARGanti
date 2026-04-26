// REQ-M2-10: Firebase Admin SDK for all RTDB operations.
// REQ-M2-11: All writes use .set() — NEVER .update().
// REQ-M5-01: Path schema: /sessions/{session_id}/state
//
// initFirebase() is called ONCE in app.js at startup.
// The `initialized` boolean + admin.apps.length guard is belt-and-suspenders:
// one stops double-init in production, the other stops it in test/hot-reload.

import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";

let initialized = false;

export function initFirebase() {
  if (initialized || admin.apps.length > 0) {
    initialized = true;
    return;
  }

  // Support two credential strategies so the team can pick what works for them
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const keyJSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  let credential;

  if (keyPath && existsSync(keyPath)) {
    // Strategy A: file path — cleaner, avoids JSON-in-env escaping nightmares
    credential = admin.credential.cert(
      JSON.parse(readFileSync(keyPath, "utf8"))
    );
  } else if (keyJSON) {
    // Strategy B: stringified JSON in env var
    credential = admin.credential.cert(JSON.parse(keyJSON));
  } else {
    console.warn(
      "[Firebase] ⚠ Credentials not found. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON."
    );
    console.warn("[Firebase] Running in DEGRADED mode — all Firebase operations will fail.");
    return; // Don't crash — let the server start for HTTP-layer testing
  }

  admin.initializeApp({
    credential,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  initialized = true;
  console.log("[Firebase] Admin SDK initialised.");
}

// ── Internal helper — get DB instance ─────────────────────────────
function db() {
  return admin.database();
}

// ── writeSessionState ─────────────────────────────────────────────
// REQ-M2-11: .set() writes the COMPLETE object — never partial .update().
// This prevents stale fields from a previous round persisting in Firebase
// if Python restructures any part of the state.
export async function writeSessionState(sessionId, state) {
  await db().ref(`sessions/${sessionId}/state`).set(state);
}

// ── getSessionState ───────────────────────────────────────────────
// Returns the full state object or null if the session doesn't exist.
export async function getSessionState(sessionId) {
  const snap = await db().ref(`sessions/${sessionId}/state`).once("value");
  return snap.val(); // null if path doesn't exist
}

// ── deleteSession ─────────────────────────────────────────────────
// Deletes the entire /sessions/{sessionId} tree (not just /state).
// Cleans up all sub-paths in one atomic operation.
export async function deleteSession(sessionId) {
  await db().ref(`sessions/${sessionId}`).remove();
}

// ── scheduleSessionCleanup ────────────────────────────────────────
// REQ-M2-03: 1-hour TTL via setTimeout.
// Caveat: this lives in Node's event loop. If Node restarts before
// the timeout fires, cleanup won't happen. Acceptable for a hackathon.
// Production fix: Cloud Tasks or Firebase TTL security rules.
export function scheduleSessionCleanup(sessionId) {
  const ONE_HOUR = 60 * 60 * 1000;
  setTimeout(async () => {
    try {
      await deleteSession(sessionId);
      console.log(`[TTL] Session cleaned up: ${sessionId}`);
    } catch (err) {
      console.error(`[TTL] Cleanup failed for ${sessionId}:`, err.message);
    }
  }, ONE_HOUR);
}
