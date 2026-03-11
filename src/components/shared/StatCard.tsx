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
  neutral: 'text-[var(--text-secondary)]',
} as const;

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
} as const;

export function StatCard({ label, value, icon: Icon, trend }: Props) {
  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
            {value}
          </p>
        </div>
        <div className="rounded-md bg-[var(--surface-secondary)] p-2">
          <Icon className="h-5 w-5 text-[var(--text-secondary)]" />
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
