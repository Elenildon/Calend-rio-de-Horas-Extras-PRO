import { useEffect, useState } from "react";
import {
  ADICIONAL_NOTURNO_PRESETS,
  JORNADA_MENSAL_PRESETS,
  NOTURNO_FIM,
  NOTURNO_INICIO,
  SALARIO_PRESETS,
} from "../types";
import { formatSalarioInput, horaBaseFromSalario, parseSalarioInput } from "../salary";
import { cn } from "../utils/cn";

interface Props {
  salarioBruto: number;
  onChange: (v: number) => void;
  jornadaMensal: number;
  onJornadaChange: (v: number) => void;
  dsrEnabled: boolean;
  onToggleDsr: (v: boolean) => void;
  noturnoEnabled: boolean;
  onToggleNoturno: (v: boolean) => void;
  adicionalNoturno: number;
  onAdicionalNoturnoChange: (v: number) => void;
}

export function SalaryControl({
  salarioBruto,
  onChange,
  jornadaMensal,
  onJornadaChange,
  dsrEnabled,
  onToggleDsr,
  noturnoEnabled,
  onToggleNoturno,
  adicionalNoturno,
  onAdicionalNoturnoChange,
}: Props) {
  const [draft, setDraft] = useState(formatSalarioInput(salarioBruto));
  const [jornadaDraft, setJornadaDraft] = useState(String(jornadaMensal));
  const [focused, setFocused] = useState(false);

  // keep draft in sync when external value changes (e.g. preset click)
  useEffect(() => {
    if (!focused) setDraft(formatSalarioInput(salarioBruto));
  }, [salarioBruto, focused]);

  useEffect(() => {
    setJornadaDraft(String(jornadaMensal));
  }, [jornadaMensal]);

  const horaBase = horaBaseFromSalario(salarioBruto, jornadaMensal);

  function commit(raw: string) {
    const n = parseSalarioInput(raw);
    const clamped = Math.min(Math.max(n, 0), 999_999);
    onChange(clamped);
    setDraft(formatSalarioInput(clamped));
  }

  function bump(delta: number) {
    const next = Math.min(Math.max(Math.round(salarioBruto + delta), 0), 999_999);
    onChange(next);
  }

  function commitJornada(raw: string) {
    const parsed = Number(raw.replace(/\D/g, ""));
    const next = Math.min(Math.max(parsed || 1, 1), 400);
    onJornadaChange(next);
    setJornadaDraft(String(next));
  }

  function bumpJornada(delta: number) {
    onJornadaChange(Math.min(Math.max(jornadaMensal + delta, 1), 400));
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        {/* Label + value */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <circle cx="12" cy="12" r="2.5" />
                <path d="M6 12h.01M18 12h.01" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Salário Bruto
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Base de cálculo pela jornada informada
              </p>
            </div>
          </div>

          {/* Editable input with +/- buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Diminuir salário em R$ 100"
              onClick={() => bump(-100)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              −
            </button>

            <div
              className={cn(
                "relative flex items-center rounded-xl border bg-white transition dark:bg-slate-800",
                focused
                  ? "border-indigo-400 ring-2 ring-indigo-100 dark:border-indigo-400 dark:ring-indigo-900/40"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-500"
              )}
            >
              <span className="pl-3 text-sm font-semibold text-slate-400 dark:text-slate-500">
                R$
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={draft}
                onFocus={() => setFocused(true)}
                onBlur={() => {
                  setFocused(false);
                  commit(draft);
                }}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="w-28 bg-transparent px-2 py-2.5 text-right text-sm font-bold tabular-nums text-slate-800 outline-none dark:text-white sm:w-32"
                aria-label="Salário bruto mensal"
              />
            </div>

            <button
              type="button"
              aria-label="Aumentar salário em R$ 100"
              onClick={() => bump(100)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              +
            </button>
          </div>

          {/* Hora base badge */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 dark:border-indigo-500/20 dark:bg-indigo-500/10">
            <p className="text-[10px] font-medium uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
              Valor hora
            </p>
            <p className="text-sm font-bold tabular-nums text-indigo-700 dark:text-indigo-300">
              {horaBase.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Preset buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Atalhos
          </span>
          {SALARIO_PRESETS.map((p) => {
            const active = salarioBruto === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onChange(p)}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-xs font-semibold tabular-nums transition-all active:scale-95",
                  active
                    ? "border-emerald-500 bg-emerald-600 text-white shadow-sm shadow-emerald-500/30"
                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
                )}
              >
                R$ {(p / 1000).toFixed(p % 1000 === 0 ? 0 : 1)}k
              </button>
            );
          })}
        </div>
      </div>

      {/* Jornada mensal editável */}
      <div className="mt-3 flex flex-col gap-3 rounded-xl border border-violet-100 bg-violet-50/40 px-3 py-3 dark:border-violet-500/20 dark:bg-violet-500/5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Jornada mensal
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Horas contratuais trabalhadas no mês
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Diminuir jornada mensal em 10 horas"
              onClick={() => bumpJornada(-10)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-200 bg-white text-base font-bold text-violet-600 transition hover:bg-violet-50 active:scale-95 dark:border-violet-500/30 dark:bg-slate-800 dark:text-violet-300 dark:hover:bg-violet-500/10"
            >
              −
            </button>
            <div className="flex h-9 items-center rounded-lg border border-violet-200 bg-white dark:border-violet-500/30 dark:bg-slate-800">
              <input
                type="text"
                inputMode="numeric"
                value={jornadaDraft}
                onChange={(e) => setJornadaDraft(e.target.value)}
                onBlur={() => commitJornada(jornadaDraft)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                aria-label="Jornada mensal em horas"
                className="w-16 bg-transparent pl-3 pr-1 text-right text-sm font-bold tabular-nums text-slate-800 outline-none dark:text-white"
              />
              <span className="pr-3 text-xs font-semibold text-slate-400">h</span>
            </div>
            <button
              type="button"
              aria-label="Aumentar jornada mensal em 10 horas"
              onClick={() => bumpJornada(10)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-200 bg-white text-base font-bold text-violet-600 transition hover:bg-violet-50 active:scale-95 dark:border-violet-500/30 dark:bg-slate-800 dark:text-violet-300 dark:hover:bg-violet-500/10"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-medium uppercase tracking-wide text-violet-500 dark:text-violet-400">
            Jornadas
          </span>
          {JORNADA_MENSAL_PRESETS.map((hours) => (
            <button
              key={hours}
              type="button"
              onClick={() => onJornadaChange(hours)}
              className={cn(
                "rounded-lg border px-2.5 py-1.5 text-xs font-semibold tabular-nums transition-all active:scale-95",
                jornadaMensal === hours
                  ? "border-violet-500 bg-violet-600 text-white shadow-sm shadow-violet-500/25"
                  : "border-violet-200 bg-white text-violet-600 hover:bg-violet-50 dark:border-violet-500/30 dark:bg-slate-800 dark:text-violet-300 dark:hover:bg-violet-500/10"
              )}
            >
              {hours}h
            </button>
          ))}
        </div>
      </div>

      {/* Adicional noturno */}
      <div
        className={cn(
          "mt-3 flex flex-col gap-3 rounded-xl border px-3 py-2.5 transition-colors",
          noturnoEnabled
            ? "border-sky-100 bg-sky-50/60 dark:border-sky-500/20 dark:bg-sky-500/5"
            : "border-slate-100 bg-slate-50/60 dark:border-slate-700/50 dark:bg-slate-800/40"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                noturnoEnabled
                  ? "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
              )}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                <path d="M16 8l-1.5 3L11 12.5 14.5 14 16 17l1.5-3L21 12.5 17.5 11z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Adicional noturno
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Aplicado às horas trabalhadas entre {NOTURNO_INICIO}h e {NOTURNO_FIM}h
              </p>
            </div>
          </div>

          {/* Percentual editável */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Diminuir adicional noturno em 5%"
                onClick={() => onAdicionalNoturnoChange(Math.max(0, adicionalNoturno - 5))}
                disabled={!noturnoEnabled}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-200 bg-white text-base font-bold text-sky-600 transition hover:bg-sky-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-sky-500/30 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-sky-500/10"
              >
                −
              </button>
              <div className="flex h-9 items-center rounded-lg border border-sky-200 bg-white dark:border-sky-500/30 dark:bg-slate-800">
                <input
                  type="text"
                  inputMode="numeric"
                  value={adicionalNoturno}
                  disabled={!noturnoEnabled}
                  onChange={(e) => {
                    const parsed = Number(e.target.value.replace(/\D/g, ""));
                    onAdicionalNoturnoChange(Math.min(Math.max(parsed || 0, 0), 100));
                  }}
                  aria-label="Percentual do adicional noturno"
                  className="w-12 bg-transparent pl-2 pr-0.5 text-right text-sm font-bold tabular-nums text-slate-800 outline-none disabled:opacity-40 dark:text-white"
                />
                <span className="pr-2 text-xs font-semibold text-slate-400">%</span>
              </div>
              <button
                type="button"
                aria-label="Aumentar adicional noturno em 5%"
                onClick={() => onAdicionalNoturnoChange(Math.min(100, adicionalNoturno + 5))}
                disabled={!noturnoEnabled}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-200 bg-white text-base font-bold text-sky-600 transition hover:bg-sky-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-sky-500/30 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-sky-500/10"
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {ADICIONAL_NOTURNO_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  disabled={!noturnoEnabled}
                  onClick={() => onAdicionalNoturnoChange(p)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-xs font-semibold tabular-nums transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40",
                    adicionalNoturno === p
                      ? "border-sky-500 bg-sky-600 text-white shadow-sm shadow-sky-500/25"
                      : "border-sky-200 bg-white text-sky-600 hover:bg-sky-50 dark:border-sky-500/30 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-sky-500/10"
                  )}
                >
                  {p}%
                </button>
              ))}
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={noturnoEnabled}
              aria-label="Ativar adicional noturno"
              onClick={() => onToggleNoturno(!noturnoEnabled)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
                noturnoEnabled ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform duration-200",
                  noturnoEnabled ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Hora noturna ={" "}
          <span className="font-medium text-slate-500 dark:text-slate-400">
            (Salário ÷ jornada) × (1 + {adicionalNoturno}%)
          </span>{" "}
          — o percentual de hora extra incide sobre esse valor.
        </p>
      </div>

      {/* DSR toggle */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 dark:border-slate-700/50 dark:bg-slate-800/40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              DSR · Descanso Semanal Remunerado
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Soma o repouso semanal proporcional às horas extras
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={dsrEnabled}
          aria-label="Ativar cálculo de DSR"
          onClick={() => onToggleDsr(!dsrEnabled)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
            dsrEnabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
          )}
        >
          <span
            className={cn(
              "inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform duration-200",
              dsrEnabled ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
      </div>

      {/* Formula hint */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-slate-800 dark:text-slate-500">
        <span>
          Fórmula:{" "}
          <span className="font-medium text-slate-500 dark:text-slate-400">
            (Salário ÷ {jornadaMensal}h) × (1 + %)
          </span>
        </span>
        <span className="hidden sm:inline">·</span>
        <span>
          Seg–Sex <strong className="text-indigo-500">+60%</strong>
          {" · "}
          Sáb <strong className="text-amber-500">+75%</strong>
          {" · "}
          Dom <strong className="text-rose-500">+100%</strong>
        </span>
        {dsrEnabled && (
          <>
            <span className="hidden sm:inline">·</span>
            <span className="text-sky-500 dark:text-sky-400">
              + DSR (HE ÷ dias úteis × domingos)
            </span>
          </>
        )}
      </div>
    </div>
  );
}
