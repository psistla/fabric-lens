import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import { CHART_TOOLTIP_STYLE, CHART_FALLBACK_COLOR } from '@/utils/constants';

interface Props {
  data: { name: string; value: number }[];
  /** Override the denominator for % calculation (e.g. pass full item count when data is sliced) */
  total?: number;
}

// Hex values mirror --item-* CSS tokens — needed for SVG fill attributes
const ITEM_TYPE_COLORS: Record<string, string> = {
  Lakehouse:    '#4F46E5',
  Notebook:     '#7C3AED',
  Pipeline:     '#15803D',
  Warehouse:    '#0891B2',
  Report:       '#B45309',
  SemanticModel:'#DB2777',
  Dashboard:    '#EA580C',
  DataPipeline: '#15803D',
};

export function ItemsByTypeChart({ data, total: totalOverride }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-[var(--m-text-tertiary)]">
        No items to display
      </div>
    );
  }

  const total = totalOverride ?? data.reduce((sum, d) => sum + d.value, 0);
  const chartHeight = data.length * 28 + 8;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 64, bottom: 0, left: 8 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={130}
          tick={{ fontSize: 12, fill: 'var(--m-text-secondary)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
          itemStyle={{ color: '#e2e8f0' }}
          formatter={(value?: number | string | readonly (string | number)[]) => {
            const v = typeof value === 'number' ? value : 0;
            return [`${v} (${total > 0 ? Math.round((v / total) * 100) : 0}%)`, 'Items'];
          }}
          cursor={{ fill: 'var(--m-surface-hover)', opacity: 0.6 }}
        />
        <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={14}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={ITEM_TYPE_COLORS[entry.name] ?? CHART_FALLBACK_COLOR}
            />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            content={(props) => {
              const { x = 0, y = 0, width = 0, height = 0, value } = props as {
                x?: number; y?: number; width?: number; height?: number; value?: number;
              };
              const v = value ?? 0;
              const pct = total > 0 ? Math.round((v / total) * 100) : 0;
              return (
                <text
                  x={x + width + 6}
                  y={y + height / 2}
                  dominantBaseline="middle"
                  fontSize={11}
                  fill="var(--m-text-secondary)"
                  fontFamily="inherit"
                >
                  {v} · {pct}%
                </text>
              );
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
