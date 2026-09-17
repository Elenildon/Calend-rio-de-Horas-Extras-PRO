import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTheme } from "../theme";
import { shellTooltip } from "./ChartTooltip";
import { formatNumberValue } from "../formatValue";

const PALETTE: Record<string, string> = {
  Aprovado: "#10b981",
  Pendente: "#f59e0b",
  Recusado: "#f43f5e",
};

export interface DonutDatum {
  name: string;
  value: number;
}

export function BaseDonut({
  data,
  unit = "h",
  formatter = (v: number) => formatNumberValue(v),
}: {
  data: DonutDatum[];
  unit?: string;
  formatter?: (v: number) => string;
}) {
  const { theme } = useTheme();
  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <div className="flex h-64 flex-col items-center">
      <div className="relative h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={
                <DonutTooltip unit={unit} formatter={formatter} total={total} />
              }
              wrapperStyle={{ outline: "none" }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="66%"
              outerRadius="100%"
              paddingAngle={2}
              cornerRadius={6}
              animationDuration={700}
              stroke="none"
            >
              {data.map((d) => (
                <Cell
                  key={d.name}
                  fill={PALETTE[d.name] ?? "#94a3b8"}
                  stroke={
                    theme === "dark" ? "rgba(15,23,42,0.85)" : "#ffffff"
                  }
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
            {formatter(total)}
          </span>
          <span className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
            total
          </span>
        </div>
      </div>
      <div className="mt-2 w-full space-y-2">
        {data.map((d) => {
          const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0";
          return (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: PALETTE[d.name] ?? "#94a3b8" }}
                />
                <span className="capitalize">{d.name}</span>
                <span className="text-slate-400 dark:text-slate-500">
                  {unit === "h" ? formatNumberValue(d.value) : formatter(d.value)}
                </span>
              </div>
              <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DonutTooltip({
  active,
  payload,
  unit,
  formatter,
  total,
}: any) {
  const { theme } = useTheme();
  const shell = shellTooltip(theme);
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  const name = p.name;
  const value = p.value as number;
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
  return (
    <div className={shell}>
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: PALETTE[name] ?? "#94a3b8" }}
        />
        <span className="font-semibold capitalize text-slate-900 dark:text-white">
          {name}
        </span>
      </div>
      <div className="mt-1 text-slate-500 dark:text-slate-300">
        Valor:{" "}
        <span className="font-bold tabular-nums text-slate-900 dark:text-white">
          {unit === "h" ? `${formatNumberValue(value)} h` : formatter(value)}
        </span>
      </div>
      <div className="text-slate-500 dark:text-slate-400">Participação: {pct}%</div>
    </div>
  );
}

export { DonutTooltip };
