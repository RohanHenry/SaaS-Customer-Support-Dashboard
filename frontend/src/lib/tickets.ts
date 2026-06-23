/**
 * Ticket API service layer. All ticket-related backend calls live here so the
 * components stay focused on rendering.
 */
import { apiFetch } from "./api";
import type {
  Ticket,
  TicketComment,
  TicketDetail,
  TicketPriority,
  TicketStatus,
} from "./types";

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: TicketPriority;
  category?: string;
}

export interface UpdateTicketPayload {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string | null;
  assignedAgentId?: string | null;
}

export type TicketSort = "newest" | "oldest" | "priority";

export interface TicketListParams {
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedAgentId?: string; // a user id, or "unassigned"
  sort?: TicketSort;
  page?: number;
  pageSize?: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Build a query string, skipping empty/undefined params, and fetch the page. */
export function listTickets(params: TicketListParams = {}) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") qs.set(key, String(value));
  }
  const query = qs.toString();
  return apiFetch<{ tickets: Ticket[]; pagination: Pagination }>(
    `/api/tickets${query ? `?${query}` : ""}`
  );
}

export function getTicket(id: string) {
  return apiFetch<{ ticket: TicketDetail }>(`/api/tickets/${id}`);
}

export function createTicket(payload: CreateTicketPayload) {
  return apiFetch<{ ticket: Ticket }>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTicket(id: string, payload: UpdateTicketPayload) {
  return apiFetch<{ ticket: Ticket }>(`/api/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteTicket(id: string) {
  return apiFetch<void>(`/api/tickets/${id}`, { method: "DELETE" });
}

export function addComment(ticketId: string, body: string) {
  return apiFetch<{ comment: TicketComment }>(
    `/api/tickets/${ticketId}/comments`,
    { method: "POST", body: JSON.stringify({ body }) }
  );
}
