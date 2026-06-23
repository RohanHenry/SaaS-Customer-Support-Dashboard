/**
 * Shared TypeScript types for the frontend.
 * These mirror the shapes our backend returns, so data is typed end-to-end.
 */

export type UserRole = "ADMIN" | "SUPPORT_AGENT" | "CUSTOMER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/** Human-friendly labels for each role (for badges, dropdowns, etc.). */
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  SUPPORT_AGENT: "Support Agent",
  CUSTOMER: "Customer",
};

// ─── Tickets ─────────────────────────────────────────────────────

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export const TICKET_STATUSES: TicketStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];
export const TICKET_PRIORITIES: TicketPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

/** Tailwind classes for each status/priority badge. */
export const STATUS_STYLES: Record<TicketStatus, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-200 text-slate-600",
};

export const PRIORITY_STYLES: Record<TicketPriority, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-amber-100 text-amber-700",
  URGENT: "bg-red-100 text-red-700",
};

/** Solid fill colors for chart bars. */
export const STATUS_BAR_COLORS: Record<TicketStatus, string> = {
  OPEN: "bg-blue-500",
  IN_PROGRESS: "bg-amber-500",
  RESOLVED: "bg-emerald-500",
  CLOSED: "bg-slate-400",
};

export const PRIORITY_BAR_COLORS: Record<TicketPriority, string> = {
  LOW: "bg-slate-400",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-amber-500",
  URGENT: "bg-red-500",
};

/** A user as it appears nested inside ticket data (no password hash). */
export interface TicketUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface TicketComment {
  id: string;
  body: string;
  createdAt: string;
  author: TicketUser;
}

export interface TicketStatusHistoryEntry {
  id: string;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus;
  createdAt: string;
  changedBy: TicketUser;
}

/** A ticket as returned by the list endpoint. */
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  assignedAgentId: string | null;
  createdBy: TicketUser;
  assignedAgent: TicketUser | null;
  _count?: { comments: number };
}

/** A ticket with its full conversation + history (detail endpoint). */
export interface TicketDetail extends Ticket {
  comments: TicketComment[];
  statusHistory: TicketStatusHistoryEntry[];
}
