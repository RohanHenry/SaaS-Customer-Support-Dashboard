"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ticket, Inbox, CheckCircle2, AlertTriangle, Activity } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { BarChartCard } from "@/components/ui/bar-chart";
import { getOverview, type AnalyticsOverview } from "@/lib/analytics";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_BAR_COLORS,
  PRIORITY_BAR_COLORS,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
} from "@/lib/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] ?? "there";

  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOverview()
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load analytics")
      )
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading)
    return (
      <div>
        <PageHeader title={`Welcome back, ${firstName}`} />
        <p className="text-sm text-slate-500">Loading dashboard…</p>
      </div>
    );

  if (error || !data)
    return (
      <div>
        <PageHeader title={`Welcome back, ${firstName}`} />
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error ?? "No data"}
        </p>
      </div>
    );

  const { stats, byStatus, byPriority, recentActivity } = data;

  const statusData = TICKET_STATUSES.map((s) => ({
    label: STATUS_LABELS[s],
    value: byStatus[s],
    colorClass: STATUS_BAR_COLORS[s],
  }));
  const priorityData = TICKET_PRIORITIES.map((p) => ({
    label: PRIORITY_LABELS[p],
    value: byPriority[p],
    colorClass: PRIORITY_BAR_COLORS[p],
  }));

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here's what's happening across your support desk."
      />

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total tickets" value={stats.total} icon={Ticket} tone="blue" />
        <StatCard label="Open" value={stats.open} icon={Inbox} tone="amber" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} tone="green" />
        <StatCard label="Urgent" value={stats.urgent} icon={AlertTriangle} tone="red" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BarChartCard title="Tickets by status" data={statusData} />
        <BarChartCard title="Tickets by priority" data={priorityData} />
      </div>

      {/* Recent activity */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          <Activity className="h-4 w-4" /> Recent activity
        </h2>

        {recentActivity.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No recent activity.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {recentActivity.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between py-3">
                <p className="text-sm text-slate-700">
                  <span className="font-medium text-slate-900">
                    {entry.changedByName}
                  </span>{" "}
                  {entry.fromStatus ? "moved" : "opened"}{" "}
                  <Link
                    href={`/dashboard/tickets/${entry.ticketId}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {entry.ticketTitle}
                  </Link>{" "}
                  {entry.fromStatus
                    ? `to ${STATUS_LABELS[entry.toStatus]}`
                    : ""}
                </p>
                <span className="shrink-0 text-xs text-slate-400">
                  {timeAgo(entry.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
