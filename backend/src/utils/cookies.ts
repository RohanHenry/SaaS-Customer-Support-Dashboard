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
    secure: env.isProduction, // only sent over HTTPS in production
    sameSite: "lax", // sent on same-site requests (localhost:3000 → localhost:4000)
    maxAge: SEVEN_DAYS_MS,
    path: "/",
  });
}

/** Remove the auth cookie (used on logout). */
export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
}
