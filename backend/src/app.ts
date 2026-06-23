import express, { type Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import healthRoute from "./routes/health.route.js";
import authRoutes from "./modules/auth/auth.routes.js";
import ticketRoutes from "./modules/tickets/tickets.routes.js";
import userRoutes from "./modules/users/users.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import {
  notFoundHandler,
  errorHandler,
} from "./middleware/error.middleware.js";

/**
 * Builds and configures the Express application.
 * Keeping app creation separate from starting the server (see server.ts) makes
 * the app easy to import in tests later without opening a real network port.
 */
export function createApp(): Application {
  const app = express();

  // --- Global middleware (runs on every request, in order) ---

  // Allow the frontend (a different origin) to call this API, and send cookies.
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );

  // Parse incoming JSON request bodies into req.body
  app.use(express.json());

  // Parse cookies into req.cookies (needed to read the auth cookie)
  app.use(cookieParser());

  // --- Routes ---
  app.use("/api/health", healthRoute);
  app.use("/api/auth", authRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/analytics", analyticsRoutes);

  // --- Error handling (must be registered LAST) ---
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
