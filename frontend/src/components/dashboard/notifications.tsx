"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getOverview, type ActivityEntry } from "@/lib/analytics";
import { STATUS_LABELS } from "@/lib/types";

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/**
 * A mock notification bell. It reuses the analytics activity feed as its data
 * source and shows an "unread" dot until the user opens the panel. In a real
 * app this would be a dedicated notifications API (and likely websockets).
 */
export function Notifications() {
  const [items, setItems] = useState<ActivityEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    getOverview()
      .then((data) => setItems(data.recentActivity))
      .catch(() => {});
  }, []);

  const hasUnread = items.length > 0 && !seen;

  function toggle() {
    setOpen((o) => !o);
    setSeen(true);
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            <p className="border-b border-slate-100 px-4 py-2 text-sm font-semibold text-slate-900">
              Notifications
            </p>
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">
                Nothing new.
              </p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {items.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      href={`/dashboard/tickets/${entry.ticketId}`}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2.5 hover:bg-slate-50"
                    >
                      <p className="text-sm text-slate-700">
                        <span className="font-medium text-slate-900">
                          {entry.changedByName}
                        </span>{" "}
                        {entry.fromStatus
                          ? `→ ${STATUS_LABELS[entry.toStatus]}`
                          : "opened a ticket"}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {entry.ticketTitle} · {timeAgo(entry.createdAt)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
