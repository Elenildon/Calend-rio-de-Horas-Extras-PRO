import { Card } from "./ui";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const PERCENTUAIS = [100, 60, 60, 60, 60, 60, 75]; // % extra aplicado por dia da semana

interface Props {
  data: { dow: number; horas: number; custo: number }[];
}

export function WeekdayBarChart({ data }: Props) {
  const max = Math.max(...data.map((d) => d.horas), 1);

  return (
    <Card className="p-5">
      <div className="mb-1">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Horas por dia da semana
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Volume de horas extras com adicional aplicado
        </p>
      </div>

      <div className="mt-4 space-y-2">
        {data
          .slice()
          .sort((a, b) => a.dow - b.dow)
          .map((d) => {
            const pct = (d.horas / max) * 100;
            const extra = PERCENTUAIS[d.dow];
            const barColor =
              extra === 100
                ? "bg-rose-500 dark:bg-rose-500"
                : extra === 75
                ? "bg-amber-500"
                : "bg-indigo-500";
            return (
              <div key={d.dow} className="flex items-center gap-3">
                <span className="w-8 shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {DAY_LABELS[d.dow]}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-700`}
                        style={{ width: `${Math.max(2, pct)}%` }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right text-xs tabular-nums text-slate-600 dark:text-slate-300">
                      {d.horas.toFixed(1)}h
                    </span>
                  </div>
                </div>
                <span
                  className={
                    "w-12 shrink-0 rounded border px-1.5 py-0.5 text-center text-[10px] font-bold " +
                    (extra === 100
                      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                      : extra === 75
                      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                      : "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300")
                  }
                >
                  +{extra}%
                </span>
              </div>
            );
          })}
      </div>
    </Card>
  );
}
