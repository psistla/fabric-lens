import type { LucideIcon } from 'lucide-react';

interface Action {
  label: string;
  onClick: () => void;
}

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: Action;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="rounded-full bg-[var(--surface-secondary)] p-3">
        <Icon className="h-6 w-6 text-[var(--text-tertiary)]" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-[var(--text-primary)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-md bg-[var(--brand-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
