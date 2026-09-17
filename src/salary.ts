import type { HoraExtra } from "./types";
import { ADICIONAL_NOTURNO_PADRAO, HORAS_MENSAIS_PADRAO } from "./types";

/** Valor da hora normal a partir do salário bruto mensal */
export function horaBaseFromSalario(salarioBruto: number, horasMensais = HORAS_MENSAIS_PADRAO): number {
  if (!salarioBruto || salarioBruto <= 0) return 0;
  return salarioBruto / horasMensais;
}

/**
 * Custo de 1h extra = horaBase × (1 + percentual/100)
 * Ex.: sáb +75% → ×1.75 | dom +100% → ×2.0 | seg-sex +60% → ×1.6
 */
export function valorHoraExtra(horaBase: number, percentual: number): number {
  return horaBase * (1 + percentual / 100);
}

/**
 * Valor da hora noturna = horaBase × (1 + %adicionalNoturno/100)
 * O adicional noturno incide sobre a hora, antes do percentual de hora extra.
 */
export function valorHoraNoturna(
  horaBase: number,
  adicionalNoturno = ADICIONAL_NOTURNO_PADRAO
): number {
  return horaBase * (1 + adicionalNoturno / 100);
}

/**
 * Custo de 1h extra noturna:
 *   horaBase × (1 + %noturno/100) × (1 + %HE/100)
 *
 * Ex.: seg-sex noturna (+60% HE, +20% noturno) → 1.2 × 1.6 = ×1.92
 */
export function valorHoraExtraNoturna(
  horaBase: number,
  percentual: number,
  adicionalNoturno = ADICIONAL_NOTURNO_PADRAO
): number {
  return valorHoraNoturna(horaBase, adicionalNoturno) * (1 + percentual / 100);
}

/** Estimativa mensal do DSR para uma soma manual de horas extras. */
export function calcManualDSR(
  valorHorasExtras: number,
  domingos = 4,
  diasUteis = 25
): number {
  if (valorHorasExtras <= 0 || diasUteis <= 0) return 0;
  return Math.round(valorHorasExtras * (domingos / diasUteis) * 100) / 100;
}

/**
 * Recalcula o campo `valor` de cada registro.
 * Registros noturnos recebem o adicional noturno antes do percentual de HE.
 */
export function repriceRecords(
  records: HoraExtra[],
  salarioBruto: number,
  jornadaMensal = HORAS_MENSAIS_PADRAO,
  adicionalNoturno = ADICIONAL_NOTURNO_PADRAO,
  noturnoEnabled = true
): HoraExtra[] {
  const horaBase = horaBaseFromSalario(salarioBruto, jornadaMensal);
  return records.map((r) => {
    const unit =
      r.noturno && noturnoEnabled
        ? valorHoraExtraNoturna(horaBase, r.percentual, adicionalNoturno)
        : valorHoraExtra(horaBase, r.percentual);
    const bruto = Math.round(r.horas * unit * 100) / 100;
    let valor = bruto;
    if (r.status === "Recusado") valor = 0;
    else if (r.status === "Pendente") valor = Math.round(bruto * 0.25 * 100) / 100;
    return { ...r, valor };
  });
}

/** Soma o custo do adicional noturno (diferença entre valor com e sem noturno). */
export function calcAdicionalNoturno(
  records: HoraExtra[],
  horaBase: number,
  adicionalNoturno: number,
  noturnoEnabled: boolean
): { horas: number; custo: number; registros: number } {
  if (!noturnoEnabled || adicionalNoturno <= 0) {
    return { horas: 0, custo: 0, registros: 0 };
  }
  let horas = 0;
  let custo = 0;
  let registros = 0;
  for (const r of records) {
    if (!r.noturno || r.status !== "Aprovado") continue;
    const comNoturno = r.horas * valorHoraExtraNoturna(horaBase, r.percentual, adicionalNoturno);
    const semNoturno = r.horas * valorHoraExtra(horaBase, r.percentual);
    horas += r.horas;
    custo += comNoturno - semNoturno;
    registros += 1;
  }
  return {
    horas: Math.round(horas * 10) / 10,
    custo: Math.round(custo * 100) / 100,
    registros,
  };
}

/**
 * DSR — Descanso Semanal Remunerado sobre horas extras (CLT).
 *
 * Fórmula (por mês):
 *   DSR = (Σ valor das HE do mês ÷ dias úteis do mês) × (domingos + feriados do mês)
 *
 * Aqui contamos os domingos do mês (feriados não inclusos — estimativa) e
 * consideramos "dias úteis" = dias do mês menos os domingos.
 * Aplica-se somente aos lançamentos aprovados (mesma base do custo do painel).
 */
export function calcDSR(records: HoraExtra[]): number {
  const byMonth = new Map<string, number>();
  for (const r of records) {
    if (r.status !== "Aprovado") continue;
    const key = r.dataISO.slice(0, 7); // YYYY-MM
    byMonth.set(key, (byMonth.get(key) ?? 0) + r.valor);
  }

  let total = 0;
  for (const [key, valorMes] of byMonth) {
    const [y, m] = key.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    let domingos = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (new Date(y, m - 1, d).getDay() === 0) domingos++;
    }
    const diasUteis = daysInMonth - domingos;
    if (diasUteis > 0 && domingos > 0) {
      total += valorMes * (domingos / diasUteis);
    }
  }
  return Math.round(total * 100) / 100;
}

export function formatSalarioInput(v: number): string {
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

export function parseSalarioInput(raw: string): number {
  // aceita "3.500", "3500", "3.500,00", "R$ 3500"
  const cleaned = raw
    .replace(/[R$\s]/gi, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
