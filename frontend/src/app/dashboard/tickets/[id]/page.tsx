"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { StatusBadge, PriorityBadge } from "@/components/ui/badges";
import { LoadingState, ErrorState } from "@/components/ui/states";
import {
  getTicket,
  updateTicket,
  deleteTicket,
  addComment,
} from "@/lib/tickets";
import { listAgents } from "@/lib/users";
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  type TicketDetail,
  type TicketUser,
  type TicketStatus,
  type TicketPriority,
} from "@/lib/types";
import type { UpdateTicketPayload } from "@/lib/tickets";

const selectClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [agents, setAgents] = useState<TicketUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);

  const isStaff = user?.role === "ADMIN" || user?.role === "SUPPORT_AGENT";
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    getTicket(id)
      .then((res) => setTicket(res.ticket))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load ticket")
      )
      .finally(() => setIsLoading(false));
  }, [id]);

  // Load the staff list only if the viewer can assign.
  useEffect(() => {
    if (isStaff) listAgents().then((res) => setAgents(res.agents)).catch(() => {});
  }, [isStaff]);

  // Generic field updater for the staff controls.
  async function patch(payload: UpdateTicketPayload) {
    try {
      await updateTicket(id, payload);
      // Refetch keeps history/comments accurate after the change.
      const fresh = await getTicket(id);
      setTicket(fresh.ticket);
      toast("Ticket updated");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed", "error");
    }
  }

  async function handleAddComment(event: FormEvent) {
    event.preventDefault();
    if (!commentBody.trim()) return;
    setIsPostingComment(true);
    try {
      const { comment } = await addComment(id, commentBody.trim());
      setTicket((prev) =>
        prev ? { ...prev, comments: [...prev.comments, comment] } : prev
      );
      setCommentBody("");
      toast("Reply posted");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not post comment", "error");
    } finally {
      setIsPostingComment(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this ticket permanently? This cannot be undone.")) return;
    try {
      await deleteTicket(id);
      toast("Ticket deleted");
      router.replace("/dashboard/tickets");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  }

  if (isLoading) return <LoadingState label="Loading ticket…" />;
  if (error && !ticket) return <ErrorState message={error} />;
  if (!ticket) return null;

  return (
    <div>
      <Link
        href="/dashboard/tickets"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to tickets
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column: details + conversation */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              {ticket.category && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {ticket.category}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              {ticket.title}
            </h1>
            <p className="mt-3 whitespace-pre-wrap text-slate-700">
              {ticket.description}
            </p>
            <p className="mt-4 text-xs text-slate-400">
              Opened by {ticket.createdBy.name} on{" "}
              {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Conversation */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Conversation ({ticket.comments.length})
            </h2>

            <div className="mt-4 space-y-4">
              {ticket.comments.length === 0 && (
                <p className="text-sm text-slate-400">No comments yet.</p>
              )}
              {ticket.comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                    {c.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-slate-900">
                        {c.author.name}
                      </span>{" "}
                      <span className="text-xs text-slate-400">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </p>
                    <p className="text-sm text-slate-700">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="mt-5 border-t border-slate-100 pt-4">
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                rows={3}
                placeholder="Write a reply…"
                className={selectClass}
              />
              <button
                type="submit"
                disabled={isPostingComment || !commentBody.trim()}
                className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {isPostingComment ? "Posting…" : "Post reply"}
              </button>
            </form>
          </div>
        </div>

        {/* Side column: properties + staff controls */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Details
            </h2>

            {isStaff ? (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Status
                  </label>
                  <select
                    value={ticket.status}
                    onChange={(e) =>
                      patch({ status: e.target.value as TicketStatus })
                    }
                    className={selectClass}
                  >
                    {TICKET_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Priority
                  </label>
                  <select
                    value={ticket.priority}
                    onChange={(e) =>
                      patch({ priority: e.target.value as TicketPriority })
                    }
                    className={selectClass}
                  >
                    {TICKET_PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_LABELS[p]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Assigned agent
                  </label>
                  <select
                    value={ticket.assignedAgentId ?? ""}
                    onChange={(e) =>
                      patch({ assignedAgentId: e.target.value || null })
                    }
                    className={selectClass}
                  >
                    <option value="">Unassigned</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd>
                    <StatusBadge status={ticket.status} />
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Priority</dt>
                  <dd>
                    <PriorityBadge priority={ticket.priority} />
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Assigned</dt>
                  <dd className="text-slate-700">
                    {ticket.assignedAgent?.name ?? "Unassigned"}
                  </dd>
                </div>
              </dl>
            )}
          </div>

          {/* Activity timeline (status-change audit trail) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Activity
            </h2>
            <ol className="mt-4 space-y-4">
              {ticket.statusHistory.map((entry, index) => (
                <li key={entry.id} className="relative flex gap-3">
                  {/* connector line */}
                  {index < ticket.statusHistory.length - 1 && (
                    <span className="absolute left-[5px] top-4 h-full w-px bg-slate-200" />
                  )}
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-400" />
                  <div className="text-sm">
                    <p className="text-slate-700">
                      {entry.fromStatus ? (
                        <>
                          <span className="font-medium text-slate-900">
                            {entry.changedBy.name}
                          </span>{" "}
                          changed status to{" "}
                          <span className="font-medium">
                            {STATUS_LABELS[entry.toStatus]}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-slate-900">
                            {entry.changedBy.name}
                          </span>{" "}
                          opened the ticket
                        </>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {isAdmin && (
            <button
              onClick={handleDelete}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
