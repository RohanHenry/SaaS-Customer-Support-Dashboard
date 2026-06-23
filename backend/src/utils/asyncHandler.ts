import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async route handler so any rejected promise (thrown error) is
 * forwarded to Express's error handler via next(err).
 *
 * Without this, an error thrown inside an `async` controller would become an
 * unhandled promise rejection and the request would hang. With it, we can just
 * `throw` in controllers and trust the central error handler to respond.
 */
export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
