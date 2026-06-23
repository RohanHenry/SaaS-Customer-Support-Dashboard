import type { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
  CreateTicketInput,
  ListTicketsQuery,
  UpdateTicketInput,
} from "./tickets.schemas.js";

/** The minimal user fields we expose on nested ticket data (never the hash). */
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

/** Identifies the caller so the service can apply role-based rules. */
interface Actor {
  id: string;
  role: UserRole;
}

const isStaff = (role: UserRole) =>
  role === "ADMIN" || role === "SUPPORT_AGENT";

/** Translate the "sort" param into a Prisma orderBy clause. */
function buildOrderBy(
  sort: ListTicketsQuery["sort"]
): Prisma.TicketOrderByWithRelationInput[] {
  switch (sort) {
    case "oldest":
      return [{ createdAt: "asc" }];
    case "priority":
      // Enum values are stored in declaration order (LOW…URGENT), so "desc"
      // surfaces URGENT first. Newest-first breaks ties.
      return [{ priority: "desc" }, { createdAt: "desc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
}

/**
 * List tickets with server-side search, filtering, sorting and pagination,
 * scoped to the caller's role (customers only ever see their own tickets).
 * Returns the page of rows plus pagination metadata.
 */
export async function listTickets(actor: Actor, query: ListTicketsQuery) {
  const where: Prisma.TicketWhereInput = {};

  // Role scope: customers are locked to their own tickets.
  if (!isStaff(actor.role)) {
    where.createdById = actor.id;
  }

  // Search across ticket title OR the customer's name.
  if (query.search) {
    where.OR = [
      { title: { contains: query.search } },
      { createdBy: { name: { contains: query.search } } },
    ];
  }

  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;

  // Assigned filter: a specific agent, or the literal "unassigned".
  if (query.assignedAgentId === "unassigned") {
    where.assignedAgentId = null;
  } else if (query.assignedAgentId) {
    where.assignedAgentId = query.assignedAgentId;
  }

  const skip = (query.page - 1) * query.pageSize;

  // Run the page query and the total count together.
  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy: buildOrderBy(query.sort),
      skip,
      take: query.pageSize,
      include: {
        createdBy: { select: userSelect },
        assignedAgent: { select: userSelect },
        _count: { select: { comments: true } },
      },
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    tickets,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  };
}

/** Fetch one ticket with its full conversation + history, enforcing access. */
export async function getTicketById(id: string, actor: Actor) {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      createdBy: { select: userSelect },
      assignedAgent: { select: userSelect },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: userSelect } },
      },
      statusHistory: {
        orderBy: { createdAt: "asc" },
        include: { changedBy: { select: userSelect } },
      },
    },
  });

  if (!ticket) throw new AppError("Ticket not found", 404);

  // Customers may only open their own tickets.
  if (!isStaff(actor.role) && ticket.createdById !== actor.id) {
    throw new AppError("You do not have access to this ticket", 403);
  }

  return ticket;
}

/** Create a ticket. The caller becomes the ticket's creator. */
export async function createTicket(input: CreateTicketInput, actor: Actor) {
  return prisma.ticket.create({
    data: {
      title: input.title,
      description: input.description,
      priority: input.priority,
      category: input.category ?? null,
      createdById: actor.id,
      // Record the opening event in the audit trail.
      statusHistory: {
        create: { toStatus: "OPEN", changedById: actor.id },
      },
    },
    include: {
      createdBy: { select: userSelect },
      assignedAgent: { select: userSelect },
    },
  });
}

/**
 * Update a ticket (staff only — enforced at the route).
 * If the status changes, we append a row to the status-history audit trail,
 * doing both writes in one transaction so they can't get out of sync.
 */
export async function updateTicket(
  id: string,
  input: UpdateTicketInput,
  actor: Actor
) {
  const existing = await prisma.ticket.findUnique({ where: { id } });
  if (!existing) throw new AppError("Ticket not found", 404);

  // If assigning, make sure the target is a real staff member.
  if (input.assignedAgentId) {
    const agent = await prisma.user.findUnique({
      where: { id: input.assignedAgentId },
    });
    if (!agent || !isStaff(agent.role)) {
      throw new AppError("Assigned agent must be a valid staff member", 400);
    }
  }

  const statusChanged =
    input.status !== undefined && input.status !== existing.status;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.ticket.update({
      where: { id },
      data: {
        status: input.status,
        priority: input.priority,
        category: input.category,
        assignedAgentId: input.assignedAgentId,
      },
      include: {
        createdBy: { select: userSelect },
        assignedAgent: { select: userSelect },
      },
    });

    if (statusChanged) {
      await tx.ticketStatusHistory.create({
        data: {
          fromStatus: existing.status,
          toStatus: input.status!,
          changedById: actor.id,
          ticketId: id,
        },
      });
    }

    return updated;
  });
}

/** Delete a ticket (admin only — enforced at the route). */
export async function deleteTicket(id: string) {
  const existing = await prisma.ticket.findUnique({ where: { id } });
  if (!existing) throw new AppError("Ticket not found", 404);

  // Comments / history / attachments cascade-delete via the schema.
  await prisma.ticket.delete({ where: { id } });
}

/** Add a comment to a ticket, enforcing the same access rules as viewing it. */
export async function addComment(
  ticketId: string,
  body: string,
  actor: Actor
) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new AppError("Ticket not found", 404);

  if (!isStaff(actor.role) && ticket.createdById !== actor.id) {
    throw new AppError("You do not have access to this ticket", 403);
  }

  return prisma.ticketComment.create({
    data: { body, ticketId, authorId: actor.id },
    include: { author: { select: userSelect } },
  });
}
