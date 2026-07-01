import type { Response } from "express";
import { env } from "../config/env.js";

export const AUTH_COOKIE_NAME = "sf_token";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Store the JWT in an httpOnly cookie.
 *
 * Why a cookie instead of returning the token in JSON?
 *  - httpOnly means JavaScript on the page CANNOT read it, which protects the
 *    token from XSS (cross-site scripting) attacks. This is the safer pattern.
 *  - The browser automatically sends it on every request to our API, so the
 *    frontend never has to manually attach it.
 */
export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    // In production the frontend (e.g. vercel.app) and backend (e.g. railway.app)
    // are on different sites, so the cookie must be SameSite=None + Secure to be
    // sent cross-site. Locally we use Lax over http (Secure would block it).
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    maxAge: SEVEN_DAYS_MS,
    path: "/",
  });
}

/** Remove the auth cookie (used on logout). Attributes must match setAuthCookie. */
export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    path: "/",
  });
}
