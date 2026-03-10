import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Trend {
  direction: 'up' | 'down' | 'neutral';
  label: string;
}

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: Trend;
}

const trendStyles = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-slate-500 dark:text-slate-400',
} as const;

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
} as const;

export function StatCard({ label, value, icon: Icon, trend }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {value}
          </p>
        </div>
        <div className="rounded-md bg-slate-100 p-2 dark:bg-slate-800">
          <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </div>
      </div>
      {trend && (
        <div className={`mt-3 flex items-center gap-1 text-xs ${trendStyles[trend.direction]}`}>
          {(() => {
            const TrendIcon = trendIcons[trend.direction];
            return <TrendIcon className="h-3.5 w-3.5" />;
          })()}
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  );
}
