"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headset } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { navItemsForRole } from "@/lib/nav";
import { ROLE_LABELS } from "@/lib/types";

/**
 * The left navigation rail. Used on desktop (always visible) and inside the
 * mobile drawer. `onNavigate` lets the mobile drawer close itself after a click.
 */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;
  const items = navItemsForRole(user.role);

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 px-6">
        <Headset className="h-6 w-6 text-white" />
        <span className="text-lg font-semibold text-white">SupportFlow</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          // Exact match for /dashboard, prefix match for nested routes.
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-800 px-4 py-4">
        <p className="truncate text-sm font-medium text-white">{user.name}</p>
        <p className="truncate text-xs text-slate-400">
          {ROLE_LABELS[user.role]}
        </p>
      </div>
    </div>
  );
}
