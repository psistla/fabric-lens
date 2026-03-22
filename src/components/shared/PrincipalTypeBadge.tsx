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
    className: 'bg-[var(--m-surface)] text-[var(--m-text-secondary)]',
  },
  Group: {
    label: 'Group',
    icon: Users,
    className: 'bg-[var(--item-lakehouse-bg)] text-[var(--item-lakehouse)]',
  },
  ServicePrincipal: {
    label: 'SPN',
    icon: KeyRound,
    className: 'bg-[var(--item-notebook-bg)] text-[var(--item-notebook)]',
  },
  ServicePrincipalProfile: {
    label: 'SPN',
    icon: KeyRound,
    className: 'bg-[var(--item-notebook-bg)] text-[var(--item-notebook)]',
  },
};

interface Props {
  type: PrincipalType;
}

export function PrincipalTypeBadge({ type }: Props) {
  const { label, icon: Icon, className } = CONFIG[type];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${className}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
