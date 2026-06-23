export interface BarDatum {
  label: string;
  value: number;
  colorClass: string; // e.g. "bg-blue-500"
}

/**
 * A lightweight horizontal bar chart — no charting library needed.
 * Each bar's width is its value as a percentage of the largest value, so the
 * chart always fills the space and stays readable.
 */
export function BarChartCard({
  title,
  data,
}: {
  title: string;
  data: BarDatum[];
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h2>
      <div className="mt-4 space-y-3">
        {data.map((d) => (
          <div key={d.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-slate-600">{d.label}</span>
              <span className="font-medium text-slate-900">{d.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${d.colorClass} transition-all`}
                style={{ width: `${(d.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
