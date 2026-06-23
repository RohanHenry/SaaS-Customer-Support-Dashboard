"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

/**
 * Entry point. Once the session check finishes, send the visitor to the right
 * place: the dashboard if logged in, otherwise the login page.
 */
export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [user, isLoading, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
      <h1 className="text-3xl font-bold text-slate-900">SupportFlow</h1>
      <p className="text-slate-500">Loading…</p>
    </main>
  );
}
