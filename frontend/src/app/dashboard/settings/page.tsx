"use client";

import { useAuth } from "@/context/auth-context";
import { PageHeader } from "@/components/ui/page-header";
import { ROLE_LABELS } from "@/lib/types";

export default function SettingsPage() {
  const { user } = useAuth();
  if (!user) return null;

  const fields = [
    { label: "Full name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Role", value: ROLE_LABELS[user.role] },
    {
      label: "Member since",
      value: new Date(user.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <PageHeader title="Settings" subtitle="Your account details." />

      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Profile
        </h2>
        <dl className="mt-4 divide-y divide-slate-100">
          {fields.map((field) => (
            <div
              key={field.label}
              className="flex items-center justify-between py-3"
            >
              <dt className="text-sm text-slate-500">{field.label}</dt>
              <dd className="text-sm font-medium text-slate-900">
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
