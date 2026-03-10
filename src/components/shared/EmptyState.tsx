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
      <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
        <Icon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
