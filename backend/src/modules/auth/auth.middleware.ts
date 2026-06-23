import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@prisma/client";
import { AUTH_COOKIE_NAME } from "../../utils/cookies.js";
import { verifyToken } from "../../utils/jwt.js";
import { AppError } from "../../utils/AppError.js";

/**
 * requireAuth — gatekeeper for protected routes.
 * Reads the JWT from the httpOnly cookie, verifies it, and attaches the user's
 * id + role to req.user. If the token is missing or invalid, it stops the
 * request with 401 and the protected controller never runs.
 */
export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    throw new AppError("You must be logged in", 401);
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    throw new AppError("Session expired. Please log in again.", 401);
  }
}

/**
 * requireRole — role-based access control.
 * Use AFTER requireAuth. Example: requireRole("ADMIN") blocks everyone who
 * isn't an admin with a 403 (forbidden — "logged in, but not allowed").
 */
export function requireRole(...allowed: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError("You must be logged in", 401);
    }
    if (!allowed.includes(req.user.role)) {
      throw new AppError("You do not have permission to do this", 403);
    }
    next();
  };
}
