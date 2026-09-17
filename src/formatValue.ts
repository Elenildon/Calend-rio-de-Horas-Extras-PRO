export function formatNumberValue(v: number): string {
  if (!isFinite(v)) return "0";
  if (Math.abs(v) >= 1000) {
    return `${Math.round(v)}`;
  }
  if (Number.isInteger(v)) return String(v);
  return String(v);
}

export function formatAxisNumber(v: number): string {
  if (Math.abs(v) >= 1000) {
    return `${Math.round(v / 100) / 10}k`;
  }
  return String(v);
}

export function formatBRLValue(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(v);
}

export function formatBRLCompactLabel(v: number): string {
  if (Math.abs(v) >= 1000) {
    return new Intl.NumberFormat("pt-BR", {
      notation: "compact",
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 1,
    }).format(v);
  }
  return formatBRLValue(v);
}
