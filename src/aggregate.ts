import type {
  ColaboradorPonto,
  DailyPoint,
  HoraExtra,
  HoraExtraStatus,
  RangeState,
  Segment,
} from "./types";

export function parseISO(s: string): number {
  return new Date(`${s}T00:00:00`).getTime();
}

export function inRange(iso: string, range: RangeState): boolean {
  const t = parseISO(iso);
  return t >= parseISO(range.start) && t <= parseISO(range.end) + 86400000 - 1;
}

export interface Filters {
  segmento: Segment | "Todos";
  status: HoraExtraStatus | "Todos";
}

const FILTERS_ALL: Filters = { segmento: "Todos", status: "Todos" };

export function applyFilters(records: HoraExtra[], range: RangeState, filters: Filters): HoraExtra[] {
  return records.filter((r) => {
    if (!inRange(r.dataISO, range)) return false;
    if (filters.segmento !== "Todos" && r.departamento !== filters.segmento) return false;
    if (filters.status !== "Todos" && r.status !== filters.status) return false;
    return true;
  });
}

export { FILTERS_ALL };

const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function aggregateDaily(records: HoraExtra[]): DailyPoint[] {
  const map = new Map<string, DailyPoint>();
  for (const r of records) {
    let p = map.get(r.dataISO);
    if (!p) {
      const d = new Date(`${r.dataISO}T00:00:00`);
      p = {
        dateISO: r.dataISO,
        label: `${String(d.getDate()).padStart(2, "0")}/${MONTHS_PT[d.getMonth()]}`,
        horas: 0,
        custo: 0,
        registros: 0,
      };
      map.set(r.dataISO, p);
    }
    p.horas = Math.round((p.horas + r.horas) * 10) / 10;
    p.custo = Math.round((p.custo + r.valor) * 10) / 10;
    p.registros += 1;
  }
  return [...map.values()].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}

export function aggregateMonthlyByStatus(records: HoraExtra[], range: RangeState) {
  const map = new Map<string, { aprovado: number; pendente: number; recusado: number }>();
  const labels = new Set<string>();
  const start = new Date(`${range.start}T00:00:00`);
  const end = new Date(`${range.end}T00:00:00`);
  // build month labels between range
  const y0 = start.getFullYear();
  const m0 = start.getMonth();
  const months = (end.getFullYear() - y0) * 12 + (end.getMonth() - m0);
  for (let i = 0; i <= months && i <= 100; i++) {
    const d = new Date(y0, m0 + i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = `${MONTHS_PT[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    labels.add(key);
    map.set(key, { aprovado: 0, pendente: 0, recusado: 0 });
    void label;
  }

  for (const r of records) {
    const d = new Date(`${r.dataISO}T00:00:00`);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const row = map.get(key) ?? map.set(key, { aprovado: 0, pendente: 0, recusado: 0 }).get(key)!;
    if (r.status === "Aprovado") row.aprovado += r.horas;
    else if (r.status === "Pendente") row.pendente += r.horas;
    else row.recusado += r.horas;
  }

  const sortedKeys = [...map.keys()].sort();
  return {
    labels: sortedKeys,
    // only return keys physically sorted, keep data array in order
    data: sortedKeys.map((k) => {
      const row = map.get(k)!;
      const [y, m] = k.split("-").map(Number);
      return {
        label: `${MONTHS_PT[m]} ${String(y).slice(2)}`,
        aprovado: Math.round(row.aprovado * 10) / 10,
        pendente: Math.round(row.pendente * 10) / 10,
        recusado: Math.round(row.recusado * 10) / 10,
        total: Math.round((row.aprovado + row.pendente + row.recusado) * 10) / 10,
      };
    }),
  };
}

export interface StatusBreakdown {
  status: HoraExtraStatus;
  horas: number;
  registros: number;
  custo: number;
}

export function statusBreakdown(records: HoraExtra[]): StatusBreakdown[] {
  const by = new Map<HoraExtraStatus, StatusBreakdown>();
  for (const r of records) {
    let b = by.get(r.status);
    if (!b) {
      b = { status: r.status, horas: 0, registros: 0, custo: 0 };
      by.set(r.status, b);
    }
    b.horas += r.horas;
    b.registros += 1;
    b.custo += r.valor;
  }
  const order: HoraExtraStatus[] = ["Aprovado", "Pendente", "Recusado"];
  const arr: StatusBreakdown[] = [];
  for (const s of order) {
    const b = by.get(s);
    if (b)
      arr.push({
        status: b.status,
        horas: Math.round(b.horas * 10) / 10,
        registros: b.registros,
        custo: Math.round(b.custo * 10) / 10,
      });
  }
  return arr;
}

export function departamentoBreakdown(records: HoraExtra[], segments: Segment[]) {
  const arr = segments
    .map((seg) => {
      const sub = records.filter((r) => r.departamento === seg);
      return {
        name: seg,
        horas: Math.round(sub.reduce((a, b) => a + b.horas, 0) * 10) / 10,
        custo: Math.round(sub.reduce((a, b) => a + b.valor, 0) * 10) / 10,
      };
    })
    .filter((d) => d.horas > 0 || d.custo > 0);
  return arr;
}

export function colaboradorRanking(records: HoraExtra[]): ColaboradorPonto[] {
  const map = new Map<string, ColaboradorPonto>();
  for (const r of records) {
    let p = map.get(r.colaborador);
    if (!p) {
      p = { colaborador: r.colaborador, horas: 0, custo: 0, registros: 0 };
      map.set(r.colaborador, p);
    }
    p.horas += r.horas;
    p.custo += r.valor;
    p.registros += 1;
  }
  return [...map.values()]
    .map((p) => ({
      ...p,
      horas: Math.round(p.horas * 10) / 10,
      custo: Math.round(p.custo * 10) / 10,
    }))
    .sort((a, b) => b.horas - a.horas);
}

export function aggregateByWeekday(records: HoraExtra[]) {
  const map = new Map<number, { horas: number; custo: number; count: number }>();
  for (const r of records) {
    let d = map.get(r.dow);
    if (!d) { d = { horas: 0, custo: 0, count: 0 }; map.set(r.dow, d); }
    d.horas += r.horas;
    d.custo += r.valor;
    d.count += 1;
  }
  return [...map.entries()].map(([dow, d]) => ({ dow, horas: d.horas, custo: d.custo, count: d.count }))
    .sort((a, b) => a.dow - b.dow);
}

export function motivoBreakdown(records: HoraExtra[]) {
  const map = new Map<string, number>();
  for (const r of records) {
    map.set(r.motivo, (map.get(r.motivo) ?? 0) + r.horas);
  }
  return [...map.entries()]
    .map(([name, horas]) => ({
      name,
      horas: Math.round(horas * 10) / 10,
    }))
    .sort((a, b) => b.horas - a.horas);
}
