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
      <div className="rounded-full bg-[var(--m-surface)] p-3">
        <Icon className="h-6 w-6 text-[var(--m-text-tertiary)]" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-[var(--m-text)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-[var(--m-text-secondary)]">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-[var(--m-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--m-primary-hover)]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
