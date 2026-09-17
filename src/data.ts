import type {
  HoraExtra,
  HoraExtraStatus,
  Motivo,
  Segment,
} from "./types";

const COLABORADORES: { nome: string; matricula: string; departamento: Segment }[] = [
  { nome: "Elenildon Silva", matricula: "MAT-1024", departamento: "Produção" },
  { nome: "Mariana Costa", matricula: "MAT-1187", departamento: "Produção" },
  { nome: "Rafael Santos", matricula: "MAT-1042", departamento: "Produção" },
  { nome: "Carolina Lima", matricula: "MAT-2031", departamento: "Manutenção" },
  { nome: "Pedro Henrique", matricula: "MAT-2214", departamento: "Manutenção" },
  { nome: "Juliana Alves", matricula: "MAT-3098", departamento: "Logística" },
  { nome: "Bruno Ferreira", matricula: "MAT-3101", departamento: "Logística" },
  { nome: "André Souza", matricula: "MAT-4045", departamento: "Administrativo" },
  { nome: "Fernanda Rocha", matricula: "MAT-4090", departamento: "Administrativo" },
  { nome: "Tiago Nunes", matricula: "MAT-1270", departamento: "Produção" },
];

const MOTIVOS: Motivo[] = [
  "Acúmulo de serviço",
  "Manutenção corretiva",
  "Entrega urgente",
  "Inventário",
  "Demanda de projeto",
];

const STATUS_POOL: HoraExtraStatus[] = ["Aprovado", "Aprovado", "Aprovado", "Aprovado", "Aprovado", "Pendente", "Pendente", "Recusado"];

const MOTIVO_DEP: Record<Segment, Motivo[]> = {
  Produção: ["Acúmulo de serviço", "Demanda de projeto", "Entrega urgente", "Acúmulo de serviço"],
  Manutenção: ["Manutenção corretiva", "Demanda de projeto", "Manutenção corretiva"],
  Logística: ["Entrega urgente", "Inventário", "Entrega urgente", "Entrega urgente"],
  Administrativo: ["Acúmulo de serviço", "Inventário", "Demanda de projeto", "Acúmulo de serviço"],
};

// deterministic pseudo-random generator for stable sample data
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function formatISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Build records for the trailing 12+ months up to "today"
export function generateData(seed: number = 20260214): HoraExtra[] {
  const records: HoraExtra[] = [];
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  const rng = mulberry32(seed);

  // weekly seasonality by month (higher demand periods e.g. close of year)
  const seasonByMonth = [0.85, 0.72, 0.9, 1.05, 1.3, 1.15, 0.72, 0.9, 1.2, 1.35, 1.1, 0.95];

  let idNum = 1;
  const cursor = new Date(start);
  cursor.setHours(9, 0, 0, 0);

  while (cursor <= end) {
    const dow = cursor.getDay(); // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
    const monthIdx = cursor.getMonth();
    const isSaturday = dow === 6;
    const isSunday = dow === 0;
    const isWeekend = isSaturday || isSunday;
    const percentual = isSaturday ? 75 : isSunday ? 100 : 60; // % extra sobre o salário normal

    let countsTowardDay = true;
    if (isWeekend) {
      // weekends lower but not zero probability for logistics
      countsTowardDay = rng() <= 0.55;
    }

    if (countsTowardDay) {
      const seasonal = seasonByMonth[monthIdx];
      const weekendBoost = isWeekend ? 1.9 : 1;
      const volume = Math.round((rng() + rng()) * 1.7 * seasonal * weekendBoost);

      for (let i = 0; i < volume; i++) {
        const isOvernight = rng() > 0.82;
        const colaborador = COLABORADORES[Math.floor(rng() * COLABORADORES.length)];
        const dep = colaborador.departamento;
        const motivoPool = MOTIVO_DEP[dep] ?? MOTIVOS;
        const motivo = motivoPool[Math.floor(rng() * motivoPool.length)];
        const status = STATUS_POOL[Math.floor(rng() * STATUS_POOL.length)];

        const base = isOvernight ? 3 + rng() * 3.5 : 1.5 + rng() * 4.5;
        const extraWeekend = isWeekend ? 1 + rng() : 0.4 + rng() * 1.5;
        const horas = Math.max(1, Math.round(((base + extraWeekend) * 2))) / 2;

        // valor é recalculado dinamicamente a partir do Salário Bruto editável
        records.push({
          id: `HE-${String(idNum++).padStart(4, "0")}`,
          data: new Date(cursor),
          dataISO: formatISO(cursor),
          colaborador: colaborador.nome,
          matricula: colaborador.matricula,
          departamento: dep,
          horas,
          motivo,
          status,
          valor: 0,
          dow,
          percentual,
          noturno: isOvernight,
        });

        cursor.setMinutes(cursor.getMinutes() + 25 + Math.floor(rng() * 220));
      }
    }

    cursor.setDate(cursor.getDate() + 1);
    cursor.setHours(9, 0, 0, 0);
  }

  return records.sort((a, b) => a.data.getTime() - b.data.getTime());
}

export const ALL_MOTIVOS: Motivo[] = [...MOTIVOS];
export const ALL_DEPARTAMENTOS: Segment[] = [
  "Produção",
  "Manutenção",
  "Logística",
  "Administrativo",
];
export const ALL_STATUS: HoraExtraStatus[] = ["Aprovado", "Pendente", "Recusado"];
