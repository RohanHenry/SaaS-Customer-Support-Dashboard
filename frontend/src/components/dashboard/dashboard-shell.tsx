"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

/**
 * The app frame: a fixed sidebar on desktop, a slide-in drawer on mobile, and
 * a top bar above the scrollable content area. Every dashboard page renders
 * inside `children`.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar — fixed, visible from the `lg` breakpoint up */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden">
          {/* Dim backdrop */}
          <div
            className="fixed inset-0 z-30 bg-slate-900/50"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sliding panel */}
          <aside className="fixed inset-y-0 left-0 z-40 w-64">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Content column — pushed right on desktop to clear the sidebar */}
      <div className="lg:pl-64">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
