import { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "./theme";
import { generateData, formatISO, fromISO } from "./data";
import type { HoraExtraStatus, PeriodUnit, RangeState, Segment } from "./types";
import {
  ADICIONAL_NOTURNO_PADRAO,
  HORAS_MENSAIS_PADRAO,
  SALARIO_BRUTO_DEFAULT,
} from "./types";
import {
  applyFilters,
  aggregateDaily,
  aggregateMonthlyByStatus,
  statusBreakdown,
  aggregateByWeekday,
} from "./aggregate";
import { repriceRecords, calcDSR, calcAdicionalNoturno, horaBaseFromSalario } from "./salary";
import { WeekdayBarChart } from "./components/WeekdayBarChart";
import { Header } from "./components/Header";
import { FilterBar } from "./components/FilterBar";
import { SalaryControl } from "./components/SalaryControl";
import { OvertimeCalculator } from "./components/OvertimeCalculator";
import { Card } from "./components/ui";
import { KpiCard, type KpiValue } from "./components/KpiCards";
import { OvertimeLineChart } from "./components/OvertimeLineChart";
import { StatusBarChart } from "./components/StatusBarChart";
import { BaseDonut } from "./components/StatusDonut";
import { WeekdayRateCard } from "./components/WeekdayRateCard";
import { UserWelcome, getFirstName } from "./components/UserWelcome";
import { AndroidExport } from "./components/AndroidExport";
import {
  Clock,
  Banknote,
  FileText,
  Users,
  CalendarDays,
  Layers,
  RefreshCw,
  CheckCircle2,
  X,
} from "lucide-react";

function addDaysISO(iso: string, days: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + days);
  return formatISO(d);
}

function todayISO(): string {
  return formatISO(new Date());
}

function rangeForPeriod(unit: PeriodUnit, amount: number): RangeState {
  const end = todayISO();
  if (unit === "days") {
    return { start: addDaysISO(end, -(amount - 1)), end };
  }

  // Período móvel em meses, preservando corretamente os finais de mês.
  const endDate = fromISO(end);
  const start = new Date(endDate);
  const endDay = start.getDate();
  start.setDate(1);
  start.setMonth(start.getMonth() - amount);
  const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  start.setDate(Math.min(endDay, lastDay));
  start.setDate(start.getDate() + 1);
  return { start: formatISO(start), end };
}

export default function App() {
  const [dataSeed, setDataSeed] = useState<number>(20260214);
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date());
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  const [periodUnit, setPeriodUnit] = useState<PeriodUnit>("months");
  const [periodAmount, setPeriodAmount] = useState(6);
  const [segmento, setSegmento] = useState<Segment | "Todos">("Todos");
  const [status, setStatus] = useState<HoraExtraStatus | "Todos">("Todos");
  const [salarioBruto, setSalarioBruto] = useState(SALARIO_BRUTO_DEFAULT);
  const [jornadaMensal, setJornadaMensal] = useState(HORAS_MENSAIS_PADRAO);
  const [dsrEnabled, setDsrEnabled] = useState(true);
  const [noturnoEnabled, setNoturnoEnabled] = useState(true);
  const [adicionalNoturno, setAdicionalNoturno] = useState(ADICIONAL_NOTURNO_PADRAO);
  const [userName, setUserName] = useState<string>(() => {
    try {
      return window.localStorage.getItem("he-username") ?? "Elenildon";
    } catch {
      return "Elenildon";
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("he-username", userName);
    } catch {
      /* ignore */
    }
  }, [userName]);

  const displayName = userName.trim() ? getFirstName(userName) : "Elenildon";

  const range = useMemo(
    () => rangeForPeriod(periodUnit, periodAmount),
    [periodUnit, periodAmount]
  );

  const rawRecords = useMemo(() => generateData(dataSeed), [dataSeed]);

  // Recalcula todos os registros quando salário, jornada ou noturno mudam.
  const ALL = useMemo(
    () =>
      repriceRecords(rawRecords, salarioBruto, jornadaMensal, adicionalNoturno, noturnoEnabled),
    [rawRecords, salarioBruto, jornadaMensal, adicionalNoturno, noturnoEnabled]
  );

  const handleRefresh = () => {
    setIsUpdating(true);
    const now = new Date();
    setDataSeed((prev) => (prev === 20260214 ? Date.now() : prev + 1));
    setLastUpdated(now);
    setToastMessage(`Painel e cálculos atualizados às ${now.toLocaleTimeString("pt-BR")}`);
    setShowToast(true);

    setTimeout(() => {
      setIsUpdating(false);
    }, 450);

    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handlePeriodUnit = (unit: PeriodUnit) => {
    setPeriodUnit(unit);
    setPeriodAmount(unit === "days" ? 30 : 6);
  };

  // ---- filtered records (current period) ----
  const currentRecords = useMemo(
    () => applyFilters(ALL, range, { segmento, status }),
    [ALL, range, segmento, status]
  );

  // ---- prev period for trend deltas ----
  const periodDays = Math.round((fromISO(range.end).getTime() - fromISO(range.start).getTime()) / 86400000) + 1;
  const prevEnd = addDaysISO(range.start, -1);
  const prevStart = addDaysISO(prevEnd, -(periodDays - 1));
  const prevRange = { start: prevStart, end: prevEnd };
  const prevRecords = useMemo(
    () => applyFilters(ALL, prevRange, { segmento, status }),
    [ALL, prevRange.start, prevRange.end, segmento, status]
  );

  const totalsCurrent = useMemo(() => computeTotals(currentRecords), [currentRecords]);
  const totalsPrev = useMemo(() => computeTotals(prevRecords), [prevRecords]);

  // ---- DSR (Descanso Semanal Remunerado) ----
  const dsrCurrent = useMemo(
    () => (dsrEnabled ? calcDSR(currentRecords) : 0),
    [currentRecords, dsrEnabled]
  );
  const dsrPrev = useMemo(
    () => (dsrEnabled ? calcDSR(prevRecords) : 0),
    [prevRecords, dsrEnabled]
  );
  const custoTotalCurrent = totalsCurrent.custo + dsrCurrent;
  const custoTotalPrev = totalsPrev.custo + dsrPrev;
  const dsrRate = totalsCurrent.custo > 0 ? (dsrCurrent / totalsCurrent.custo) * 100 : 0;

  // ---- derived chart data ----
  const daily = useMemo(() => aggregateDaily(currentRecords), [currentRecords]);
  const monthly = useMemo(() => aggregateMonthlyByStatus(currentRecords, range), [currentRecords, range]);
  const statusPie = useMemo(() => statusBreakdown(currentRecords), [currentRecords]);
  const weekdayData = useMemo(() => aggregateByWeekday(currentRecords), [currentRecords]);

  const kpis = useMemo<KpiValue[]>(
    () => [
      {
        id: "horas",
        title: "Horas extras no período",
        value: totalsCurrent.horasLabel,
        delta: pct(totalsCurrent.horas, totalsPrev.horas),
        icon: clockIcon,
        spark: totalsCurrent.totalHorasHistory.map((h) => h[1]),
      },
      {
        id: "custo",
        title: "Custo HE (aprovado)",
        value: totalsCurrent.custoLabel,
        delta: pct(totalsCurrent.custo, totalsPrev.custo),
        icon: moneyIcon,
        spark: totalsCurrent.custoHistory.map((h) => h[1]),
      },
      {
        id: "dsr",
        title: dsrEnabled ? `DSR · ${dsrRate.toFixed(1)}% do HE` : "DSR (desativado)",
        value: compactBRL(dsrCurrent),
        delta: pct(dsrCurrent, dsrPrev),
        icon: dsrIcon,
        spark: [dsrPrev, dsrCurrent],
      },
      {
        id: "custoTotal",
        title: "Custo total (HE + DSR)",
        value: compactBRL(custoTotalCurrent),
        delta: pct(custoTotalCurrent, custoTotalPrev),
        icon: totalIcon,
        spark: [custoTotalPrev, custoTotalCurrent],
      },
      {
        id: "registros",
        title: "Registros lançados",
        value: String(totalsCurrent.count),
        delta: pct(totalsCurrent.count, totalsPrev.count),
        icon: recIcon,
        spark: totalsCurrent.horaHistoryCount,
      },
      {
        id: "media",
        title: "Média por colaborador/mês",
        value: totalsCurrent.mediaLabel,
        delta: pct(totalsCurrent.media, totalsPrev.media),
        icon: userIcon,
        spark: totalsCurrent.mediaHistory,
      },
    ],
    [totalsCurrent, totalsPrev, dsrCurrent, dsrPrev, custoTotalCurrent, custoTotalPrev, dsrEnabled]
  );

  const donutData = statusPie.map((s) => ({
    name: s.status,
    value: s.horas,
  }));

  // ---- night additional breakdown ----
  const horaBase = horaBaseFromSalario(salarioBruto, jornadaMensal);
  const nightStats = useMemo(
    () =>
      calcAdicionalNoturno(currentRecords, horaBase, adicionalNoturno, noturnoEnabled),
    [currentRecords, horaBase, adicionalNoturno, noturnoEnabled]
  );

  // ---- weekend breakdown for WeekdayRateCard ----
  const weekendRecords = currentRecords.filter((r) => r.percentual > 50);
  const weekendHours = weekendRecords.reduce((a, b) => a + b.horas, 0);
  const weekendCost = weekendRecords
    .filter((r) => r.status === "Aprovado")
    .reduce((a, b) => a + b.valor, 0);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Header
          userName={userName}
          onRefresh={handleRefresh}
          isRefreshing={isUpdating}
          lastUpdated={lastUpdated}
        />
        <main className="mx-auto max-w-[1400px] space-y-5 px-4 py-5 sm:px-6 lg:px-8">
          {/* Nome do usuário — logo no início */}
          <UserWelcome userName={userName} onChange={setUserName} />

          {/* Title row with owner and Atualizar button */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                Visão geral das horas extras
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Acompanhe volume, custo e aprovações do calendário automatizado de{" "}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{displayName}</span>.{" "}
                Custos calculados a partir do{" "}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">salário bruto</span>.{" "}
                <span className="text-slate-400 dark:text-slate-500">
                  {formatISO(fromISO(range.start))} → {formatISO(fromISO(range.end))}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-atualizar-painel"
                onClick={handleRefresh}
                disabled={isUpdating}
                title="Recalcular métricas e atualizar painel"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-95 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 ${
                    isUpdating ? "animate-spin" : ""
                  }`}
                />
                <span>Atualizar Painel</span>
              </button>
            </div>
          </div>

          <FilterBar
            periodUnit={periodUnit}
            periodAmount={periodAmount}
            range={range}
            onUnitChange={handlePeriodUnit}
            onAmountChange={setPeriodAmount}
            segmento={segmento}
            onSegmento={setSegmento}
            status={status}
            onStatus={setStatus}
          />

          {/* Salário Bruto editável + DSR */}
          <SalaryControl
            salarioBruto={salarioBruto}
            onChange={setSalarioBruto}
            jornadaMensal={jornadaMensal}
            onJornadaChange={setJornadaMensal}
            dsrEnabled={dsrEnabled}
            onToggleDsr={setDsrEnabled}
            noturnoEnabled={noturnoEnabled}
            onToggleNoturno={setNoturnoEnabled}
            adicionalNoturno={adicionalNoturno}
            onAdicionalNoturnoChange={setAdicionalNoturno}
          />

          <OvertimeCalculator
            salarioBruto={salarioBruto}
            jornadaMensal={jornadaMensal}
            dsrEnabled={dsrEnabled}
            noturnoEnabled={noturnoEnabled}
            adicionalNoturno={adicionalNoturno}
            userName={userName}
          />

          {/* KPI cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kpis.map((k) => (
              <KpiCard key={k.id} kpi={k} />
            ))}
          </section>

          {/* Weekday rates + hours by weekday */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <WeekdayRateCard
                weekendHours={weekendHours}
                weekendCost={weekendCost}
                weekendCount={weekendRecords.length}
                noturnoEnabled={noturnoEnabled}
                adicionalNoturno={adicionalNoturno}
                nightHours={nightStats.horas}
                nightCost={nightStats.custo}
                nightCount={nightStats.registros}
              />
            </div>
            <div className="lg:col-span-2">
              <WeekdayBarChart data={weekdayData} />
            </div>
          </section>

          {/* Charts row */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Evolução diária
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Horas extras e custo acumulados por dia
                  </p>
                </div>
                <div className="flex gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" /> Horas
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Custo
                  </span>
                </div>
              </div>
              <OvertimeLineChart data={daily} />
            </Card>

            <Card className="p-5">
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Distribuição por status
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Horas por situação de aprovação
                </p>
              </div>
              <BaseDonut data={donutData} />
            </Card>
          </section>

          {/* second charts row */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="mb-1">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Horas por mês × status
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Volume mensal segmentado por situação
                </p>
              </div>
              <StatusBarChart data={monthly.data} />
            </Card>
          </section>

          {/* Publicar no Android (.aab) */}
          <AndroidExport />

          <footer className="pb-6 pt-2 text-center text-xs text-slate-400 dark:text-slate-600">
            Calendário de Horas Extras · Painel otimizado e 100% automatizado · Gerido por{" "}
            <span className="font-semibold text-slate-500 dark:text-slate-400">{displayName}</span>
          </footer>
        </main>

        {/* Floating feedback toast */}
        {showToast && (
          <div
            id="toast-atualizado"
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white/95 px-4 py-3 text-xs font-medium text-emerald-900 shadow-2xl shadow-emerald-500/20 backdrop-blur transition-all dark:border-emerald-500/30 dark:bg-slate-900/95 dark:text-emerald-200"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div className="pr-2">
              <p className="font-bold text-slate-900 dark:text-white">{toastMessage}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Horas, custos, DSR e adicionais sincronizados.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              aria-label="Fechar notificação"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

// ---- KPI totals aggregation ----
interface Totals {
  horas: number;
  custo: number;
  count: number;
  media: number;
  horasLabel: string;
  custoLabel: string;
  mediaLabel: string;
  totalHorasHistory: [string, number][];
  custoHistory: [string, number][];
  horaHistoryCount: number[];
  mediaHistory: number[];
}

function computeTotals(records: import("./types").HoraExtra[]): Totals {
  const horas = records.reduce((a, b) => a + b.horas, 0);
  const approved = records.filter((r) => r.status === "Aprovado");
  const custo = approved.reduce((a, b) => a + b.valor, 0);

  const names = new Set(records.map((r) => r.colaborador)).size || 1;
  const months = uniqueMonths(records);
  const media = (horas / names) / Math.max(1, months);

  // daily history for sparkline
  const byDate = new Map<string, number>();
  const byCust = new Map<string, number>();
  const byCountArr = new Map<string, number>();
  for (const r of records) {
    byDate.set(r.dataISO, (byDate.get(r.dataISO) ?? 0) + r.horas);
    if (r.status === "Aprovado") byCust.set(r.dataISO, (byCust.get(r.dataISO) ?? 0) + r.valor);
    byCountArr.set(r.dataISO, (byCountArr.get(r.dataISO) ?? 0) + 1);
  }
  const sortedDates = [...byDate.keys()].sort();
  const totalHorasHistory = sortedDates.map((d) => [d, byDate.get(d) ?? 0] as [string, number]);
  const custoHistory = sortedDates.map((d) => [d, byCust.get(d) ?? 0] as [string, number]);
  const horaHistoryCount = sortedDates.map((d) => byCountArr.get(d) ?? 0);

  // media history
  const mediaHistory: number[] = [];
  const byMonth = new Map<string, { horas: number; names: Set<string> }>();
  for (const r of records) {
    const k = r.dataISO.slice(0, 7);
    const m = byMonth.get(k) ?? { horas: 0, names: new Set<string>() };
    m.horas += r.horas;
    m.names.add(r.colaborador);
    byMonth.set(k, m);
  }
  for (const m of byMonth.values()) {
    mediaHistory.push(Math.round((m.horas / Math.max(1, m.names.size)) * 10) / 10);
  }

  return {
    horas,
    custo,
    count: records.length,
    media,
    horasLabel: `${Math.round(horas)}h`,
    custoLabel: compactBRL(custo),
    mediaLabel: `${media.toFixed(1)}h`,
    totalHorasHistory,
    custoHistory,
    horaHistoryCount,
    mediaHistory,
  };
}

function uniqueMonths(records: import("./types").HoraExtra[]): number {
  const s = new Set(records.map((r) => r.dataISO.slice(0, 7)));
  return s.size;
}

function compactBRL(v: number): string {
  if (v === 0) return "R$ 0";
  if (Math.abs(v) >= 1000) {
    return new Intl.NumberFormat("pt-BR", {
      notation: "compact",
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 1,
    }).format(v);
  }
  return `R$ ${Math.round(v)}`;
}

function pct(cur: number, prev: number): number {
  if (prev === 0) return cur === 0 ? 0 : 100;
  return ((cur - prev) / prev) * 100;
}

// icons
const clockIcon = <Clock className="h-5 w-5" />;
const moneyIcon = <Banknote className="h-5 w-5" />;
const recIcon = <FileText className="h-5 w-5" />;
const userIcon = <Users className="h-5 w-5" />;
const dsrIcon = <CalendarDays className="h-5 w-5" />;
const totalIcon = <Layers className="h-5 w-5" />;
