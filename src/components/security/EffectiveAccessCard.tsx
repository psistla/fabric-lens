import { Users, ShieldAlert, UsersRound, Bot, Info } from 'lucide-react';
import type { EffectiveAccessSummary } from '@/api/types/admin';

interface Props {
  summary: EffectiveAccessSummary;
}

export function EffectiveAccessCard({ summary }: Props) {
  const hasDuplicates = summary.duplicates > 0;
  const hasAdminGroups = summary.groupsWithAdminRole.length > 0;

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--text-primary)]">
          Effective Access
        </h2>
        {hasAdminGroups && (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
            <ShieldAlert className="h-3 w-3" />
            {summary.groupsWithAdminRole.length} group{summary.groupsWithAdminRole.length > 1 ? 's' : ''} with Admin role
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
          <Users className="h-4 w-4 text-[var(--text-tertiary)]" />
          <span className="font-semibold text-[var(--text-primary)]">{summary.directUsers}</span>
          {' direct user'}{summary.directUsers !== 1 ? 's' : ''}
        </div>

        <span className="text-[var(--text-tertiary)]">&middot;</span>

        <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
          <UsersRound className="h-4 w-4 text-[var(--text-tertiary)]" />
          <span className="font-semibold text-[var(--text-primary)]">{summary.groups}</span>
          {' group'}{summary.groups !== 1 ? 's' : ''}
          {summary.transitiveUsers > 0 && (
            <span className="text-[var(--text-tertiary)]">
              ({summary.transitiveUsers} transitive user{summary.transitiveUsers !== 1 ? 's' : ''})
            </span>
          )}
        </div>

        <span className="text-[var(--text-tertiary)]">&middot;</span>

        <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
          <Bot className="h-4 w-4 text-[var(--text-tertiary)]" />
          <span className="font-semibold text-[var(--text-primary)]">{summary.servicePrincipals}</span>
          {' service principal'}{summary.servicePrincipals !== 1 ? 's' : ''}
        </div>

        <span className="text-lg text-[var(--text-tertiary)]">=</span>

        <div className="text-sm font-semibold text-[var(--text-primary)]">
          {summary.uniqueUsers} effective unique user{summary.uniqueUsers !== 1 ? 's' : ''}
        </div>
      </div>

      {hasDuplicates && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
          <Info className="h-3 w-3 shrink-0" />
          {summary.duplicates} duplicate{summary.duplicates !== 1 ? 's' : ''} removed — users appearing in multiple groups
        </div>
      )}
    </div>
  );
}
