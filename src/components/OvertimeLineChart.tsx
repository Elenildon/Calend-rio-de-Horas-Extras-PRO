import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyPoint } from "../types";
import { useChartTheme } from "./ChartTooltip";
import { formatBRLValue, formatNumberValue } from "../formatValue";

interface Props {
  data: DailyPoint[];
}

const INDIGO = "#6366f1";
const EMERALD = "#10b981";

export function OvertimeLineChart({ data }: Props) {
  const c = useChartTheme();
  const chartData = data.map((d) => ({ ...d, horas: d.horas }));

  const hasCusto = chartData.some((d) => d.custo > 0);

  return (
    <div className="h-72 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
          <defs>
            <linearGradient id="gradHoras" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={INDIGO} stopOpacity={0.4} />
              <stop offset="100%" stopColor={INDIGO} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradCusto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={EMERALD} stopOpacity={0.35} />
              <stop offset="100%" stopColor={EMERALD} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: c.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: c.grid }}
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: c.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatNumberValue(v)}
            width={54}
          />
          <Tooltip
            content={<LineTooltipShell />}
            cursor={{ stroke: c.cursor, strokeWidth: 1.5 }}
            wrapperStyle={{ outline: "none" }}
          />
          <Area
            type="monotone"
            dataKey="horas"
            name="Horas extras"
            stroke={INDIGO}
            strokeWidth={2.5}
            fill="url(#gradHoras)"
            animationDuration={700}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
          />
          {hasCusto && (
            <Area
              type="monotone"
              dataKey="custo"
              name="Custo (R$)"
              stroke={EMERALD}
              strokeWidth={2}
              fill="url(#gradCusto)"
              animationDuration={700}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function LineTooltipShell({ active, payload, label }: any) {
  const c = useChartTheme();
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className={c.tooltipShell}>
      <div className="mb-1.5 font-semibold capitalize text-slate-900 dark:text-white">
        {label}
      </div>
      <div className="space-y-1">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: p.color || p.stroke }}
            />
            <span className="text-slate-500 dark:text-slate-300">
              {p.dataKey === "horas" ? "Horas extras" : "Custo"}
            </span>
            <span className="ml-auto font-semibold tabular-nums text-slate-900 dark:text-white">
              {p.dataKey === "horas"
                ? `${formatNumberValue(p.value)} h`
                : formatBRLValue(p.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
