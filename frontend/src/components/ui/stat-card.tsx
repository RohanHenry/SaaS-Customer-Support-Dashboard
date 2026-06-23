import type { LucideIcon } from "lucide-react";

type Tone = "default" | "blue" | "amber" | "green" | "red";

const TONES: Record<Tone, { bg: string; text: string }> = {
  default: { bg: "bg-slate-100", text: "text-slate-600" },
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  amber: { bg: "bg-amber-100", text: "text-amber-600" },
  green: { bg: "bg-emerald-100", text: "text-emerald-600" },
  red: { bg: "bg-red-100", text: "text-red-600" },
};

/**
 * A single metric tile (label + big number + icon).
 * In Phase 4 we pass placeholder numbers; Phase 7 wires these to real analytics.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
}) {
  const colors = TONES[tone];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`rounded-lg p-2 ${colors.bg}`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
