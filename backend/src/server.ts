import { createApp } from "./app.js";
import { env } from "./config/env.js";

/**
 * Entry point: build the app and start listening for HTTP requests.
 * This is the only file that actually opens a network port.
 */
const app = createApp();

app.listen(env.port, () => {
  console.log(`✅ SupportFlow API listening on http://localhost:${env.port}`);
  console.log(`   Health check: http://localhost:${env.port}/api/health`);
});
