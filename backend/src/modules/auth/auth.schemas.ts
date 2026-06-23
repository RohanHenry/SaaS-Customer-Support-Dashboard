import { z } from "zod";

/**
 * Zod schemas describe the *shape* of valid input AND generate TypeScript types
 * from a single source of truth. Validate once at the edge (the route), and the
 * rest of the code can trust the data.
 */

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Types inferred directly from the schemas — no manual duplication.
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
