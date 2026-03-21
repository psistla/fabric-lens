import { Users, ShieldAlert, UsersRound, Bot, Info } from 'lucide-react';
import type { EffectiveAccessSummary } from '@/api/types/admin';

interface Props {
  summary: EffectiveAccessSummary;
}

export function EffectiveAccessCard({ summary }: Props) {
  const hasDuplicates = summary.duplicates > 0;
  const hasAdminGroups = summary.groupsWithAdminRole.length > 0;

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--m-text)]">
          Effective Access
        </h2>
        {hasAdminGroups && (
          <div className="flex items-center gap-1.5 rounded-full bg-[var(--m-warning-bg)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-warning-text)]">
            <ShieldAlert className="h-3 w-3" />
            {summary.groupsWithAdminRole.length} group{summary.groupsWithAdminRole.length > 1 ? 's' : ''} with Admin role
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5 text-sm text-[var(--m-text-secondary)]">
          <Users className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          <span className="font-semibold text-[var(--m-text)]">{summary.directUsers}</span>
          {' direct user'}{summary.directUsers !== 1 ? 's' : ''}
        </div>

        <span className="text-[var(--m-text-tertiary)]">&middot;</span>

        <div className="flex items-center gap-1.5 text-sm text-[var(--m-text-secondary)]">
          <UsersRound className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          <span className="font-semibold text-[var(--m-text)]">{summary.groups}</span>
          {' group'}{summary.groups !== 1 ? 's' : ''}
          {summary.transitiveUsers > 0 && (
            <span className="text-[var(--m-text-tertiary)]">
              ({summary.transitiveUsers} transitive user{summary.transitiveUsers !== 1 ? 's' : ''})
            </span>
          )}
        </div>

        <span className="text-[var(--m-text-tertiary)]">&middot;</span>

        <div className="flex items-center gap-1.5 text-sm text-[var(--m-text-secondary)]">
          <Bot className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          <span className="font-semibold text-[var(--m-text)]">{summary.servicePrincipals}</span>
          {' service principal'}{summary.servicePrincipals !== 1 ? 's' : ''}
        </div>

        <span className="text-lg text-[var(--m-text-tertiary)]">=</span>

        <div className="text-sm font-semibold text-[var(--m-text)]">
          {summary.uniqueUsers} effective unique user{summary.uniqueUsers !== 1 ? 's' : ''}
        </div>
      </div>

      {hasDuplicates && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--m-text-tertiary)]">
          <Info className="h-3 w-3 shrink-0" />
          {summary.duplicates} duplicate{summary.duplicates !== 1 ? 's' : ''} removed — users appearing in multiple groups
        </div>
      )}
    </div>
  );
}
