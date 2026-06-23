import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

/**
 * Layout for every /dashboard/* route. Because it's a Next.js layout, the
 * sidebar + topbar stay mounted while only the page content swaps on navigation
 * (fast, no flicker). ProtectedRoute ensures only logged-in users get here.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
