import { useEffect, useState } from "react";
import type { HoraExtraStatus, PeriodUnit, RangeState, Segment } from "../types";
import { ALL_DEPARTAMENTOS } from "../data";
import { formatDateLabelPt } from "../format";
import { Chip } from "./ui";
import { cn } from "../utils/cn";
import { Filter, Calendar } from "lucide-react";

interface Props {
  periodUnit: PeriodUnit;
  periodAmount: number;
  range: RangeState;
  onUnitChange: (unit: PeriodUnit) => void;
  onAmountChange: (amount: number) => void;
  segmento: Segment | "Todos";
  onSegmento: (s: Segment | "Todos") => void;
  status: HoraExtraStatus | "Todos";
  onStatus: (s: HoraExtraStatus | "Todos") => void;
}

const QUICK_DAYS = [7, 15, 30, 60, 90];
const QUICK_MONTHS = [1, 3, 6, 12];

export function FilterBar({
  periodUnit,
  periodAmount,
  range,
  onUnitChange,
  onAmountChange,
  segmento,
  onSegmento,
  status,
  onStatus,
}: Props) {
  const [draft, setDraft] = useState(String(periodAmount));
  const segments: (Segment | "Todos")[] = ["Todos", ...ALL_DEPARTAMENTOS];
  const statuses: (HoraExtraStatus | "Todos")[] = ["Todos", "Aprovado", "Pendente", "Recusado"];
  const quick = periodUnit === "days" ? QUICK_DAYS : QUICK_MONTHS;
  const max = periodUnit === "days" ? 365 : 12;

  useEffect(() => setDraft(String(periodAmount)), [periodAmount]);

  function commit(raw: string) {
    const parsed = Number(raw.replace(/\D/g, ""));
    const next = Math.min(Math.max(parsed || 1, 1), max);
    onAmountChange(next);
    setDraft(String(next));
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          <Filter className="h-4 w-4 text-indigo-500" />
          Filtros do painel
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Período
          </span>
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {(["days", "months"] as PeriodUnit[]).map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => onUnitChange(unit)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  periodUnit === unit
                    ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                {unit === "days" ? "Dias" : "Meses"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Diminuir período"
              onClick={() => onAmountChange(Math.max(1, periodAmount - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              −
            </button>
            <div className="flex h-9 items-center rounded-lg border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800">
              <input
                type="text"
                inputMode="numeric"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => commit(draft)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                className="w-12 bg-transparent pl-2 pr-1 text-right text-sm font-bold tabular-nums text-slate-800 outline-none dark:text-white"
                aria-label={`Quantidade de ${periodUnit === "days" ? "dias" : "meses"}`}
              />
              <span className="pr-2 text-xs font-medium text-slate-400">
                {periodUnit === "days" ? "d" : "m"}
              </span>
            </div>
            <button
              type="button"
              aria-label="Aumentar período"
              onClick={() => onAmountChange(Math.min(max, periodAmount + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              +
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {quick.map((amount) => (
              <Chip key={amount} active={periodAmount === amount} onClick={() => onAmountChange(amount)}>
                {amount} {periodUnit === "days" ? (amount === 1 ? "dia" : "dias") : (amount === 1 ? "mês" : "meses")}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-xs text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/5 dark:text-indigo-300">
        <Calendar className="h-4 w-4" />
        <span className="font-semibold">Intervalo aplicado:</span>
        <span>{formatDateLabelPt(range.start)} a {formatDateLabelPt(range.end)}</span>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {segments.map((s) => (
            <Chip key={s} active={segmento === s} onClick={() => onSegmento(s)}>
              {s}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto border-slate-100 pb-1 lg:border-l lg:pl-6 lg:pb-0 dark:border-slate-800">
          {statuses.map((s) => (
            <Chip key={s} active={status === s} onClick={() => onStatus(s)}>
              {s}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}