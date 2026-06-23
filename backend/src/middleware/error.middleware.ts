import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

/** Catch-all for requests that didn't match any route. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: "Route not found" });
}

/**
 * Central error handler. Express recognizes it as an error handler because it
 * has FOUR arguments. Every thrown error ends up here, so error responses have
 * one consistent shape: { message: string }.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Anything we didn't anticipate: log it and return a generic 500 so we never
  // leak internal details (stack traces, SQL) to the client.
  console.error("Unexpected error:", err);
  res.status(500).json({ message: "Internal server error" });
}
