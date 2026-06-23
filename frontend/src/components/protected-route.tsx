"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/lib/types";

/**
 * Client-side route guard.
 * - While we're still checking the session, show a loading state.
 * - If the user is NOT logged in, redirect to /login.
 * - If `allowedRoles` is given and the user's role isn't in it, block with 403 UI.
 *
 * Note: this is convenience/UX protection. The REAL security is on the backend,
 * where every protected endpoint checks the JWT. Never trust the client alone.
 */
export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Access denied</h1>
        <p className="text-slate-500">
          Your role ({user.role}) can&apos;t view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
