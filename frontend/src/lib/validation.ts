import { z } from "zod";
import { TICKET_PRIORITIES } from "./types";

/**
 * Client-side validation schemas (mirror the backend rules).
 * Validating in the browser gives instant feedback; the backend still validates
 * too, because client checks can be bypassed. Defense in depth.
 */

export const loginFormSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const ticketFormSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters"),
  priority: z.enum(TICKET_PRIORITIES),
  category: z.string().trim().max(50).optional(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type TicketFormValues = z.infer<typeof ticketFormSchema>;
