import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export interface KpiValue {
  id: string;
  title: string;
  value: string;
  delta: number; // percent vs previous comparable period
  icon: ReactNode;
  spark: number[];
}

function Sparkline({ data }: { data: number[] }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const first = data[0];
  const last = data[data.length - 1];
  const positive = last >= first;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 24 - ((v - min) / span) * 20;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 26" className="h-6 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke={positive ? "#10b981" : "#f43f5e"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "all .3s" }}
      />
    </svg>
  );
}

export function TrendChip({ delta }: { delta: number }) {
  const isNeutral = Math.abs(delta) < 0.05;
  const up = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
        isNeutral
          ? "bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-300"
          : up
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
          : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400"
      )}
    >
      <svg
        viewBox="0 0 16 16"
        className={cn("h-3 w-3", up && !isNeutral && "rotate-0", !up && !isNeutral && "rotate-180")}
        fill="currentColor"
      >
        <path d="M8 3l5 6H3l5-6z" />
      </svg>
      {up && !isNeutral ? "+" : ""}
      {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

export function KpiCard({ kpi }: { kpi: KpiValue }) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
          {kpi.icon}
        </div>
        <TrendChip delta={kpi.delta} />
      </div>
      <div className="mt-4 truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[27px]">
        {kpi.value}
      </div>
      <div className="mt-1 truncate text-sm font-medium text-slate-500 dark:text-slate-400">
        {kpi.title}
      </div>
      <div className="mt-3 border-t border-slate-100 pt-2.5 dark:border-slate-800">
        <Sparkline data={kpi.spark} />
      </div>
    </div>
  );
}
