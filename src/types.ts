export type Segment = "Produção" | "Manutenção" | "Logística" | "Administrativo";

export type HoraExtraStatus = "Aprovado" | "Pendente" | "Recusado";

export type Motivo = "Acúmulo de serviço" | "Manutenção corretiva" | "Entrega urgente" | "Inventário" | "Demanda de projeto";

export interface HoraExtra {
  id: string;
  data: Date;
  dataISO: string;
  colaborador: string;
  matricula: string;
  departamento: Segment;
  horas: number;
  motivo: Motivo;
  /** Custo recalculado a partir do salário bruto editável */
  valor: number;
  status: HoraExtraStatus;
  dow: number; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  percentual: number; // 60 (seg-sex), 75 (sáb), 100 (dom)
  noturno: boolean; // trabalho entre 22h e 5h
}

/** Horas mensais padrão CLT usadas para calcular o valor da hora */
export const HORAS_MENSAIS_PADRAO = 220;

/** Atalhos comuns para a jornada mensal */
export const JORNADA_MENSAL_PRESETS = [180, 200, 220] as const;

/** Adicional noturno padrão CLT (%) — aplicado entre 22h e 5h */
export const ADICIONAL_NOTURNO_PADRAO = 20;

/** Atalhos comuns para o adicional noturno (%) */
export const ADICIONAL_NOTURNO_PRESETS = [20, 25, 30, 40] as const;

/** Intervalo legal do trabalho noturno */
export const NOTURNO_INICIO = 22; // 22h
export const NOTURNO_FIM = 5; // 5h

/** Presets rápidos de salário bruto (R$) */
export const SALARIO_PRESETS = [2500, 3000, 3500, 4000, 4500, 5000, 6000, 8000] as const;

export const SALARIO_BRUTO_DEFAULT = 3500;

export interface DailyPoint {
  dateISO: string;
  label: string;
  horas: number;
  custo: number;
  registros: number;
}

export interface MonthlyPoint {
  label: string;
  aprovado: number;
  pendente: number;
  recusado: number;
  total: number;
}

export interface ColaboradorPonto {
  colaborador: string;
  horas: number;
  custo: number;
  registros: number;
}

export type PeriodUnit = "days" | "months";

export interface RangeState {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}
