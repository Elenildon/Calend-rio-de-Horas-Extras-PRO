import { useTheme } from "../theme";

const base =
  "rounded-xl border px-3 py-2.5 text-xs shadow-xl backdrop-blur dark:shadow-black/40";

export function shellTooltip(theme: string): string {
  return theme === "dark" ? `${base} border-slate-600 bg-slate-800/95 text-slate-100` : `${base} border-slate-100 bg-white/95 text-slate-800`;
}

export function useChartTheme() {
  const { theme } = useTheme();
  return {
    theme,
    grid: theme === "dark" ? "#334155" : "#e5e7eb",
    axis: theme === "dark" ? "#94a3b8" : "#6b7280",
    tooltipShell: shellTooltip(theme),
    cursor: theme === "dark" ? "rgba(148,163,184,0.12)" : "rgba(100,116,139,0.12)",
  };
}
