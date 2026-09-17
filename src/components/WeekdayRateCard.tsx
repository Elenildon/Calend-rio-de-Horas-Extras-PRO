import { Card } from "./ui";
import { NOTURNO_FIM, NOTURNO_INICIO } from "../types";

const DAYS = [
  {
    label: "Segunda a Sexta",
    short: "Seg–Sex",
    percentual: 60,
    color:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  {
    label: "Sábado",
    short: "Sáb",
    percentual: 75,
    color:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
    dot: "bg-amber-500",
  },
  {
    label: "Domingo",
    short: "Dom",
    percentual: 100,
    color:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
    dot: "bg-rose-500",
  },
] as const;

interface Props {
  weekendHours: number;
  weekendCost: number;
  weekendCount: number;
  noturnoEnabled: boolean;
  adicionalNoturno: number;
  nightHours: number;
  nightCost: number;
  nightCount: number;
}

export function WeekdayRateCard({
  weekendHours,
  weekendCost,
  weekendCount,
  noturnoEnabled,
  adicionalNoturno,
  nightHours,
  nightCost,
  nightCount,
}: Props) {
  return (
    <Card className="p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Regras de percentual
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Adicionais por dia da semana e período
        </p>
      </div>

      <div className="space-y-3">
        {DAYS.map((d) => (
          <div
            key={d.short}
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 dark:border-slate-700/50 dark:bg-slate-800/40"
          >
            <div className="flex items-center gap-2.5">
              <span className={`inline-block h-2.5 w-2.5 rounded-full shrink-0 ${d.dot}`} />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {d.label}
              </span>
            </div>
            <span
              className={`rounded-lg border px-2.5 py-0.5 text-sm font-bold tabular-nums ${d.color}`}
            >
              +{d.percentual}%
            </span>
          </div>
        ))}

        {/* Adicional noturno */}
        <div
          className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${
            noturnoEnabled
              ? "border-sky-100 bg-sky-50/60 dark:border-sky-500/20 dark:bg-sky-500/5"
              : "border-slate-100 bg-slate-50/60 dark:border-slate-700/50 dark:bg-slate-800/40"
          }`}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${
                noturnoEnabled ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"
              }`}
            />
            <span className="min-w-0 text-sm font-medium text-slate-700 dark:text-slate-200">
              Noturno{" "}
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                ({NOTURNO_INICIO}h–{NOTURNO_FIM}h)
              </span>
            </span>
          </div>
          <span
            className={`rounded-lg border px-2.5 py-0.5 text-sm font-bold tabular-nums ${
              noturnoEnabled
                ? "border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-400/40 dark:bg-sky-500/15 dark:text-sky-300"
                : "border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
            }`}
          >
            +{noturnoEnabled ? adicionalNoturno : 0}%
          </span>
        </div>
      </div>

      {/* Resumo do noturno */}
      {noturnoEnabled && nightCount > 0 && (
        <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/60 p-3 dark:border-sky-500/20 dark:bg-sky-500/5">
          <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
            Adicional noturno no período
          </p>
          <div className="mt-1.5 flex items-center justify-between text-xs text-sky-600 dark:text-sky-300">
            <span>{nightCount} lançamentos</span>
            <span className="font-bold tabular-nums">{nightHours.toFixed(1)}h</span>
            <span className="font-bold tabular-nums">
              R$ {nightCost.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      )}

      {/* Resumo do fim de semana */}
      {weekendCount > 0 && (
        <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 dark:border-indigo-500/20 dark:bg-indigo-500/5">
          <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
            Fim de semana no período
          </p>
          <div className="mt-1.5 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-300">
            <span>{weekendCount} lançamentos</span>
            <span className="font-bold tabular-nums">{weekendHours.toFixed(1)}h</span>
            <span className="font-bold tabular-nums">
              R$ {weekendCost.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
