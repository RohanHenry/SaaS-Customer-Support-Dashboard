import type { Request, Response } from "express";
import { signToken } from "../../utils/jwt.js";
import { setAuthCookie, clearAuthCookie } from "../../utils/cookies.js";
import { AppError } from "../../utils/AppError.js";
import {
  registerUser,
  verifyCredentials,
  getUserById,
} from "./auth.service.js";

/**
 * Controllers are thin: read the request, call a service, shape the response.
 * All the heavy lifting lives in auth.service.ts.
 */

/** POST /api/auth/register — create an account and log them straight in. */
export async function register(req: Request, res: Response): Promise<void> {
  const user = await registerUser(req.body);

  const token = signToken({ sub: user.id, role: user.role });
  setAuthCookie(res, token);

  res.status(201).json({ user });
}

/** POST /api/auth/login — verify credentials, set the auth cookie. */
export async function login(req: Request, res: Response): Promise<void> {
  const user = await verifyCredentials(req.body);

  const token = signToken({ sub: user.id, role: user.role });
  setAuthCookie(res, token);

  res.status(200).json({ user });
}

/** POST /api/auth/logout — clear the cookie. */
export async function logout(_req: Request, res: Response): Promise<void> {
  clearAuthCookie(res);
  res.status(200).json({ message: "Logged out" });
}

/** GET /api/auth/me — return the currently logged-in user (or 401). */
export async function me(req: Request, res: Response): Promise<void> {
  // requireAuth has already populated req.user.
  const user = req.user ? await getUserById(req.user.id) : null;
  if (!user) {
    throw new AppError("You must be logged in", 401);
  }
  res.status(200).json({ user });
}
