import { apiFetch } from "./api";
import type { TicketPriority, TicketStatus, TicketUser } from "./types";

/** Staff who can be assigned to tickets (for the assign dropdown). */
export function listAgents() {
  return apiFetch<{ agents: TicketUser[] }>("/api/users/agents");
}

export interface CustomerListItem {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER";
  ticketCount: number;
}

export function listCustomers() {
  return apiFetch<{ customers: CustomerListItem[] }>("/api/users/customers");
}

export interface AgentWorkload extends TicketUser {
  assignedTotal: number;
  assignedActive: number;
}

export function listAgentWorkload() {
  return apiFetch<{ agents: AgentWorkload[] }>("/api/users/agents/workload");
}

export interface CustomerProfile {
  user: TicketUser;
  tickets: {
    id: string;
    title: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdAt: string;
  }[];
  stats: { total: number; open: number; resolved: number };
}

export function getCustomerProfile(id: string) {
  return apiFetch<CustomerProfile>(`/api/users/${id}`);
}
