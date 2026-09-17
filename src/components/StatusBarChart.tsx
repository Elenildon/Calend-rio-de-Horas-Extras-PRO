import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartTheme } from "./ChartTooltip";
import { formatNumberValue } from "../formatValue";

const PALETTE: Record<string, string> = {
  aprovado: "#10b981",
  pendente: "#f59e0b",
  recusado: "#f43f5e",
};

interface Props {
  data: {
    label: string;
    aprovado: number;
    pendente: number;
    recusado: number;
  }[];
}

export function StatusBarChart({ data }: Props) {
  const c = useChartTheme();
  return (
    <div className="h-72 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: c.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: c.grid }}
          />
          <YAxis
            tick={{ fill: c.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatNumberValue(v)}
            width={54}
          />
          <Tooltip content={<BarTooltip />} cursor={{ fill: c.cursor }} wrapperStyle={{ outline: "none" }} />
          <Bar dataKey="aprovado" name="Aprovado" stackId="a" fill={PALETTE.aprovado} radius={[0, 0, 0, 0]} animationDuration={650} />
          <Bar dataKey="pendente" name="Pendente" stackId="a" fill={PALETTE.pendente} animationDuration={650} />
          <Bar dataKey="recusado" name="Recusado" stackId="a" fill={PALETTE.recusado} radius={[4, 4, 0, 0]} animationDuration={650} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function BarTooltip({ active, payload, label }: any) {
  const c = useChartTheme();
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className={c.tooltipShell}>
      <div className="mb-1.5 font-semibold text-slate-900 dark:text-white">{label}</div>
      <div className="space-y-1">
        {payload.slice().reverse().map((p: any) => {
          const key = String(p.dataKey);
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />
              <span className="capitalize text-slate-500 dark:text-slate-300">{key}</span>
              <span className="ml-auto font-semibold tabular-nums text-slate-900 dark:text-white">
                {formatNumberValue(p.value)} h
              </span>
            </div>
          );
        })}
        {payload.length > 0 && (
          <div className="mt-1.5 border-t border-slate-200 pt-1.5 text-slate-500 dark:border-slate-600 dark:text-slate-300">
            <span className="font-medium text-slate-700 dark:text-slate-200">Total</span>
            <span className="ml-auto float-right font-bold tabular-nums text-slate-900 dark:text-white">
              {formatNumberValue(payload.reduce((a: number, b: any) => a + (b.value as number), 0))} h
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
