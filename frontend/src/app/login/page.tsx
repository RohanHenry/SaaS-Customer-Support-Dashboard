"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { loginFormSchema, type LoginFormValues } from "@/lib/validation";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-900";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@supportflow.test" },
  { label: "Agent", email: "agent@supportflow.test" },
  { label: "Customer", email: "customer@supportflow.test" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values.email, values.password);
      toast("Welcome back!");
      router.replace("/dashboard");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Login failed", "error");
    }
  }

  function fillDemo(email: string) {
    setValue("email", email);
    setValue("password", "password123");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to SupportFlow</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input id="email" type="email" {...register("email")} className={inputClass} placeholder="you@example.com" />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input id="password" type="password" {...register("password")} className={inputClass} placeholder="••••••••" />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-900 py-2 font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6">
          <p className="mb-2 text-center text-xs uppercase tracking-wide text-slate-400">
            Quick demo login
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc.email)}
                className="rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
              >
                {acc.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-slate-400">
            Click a role, then Sign in. Password:{" "}
            <code className="rounded bg-slate-100 px-1 text-slate-600">
              password123
            </code>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          No account?{" "}
          <Link href="/register" className="font-medium text-slate-900 underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
