"use client";

import { useEffect, useState } from "react";
import { Headset } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { ROLE_LABELS } from "@/lib/types";
import { listAgentWorkload, type AgentWorkload } from "@/lib/users";

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentWorkload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAgentWorkload()
      .then((res) => setAgents(res.agents))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load agents")
      )
      .finally(() => setIsLoading(false));
  }, []);

  // Scale the workload bars against the busiest agent.
  const maxActive = Math.max(1, ...agents.map((a) => a.assignedActive));

  return (
    <div>
      <PageHeader
        title="Agents"
        subtitle="Your support team and their current workload."
      />

      {isLoading && <LoadingState label="Loading agents…" />}
      {error && <ErrorState message={error} />}

      {!isLoading && !error && agents.length === 0 && (
        <EmptyState icon={Headset} title="No agents yet" />
      )}

      {!isLoading && !error && agents.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => {
            const initials = agent.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("");
            return (
              <div
                key={agent.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {initials}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">{agent.name}</p>
                    <p className="text-xs text-slate-500">
                      {ROLE_LABELS[agent.role]}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between text-sm">
                  <span className="text-slate-500">Active tickets</span>
                  <span className="font-semibold text-slate-900">
                    {agent.assignedActive}
                    <span className="font-normal text-slate-400">
                      {" "}
                      / {agent.assignedTotal} total
                    </span>
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{
                      width: `${(agent.assignedActive / maxActive) * 100}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
