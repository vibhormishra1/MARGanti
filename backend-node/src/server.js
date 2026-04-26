// Entry point. dotenv loaded ONCE here — never in any service or controller.
// If dotenv is imported in a service file, it might run before this and
// read nothing because the .env hasn't been parsed yet.

import "dotenv/config"; // ESM equivalent of dotenv.config()
import app from "./app.js";

const PORT = process.env.NODE_PORT || 4000;

app.listen(PORT, () => {
  console.log(`[M.A.R.G.] Node Orchestrator → port ${PORT}`);
});
