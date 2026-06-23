import { apiFetch } from "./api";
import type { TicketPriority, TicketStatus } from "./types";

export interface AnalyticsStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  urgent: number;
}

export interface ActivityEntry {
  id: string;
  ticketId: string;
  ticketTitle: string;
  fromStatus: TicketStatus | null;
  toStatus: TicketStatus;
  changedByName: string;
  createdAt: string;
}

export interface AnalyticsOverview {
  stats: AnalyticsStats;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
  recentActivity: ActivityEntry[];
}

export function getOverview() {
  return apiFetch<AnalyticsOverview>("/api/analytics/overview");
}
