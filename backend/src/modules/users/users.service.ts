import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

const ticketCardSelect = {
  id: true,
  title: true,
  status: true,
  priority: true,
  createdAt: true,
} as const;

/** Staff who can be assigned to tickets (for the assign dropdown). */
export async function listAgents() {
  return prisma.user.findMany({
    where: { role: { in: ["SUPPORT_AGENT", "ADMIN"] } },
    orderBy: { name: "asc" },
    select: userSelect,
  });
}

/** Customers list, each with how many tickets they've opened. */
export async function listCustomers() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { name: "asc" },
    select: {
      ...userSelect,
      _count: { select: { createdTickets: true } },
    },
  });

  return customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    role: c.role,
    ticketCount: c._count.createdTickets,
  }));
}

/**
 * Agent workload: each agent/admin with how many tickets are assigned to them
 * and how many are still active (Open or In Progress).
 *
 * We use two groupBy queries (total + active) and merge them, instead of an
 * N+1 loop of per-agent counts.
 */
export async function listAgentWorkload() {
  const [agents, totals, actives] = await Promise.all([
    listAgents(),
    prisma.ticket.groupBy({
      by: ["assignedAgentId"],
      where: { assignedAgentId: { not: null } },
      _count: { _all: true },
    }),
    prisma.ticket.groupBy({
      by: ["assignedAgentId"],
      where: {
        assignedAgentId: { not: null },
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
      _count: { _all: true },
    }),
  ]);

  const totalMap = new Map(totals.map((t) => [t.assignedAgentId, t._count._all]));
  const activeMap = new Map(actives.map((a) => [a.assignedAgentId, a._count._all]));

  return agents.map((agent) => ({
    ...agent,
    assignedTotal: totalMap.get(agent.id) ?? 0,
    assignedActive: activeMap.get(agent.id) ?? 0,
  }));
}

/** A single customer's profile: their info, ticket stats, and their tickets. */
export async function getCustomerProfile(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
  if (!user || user.role !== "CUSTOMER") {
    throw new AppError("Customer not found", 404);
  }

  const [tickets, statusGroups] = await Promise.all([
    prisma.ticket.findMany({
      where: { createdById: id },
      orderBy: { createdAt: "desc" },
      select: ticketCardSelect,
    }),
    prisma.ticket.groupBy({
      by: ["status"],
      where: { createdById: id },
      _count: { _all: true },
    }),
  ]);

  const byStatus = Object.fromEntries(
    statusGroups.map((g) => [g.status, g._count._all])
  );

  return {
    user,
    tickets,
    stats: {
      total: tickets.length,
      open: byStatus.OPEN ?? 0,
      resolved: byStatus.RESOLVED ?? 0,
    },
  };
}
