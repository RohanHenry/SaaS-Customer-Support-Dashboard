"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Ticket as TicketIcon, MessageSquare, Search } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { StatusBadge, PriorityBadge } from "@/components/ui/badges";
import { TicketForm } from "@/components/tickets/ticket-form";
import {
  listTickets,
  type Pagination,
  type TicketListParams,
  type TicketSort,
} from "@/lib/tickets";
import { listAgents } from "@/lib/users";
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  type Ticket,
  type TicketUser,
  type TicketStatus,
  type TicketPriority,
} from "@/lib/types";

const controlClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-900";

const PAGE_SIZE = 8;

export default function TicketsPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "ADMIN" || user?.role === "SUPPORT_AGENT";

  // Filter state
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); // debounced value sent to the API
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [assigned, setAssigned] = useState("");
  const [sort, setSort] = useState<TicketSort>("newest");
  const [page, setPage] = useState(1);

  // Data state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [agents, setAgents] = useState<TicketUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce the search box so we don't hit the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load agents once (staff only) for the "Assigned" filter.
  useEffect(() => {
    if (isStaff) listAgents().then((res) => setAgents(res.agents)).catch(() => {});
  }, [isStaff]);

  // The params object the API call depends on.
  const params = useMemo<TicketListParams>(
    () => ({
      search: search || undefined,
      status: status || undefined,
      priority: priority || undefined,
      assignedAgentId: assigned || undefined,
      sort,
      page,
      pageSize: PAGE_SIZE,
    }),
    [search, status, priority, assigned, sort, page]
  );

  // Refetch whenever any filter / page changes.
  useEffect(() => {
    setIsLoading(true);
    listTickets(params)
      .then((res) => {
        setTickets(res.tickets);
        setPagination(res.pagination);
        setError(null);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load tickets")
      )
      .finally(() => setIsLoading(false));
  }, [params]);

  // Changing a filter should reset to page 1.
  function onFilterChange<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function handleCreated() {
    setIsModalOpen(false);
    setPage(1);
    setSort("newest");
    // Refetch by nudging search (params change) — simplest: re-run current query.
    listTickets({ ...params, page: 1 }).then((res) => {
      setTickets(res.tickets);
      setPagination(res.pagination);
    });
  }

  return (
    <div>
      <PageHeader
        title="Tickets"
        subtitle="View and manage all support tickets."
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            New ticket
          </button>
        }
      />

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search title or customer…"
            className={`${controlClass} pl-9`}
          />
        </div>

        <select
          value={status}
          onChange={(e) =>
            onFilterChange(setStatus)(e.target.value as TicketStatus | "")
          }
          className={controlClass}
        >
          <option value="">All statuses</option>
          {TICKET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) =>
            onFilterChange(setPriority)(e.target.value as TicketPriority | "")
          }
          className={controlClass}
        >
          <option value="">All priorities</option>
          {TICKET_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>

        {isStaff && (
          <select
            value={assigned}
            onChange={(e) => onFilterChange(setAssigned)(e.target.value)}
            className={controlClass}
          >
            <option value="">All agents</option>
            <option value="unassigned">Unassigned</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        )}

        <select
          value={sort}
          onChange={(e) => onFilterChange(setSort)(e.target.value as TicketSort)}
          className={`${controlClass} ml-auto`}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="priority">Priority: high → low</option>
        </select>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Customer</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Assigned</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Loading tickets…
                </td>
              </tr>
            )}

            {!isLoading && tickets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <TicketIcon className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                  <p className="font-medium text-slate-900">No tickets match</p>
                  <p className="text-sm text-slate-500">
                    Try adjusting your search or filters.
                  </p>
                </td>
              </tr>
            )}

            {!isLoading &&
              tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {ticket.title}
                    </Link>
                    {ticket._count && ticket._count.comments > 0 && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-slate-400">
                        <MessageSquare className="h-3 w-3" />
                        {ticket._count.comments}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                    {ticket.createdBy.name}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">
                    {ticket.assignedAgent?.name ?? (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-slate-500">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total}{" "}
            ticket{pagination.total === 1 ? "" : "s"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <Modal title="New ticket" onClose={() => setIsModalOpen(false)}>
          <TicketForm onCreated={handleCreated} />
        </Modal>
      )}
    </div>
  );
}
