import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS, CHART_TOOLTIP_STYLE } from '@/utils/constants';

interface Props {
  data: { name: string; value: number }[];
}

export function ItemsByTypeChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No items to display
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex items-start gap-4">
      <div className="shrink-0" style={{ width: 200, height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              stroke="none"
            >
              {data.map((_entry, index) => (
                <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(value?: number, name?: string) => {
                const v = value ?? 0;
                return [
                  `${v} (${total > 0 ? Math.round((v / total) * 100) : 0}%)`,
                  name ?? '',
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="min-w-0 flex-1 space-y-1 pt-1">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            <span className="min-w-0 flex-1 truncate text-slate-600 dark:text-slate-400">
              {entry.name}
            </span>
            <span className="shrink-0 font-medium tabular-nums text-slate-900 dark:text-slate-100">
              {entry.value}
            </span>
            <span className="w-9 shrink-0 text-right text-slate-400 dark:text-slate-500">
              {total > 0 ? `${Math.round((entry.value / total) * 100)}%` : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
