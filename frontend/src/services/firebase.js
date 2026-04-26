// Gemini's pattern is cleaner here — onValue() returns its own unsubscribe.
// We use that directly instead of calling off() separately.

import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey:      import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:   import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

// getApps() guard: prevents "Firebase App already exists" crash on Vite hot reload.
// Neither GPT nor Gemini have this — you will hit this error within 10 minutes.
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const db = getDatabase(app);

/**
 * subscribeToSession
 * Attaches a listener to /sessions/{id}/state.
 * onValue fires immediately with current data, then on every backend push.
 * Returns the unsubscribe function — call it in useEffect cleanup to detach.
 *
 * @param {string} sessionId - UUID from POST /api/simulation/start
 * @param {function} onUpdate - callback receiving the fresh state object
 * @returns {function} unsubscribe - call to detach the Firebase listener
 */
export function subscribeToSession(sessionId, onUpdate) {
  const sessionRef = ref(db, `sessions/${sessionId}/state`);
  // onValue() returns an unsubscribe function directly (Firebase v9+)
  const unsubscribe = onValue(sessionRef, (snapshot) => {
    if (snapshot.exists()) onUpdate(snapshot.val());
  });
  return unsubscribe;
}
