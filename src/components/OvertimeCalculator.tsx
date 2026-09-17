import { useEffect, useState } from "react";
import {
  calcManualDSR,
  horaBaseFromSalario,
  valorHoraExtra,
  valorHoraExtraNoturna,
} from "../salary";
import { formatBRLValue } from "../formatValue";
import { Card } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  salarioBruto: number;
  jornadaMensal: number;
  dsrEnabled: boolean;
  noturnoEnabled: boolean;
  adicionalNoturno: number;
  userName?: string;
}

interface TimeValue {
  hours: string;
  minutes: string;
}

interface Calculation {
  rows: { rate: number; time: TimeValue; night: boolean; decimalHours: number; cost: number }[];
  hours: number;
  nightHours: number;
  extraCost: number;
  dsr: number;
  total: number;
}

const RATES = [60, 75, 100] as const;

const rateStyles: Record<number, { border: string; bg: string; text: string; bar: string }> = {
  60: {
    border: "border-indigo-200 dark:border-indigo-500/25",
    bg: "bg-indigo-50/60 dark:bg-indigo-500/10",
    text: "text-indigo-700 dark:text-indigo-300",
    bar: "bg-indigo-500",
  },
  75: {
    border: "border-amber-200 dark:border-amber-500/25",
    bg: "bg-amber-50/60 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    bar: "bg-amber-500",
  },
  100: {
    border: "border-rose-200 dark:border-rose-500/25",
    bg: "bg-rose-50/60 dark:bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
    bar: "bg-rose-500",
  },
};

interface CalcState {
  hours: string;
  minutes: string;
  night: boolean;
}

export function OvertimeCalculator({
  salarioBruto,
  jornadaMensal,
  dsrEnabled,
  noturnoEnabled,
  adicionalNoturno,
  userName,
}: Props) {
  const ownerLabel = userName?.trim() ? ` · ${userName.trim()}` : "";
  // Campos iniciam em branco (sem o número 0)
  const [values, setValues] = useState<Record<number, CalcState>>({
    60: { hours: "", minutes: "", night: false },
    75: { hours: "", minutes: "", night: false },
    100: { hours: "", minutes: "", night: false },
  });
  const [calculation, setCalculation] = useState<Calculation | null>(null);

  const horaBase = horaBaseFromSalario(salarioBruto, jornadaMensal);

  // Recalcula ou limpa cálculo se salário/jornada/DSR/noturno mudar
  useEffect(
    () => setCalculation(null),
    [salarioBruto, jornadaMensal, dsrEnabled, noturnoEnabled, adicionalNoturno]
  );

  function updateTime(rate: number, field: "hours" | "minutes", raw: string) {
    const clean = raw === "" ? "" : String(Math.min(Math.max(Number(raw.replace(/\D/g, "")) || 0, 0), field === "minutes" ? 100 : 999));
    setValues((current) => ({
      ...current,
      [rate]: { ...current[rate], [field]: clean },
    }));
  }

  function toggleNight(rate: number) {
    setValues((current) => ({
      ...current,
      [rate]: { ...current[rate], night: !current[rate].night },
    }));
  }

  function handleClear() {
    setValues({
      60: { hours: "", minutes: "", night: false },
      75: { hours: "", minutes: "", night: false },
      100: { hours: "", minutes: "", night: false },
    });
    setCalculation(null);
  }

  function calculate() {
    const rows = RATES.map((rate) => {
      const state = values[rate];
      const time: TimeValue = { hours: state.hours, minutes: state.minutes };
      const h = Number(state.hours) || 0;
      const m = Number(state.minutes) || 0;
      const decimalHours = h + m / 60;
      const useNight = state.night && noturnoEnabled;
      const unit = useNight
        ? valorHoraExtraNoturna(horaBase, rate, adicionalNoturno)
        : valorHoraExtra(horaBase, rate);
      return {
        rate,
        time,
        night: useNight,
        decimalHours,
        cost: Math.round(decimalHours * unit * 100) / 100,
      };
    });
    const hours = rows.reduce((total, row) => total + row.decimalHours, 0);
    const extraCost = rows.reduce((total, row) => total + row.cost, 0);
    const nightHours = rows
      .filter((r) => r.night)
      .reduce((total, row) => total + row.decimalHours, 0);
    const dsr = dsrEnabled ? calcManualDSR(extraCost) : 0;
    setCalculation({
      rows,
      hours,
      nightHours,
      extraCost: Math.round(extraCost * 100) / 100,
      dsr,
      total: Math.round((extraCost + dsr) * 100) / 100,
    });
  }

  const hasAnyInput = RATES.some(
    (rate) => values[rate].hours !== "" || values[rate].minutes !== ""
  );

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Calcular horas extras
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Informe horas e minutos por percentual (minutos de 0 a 100) para simular o custo{ownerLabel}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasAnyInput && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              Limpar campos
            </button>
          )}
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Hora base: {formatBRLValue(horaBase)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {RATES.map((rate) => {
          const style = rateStyles[rate];
          const value = values[rate];
          return (
            <div key={rate} className={cn("rounded-xl border p-3", style.border, style.bg)}>
              <div className="flex items-center justify-between">
                <span className={cn("text-sm font-bold", style.text)}>Horas de +{rate}%</span>
                <span className={cn("h-2 w-2 rounded-full", style.bar)} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <label className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Horas
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Horas"
                    value={value.hours}
                    onChange={(e) => updateTime(rate, "hours", e.target.value)}
                    className="w-full rounded-lg border border-white/80 bg-white px-2.5 py-2 text-sm font-bold tabular-nums text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-600 dark:focus:ring-indigo-900/40"
                  />
                </label>
                <span className="mt-5 text-sm font-bold text-slate-400">:</span>
                <label className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Minutos
                    </span>
                    <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
                      0-100
                    </span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0-100"
                    value={value.minutes}
                    onChange={(e) => updateTime(rate, "minutes", e.target.value)}
                    className="w-full rounded-lg border border-white/80 bg-white px-2.5 py-2 text-sm font-bold tabular-nums text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-600 dark:focus:ring-indigo-900/40"
                  />
                </label>
              </div>
              {/* Toggle de noturno */}
              <button
                type="button"
                onClick={() => toggleNight(rate)}
                disabled={!noturnoEnabled}
                aria-pressed={value.night && noturnoEnabled}
                className={cn(
                  "mt-2.5 flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
                  value.night && noturnoEnabled
                    ? "border-sky-300 bg-sky-100 text-sky-700 dark:border-sky-400/40 dark:bg-sky-500/20 dark:text-sky-300"
                    : "border-white/80 bg-white/70 text-slate-400 hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-500 dark:hover:text-slate-300"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  Noturno (22h–5h)
                </span>
                <span className="tabular-nums">+{noturnoEnabled ? adicionalNoturno : 0}%</span>
              </button>

              {calculation && (
                <p className={cn("mt-2 text-right text-xs font-semibold tabular-nums", style.text)}>
                  {formatBRLValue(calculation.rows.find((row) => row.rate === rate)?.cost ?? 0)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          {dsrEnabled
            ? "O resultado inclui DSR estimado de 4 domingos / 25 dias úteis."
            : "DSR desativado: o resultado considera somente as horas extras."}
        </p>
        <button
          type="button"
          onClick={calculate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-500/25 transition hover:bg-indigo-500 active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16v16H4z" />
            <path d="M8 8h8M8 12h8M8 16h3M14 16h2" />
          </svg>
          Calcular horas extras
        </button>
      </div>

      {calculation && (
        <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-4">
          <Result label="Total de horas" value={`${calculation.hours.toFixed(2).replace(".", ",")}h`} />
          <Result
            label="Horas noturnas"
            value={`${calculation.nightHours.toFixed(2).replace(".", ",")}h`}
          />
          <Result label="Horas extras" value={formatBRLValue(calculation.extraCost)} />
          <Result
            label={dsrEnabled ? "Total com DSR" : "Total calculado"}
            value={formatBRLValue(calculation.total)}
            emphasis
          />
        </div>
      )}
    </Card>
  );
}

function Result({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={cn("rounded-xl px-3 py-2.5", emphasis ? "bg-indigo-50 dark:bg-indigo-500/10" : "bg-slate-50 dark:bg-slate-800/60")}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      <p className={cn("mt-0.5 text-base font-bold tabular-nums", emphasis ? "text-indigo-700 dark:text-indigo-300" : "text-slate-800 dark:text-slate-100")}>
        {value}
      </p>
    </div>
  );
}
