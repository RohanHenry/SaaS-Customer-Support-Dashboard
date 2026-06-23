import type { Prisma, UserRole, TicketStatus, TicketPriority } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

interface Actor {
  id: string;
  role: UserRole;
}

const isStaff = (role: UserRole) =>
  role === "ADMIN" || role === "SUPPORT_AGENT";

const ALL_STATUSES: TicketStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];
const ALL_PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

/** Turn Prisma groupBy rows into a complete map that includes zero counts. */
function toCountMap<T extends string>(
  keys: T[],
  rows: { key: T; count: number }[]
): Record<T, number> {
  const map = Object.fromEntries(keys.map((k) => [k, 0])) as Record<T, number>;
  for (const row of rows) map[row.key] = row.count;
  return map;
}

/**
 * Build the analytics overview, scoped to the caller's role:
 *  - Customers see stats for their own tickets only.
 *  - Staff see the whole desk.
 *
 * Uses Prisma groupBy so the database aggregates the counts — we never pull all
 * tickets into Node just to count them.
 */
export async function getOverview(actor: Actor) {
  const where: Prisma.TicketWhereInput = isStaff(actor.role)
    ? {}
    : { createdById: actor.id };

  const [statusGroups, priorityGroups, recentActivity] = await Promise.all([
    prisma.ticket.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    }),
    prisma.ticket.groupBy({
      by: ["priority"],
      where,
      _count: { _all: true },
    }),
    prisma.ticketStatusHistory.findMany({
      where: isStaff(actor.role)
        ? {}
        : { ticket: { createdById: actor.id } },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        ticket: { select: { id: true, title: true } },
        changedBy: { select: { name: true } },
      },
    }),
  ]);

  const byStatus = toCountMap(
    ALL_STATUSES,
    statusGroups.map((g) => ({ key: g.status, count: g._count._all }))
  );
  const byPriority = toCountMap(
    ALL_PRIORITIES,
    priorityGroups.map((g) => ({ key: g.priority, count: g._count._all }))
  );

  const total = ALL_STATUSES.reduce((sum, s) => sum + byStatus[s], 0);

  return {
    stats: {
      total,
      open: byStatus.OPEN,
      inProgress: byStatus.IN_PROGRESS,
      resolved: byStatus.RESOLVED,
      closed: byStatus.CLOSED,
      urgent: byPriority.URGENT,
    },
    byStatus,
    byPriority,
    recentActivity: recentActivity.map((entry) => ({
      id: entry.id,
      ticketId: entry.ticket.id,
      ticketTitle: entry.ticket.title,
      fromStatus: entry.fromStatus,
      toStatus: entry.toStatus,
      changedByName: entry.changedBy.name,
      createdAt: entry.createdAt,
    })),
  };
}
