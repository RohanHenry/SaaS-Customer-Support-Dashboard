import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRole } from "@prisma/client";

/**
 * The data we embed inside the JWT. Keep it small — it travels on every request.
 * `sub` (subject) is the standard JWT field for "who this token is about".
 */
export interface JwtPayload {
  sub: string; // user id
  role: UserRole;
}

/** Create a signed token for a logged-in user. */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

/** Verify a token and return its payload, or throw if invalid/expired. */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
