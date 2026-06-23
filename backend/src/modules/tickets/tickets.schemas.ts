import { z } from "zod";

/** These arrays must match the enums in schema.prisma exactly. */
export const TICKET_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
] as const;

export const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const createTicketSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters"),
  priority: z.enum(TICKET_PRIORITIES).default("MEDIUM"),
  category: z.string().trim().min(1).max(50).optional(),
});

/** All fields optional — a PATCH updates only what's sent. */
export const updateTicketSchema = z
  .object({
    status: z.enum(TICKET_STATUSES),
    priority: z.enum(TICKET_PRIORITIES),
    category: z.string().trim().min(1).max(50).nullable(),
    // null = unassign the ticket
    assignedAgentId: z.string().cuid().nullable(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export const addCommentSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty"),
});

export const TICKET_SORTS = ["newest", "oldest", "priority"] as const;

/**
 * Query params for the ticket list. Note `z.coerce.number()` — query strings
 * arrive as text (e.g. "2"), so we coerce them to numbers and apply sane
 * defaults + bounds (pageSize capped at 50 to protect the DB).
 */
export const listTicketsQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(TICKET_STATUSES).optional(),
  priority: z.enum(TICKET_PRIORITIES).optional(),
  // a user id, the literal "unassigned", or absent (= any)
  assignedAgentId: z.string().optional(),
  sort: z.enum(TICKET_SORTS).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;
