import { User, Users, KeyRound } from 'lucide-react';
import type { PrincipalType } from '@/api/types/roleAssignment';

interface BadgeConfig {
  label: string;
  icon: typeof User;
  className: string;
}

const CONFIG: Record<PrincipalType, BadgeConfig> = {
  User: {
    label: 'User',
    icon: User,
    className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  },
  Group: {
    label: 'Group',
    icon: Users,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  },
  ServicePrincipal: {
    label: 'SPN',
    icon: KeyRound,
    className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  },
  ServicePrincipalProfile: {
    label: 'SPN',
    icon: KeyRound,
    className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  },
};

interface Props {
  type: PrincipalType;
}

export function PrincipalTypeBadge({ type }: Props) {
  const { label, icon: Icon, className } = CONFIG[type];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${className}`}
      style={{ borderRadius: 'var(--radius-sm, 4px)' }}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
