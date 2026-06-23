import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";

/**
 * The "service" layer holds business logic + database access. Controllers stay
 * thin (just req/res); services are reusable and easy to test in isolation.
 */

/** A user object that is safe to send to the client (no password hash). */
export type PublicUser = Omit<User, "passwordHash">;

/** Strip the password hash before returning a user to the outside world. */
function toPublicUser(user: User): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user;
  return safe;
}

/** Create a new CUSTOMER account. */
export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: "CUSTOMER", // public sign-up always creates a customer
    },
  });

  return toPublicUser(user);
}

/** Verify credentials and return the public user if they match. */
export async function verifyCredentials(input: LoginInput): Promise<PublicUser> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  // Use the same error for "no user" and "wrong password" so attackers can't
  // tell which emails are registered (prevents account enumeration).
  const invalid = new AppError("Invalid email or password", 401);
  if (!user) throw invalid;

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) throw invalid;

  return toPublicUser(user);
}

/** Load a user by id (used by the auth middleware / "who am I" endpoint). */
export async function getUserById(id: string): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toPublicUser(user) : null;
}
