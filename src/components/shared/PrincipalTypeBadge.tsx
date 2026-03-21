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
    className: 'bg-[var(--m-surface)] text-[var(--m-text-secondary)] dark:bg-[#212529] dark:text-[#ADB5BD]',
  },
  Group: {
    label: 'Group',
    icon: Users,
    className: 'bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#312E81]/40 dark:text-[#818CF8]',
  },
  ServicePrincipal: {
    label: 'SPN',
    icon: KeyRound,
    className: 'bg-[#EDE9FE] text-[#7C3AED] dark:bg-violet-900/40 dark:text-violet-400',
  },
  ServicePrincipalProfile: {
    label: 'SPN',
    icon: KeyRound,
    className: 'bg-[#EDE9FE] text-[#7C3AED] dark:bg-violet-900/40 dark:text-violet-400',
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
