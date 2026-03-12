import { useState, useRef, useEffect } from 'react';
import { ChevronRight, AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';
import type { ResolvedGroup } from '@/api/types/admin';
import { GROUP_EXPAND_INITIAL_COUNT } from '@/utils/constants';

// --- Badge shown inline in the Name cell ---

interface BadgeProps {
  group: ResolvedGroup;
  expanded: boolean;
  onToggle: () => void;
}

export function GroupBadge({ group, expanded, onToggle }: BadgeProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-tertiary)]"
    >
      <ChevronRight
        className="h-3 w-3 transition-transform"
        style={{
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transitionDuration: '200ms',
          transitionTimingFunction: 'ease-out',
        }}
      />
      <span className="rounded-full bg-[var(--surface-secondary)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
        {group.memberCount !== null ? `${group.memberCount} members` : 'Group'}
      </span>
    </button>
  );
}

// --- Expanded sub-table row ---

interface Props {
  group: ResolvedGroup;
  onRetry: () => void;
}

export function GroupExpansionRow({ group, onRetry }: Props) {
  const [showAll, setShowAll] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [group.members, group.loading, group.error, showAll]);

  const visibleMembers = showAll
    ? group.members
    : group.members.slice(0, GROUP_EXPAND_INITIAL_COUNT);
  const hasMore = group.members.length > GROUP_EXPAND_INITIAL_COUNT;

  return (
    <tr>
      <td colSpan={4} className="p-0">
        <div
          style={{
            maxHeight: `${contentHeight + 16}px`,
            transition: 'max-height 200ms ease-out',
            overflow: 'hidden',
          }}
        >
          <div ref={contentRef} className="pl-10 pr-4 pb-3 pt-1">
            <div className="rounded-md border border-[var(--border-default)] bg-[var(--surface-secondary)]">
              {/* Loading state */}
              {group.loading && (
                <div className="space-y-0 divide-y divide-[var(--border-default)]">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2">
                      <div className="h-3 w-28 animate-pulse rounded bg-[var(--surface-tertiary)]" />
                      <div className="h-3 w-40 animate-pulse rounded bg-[var(--surface-tertiary)]" />
                      <div className="h-3 w-24 animate-pulse rounded bg-[var(--surface-tertiary)]" />
                    </div>
                  ))}
                </div>
              )}

              {/* Consent required error */}
              {!group.loading && group.error === 'consent_required' && (
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                    Grant Microsoft Graph permissions to view group members
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetry();
                    }}
                    className="shrink-0 rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700 transition-colors hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
                  >
                    Grant Access
                  </button>
                </div>
              )}

              {/* Other errors */}
              {!group.loading && group.error && group.error !== 'consent_required' && (
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Failed to load group members
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetry();
                    }}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md bg-red-100 px-2.5 py-1 text-[11px] font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </button>
                </div>
              )}

              {/* Members sub-table */}
              {!group.loading && !group.error && group.members.length > 0 && (
                <>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border-default)]">
                        <th className="px-3 py-1.5 text-left font-medium text-[var(--text-tertiary)]">
                          Name
                        </th>
                        <th className="px-3 py-1.5 text-left font-medium text-[var(--text-tertiary)]">
                          UPN
                        </th>
                        <th className="px-3 py-1.5 text-left font-medium text-[var(--text-tertiary)]">
                          Job Title
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-default)]">
                      {visibleMembers.map((m) => (
                        <tr key={m.userPrincipalName}>
                          <td className="whitespace-nowrap px-3 py-1.5 font-medium text-[var(--text-primary)]">
                            {m.displayName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-1.5 text-[var(--text-secondary)]">
                            {m.userPrincipalName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-1.5 text-[var(--text-tertiary)]">
                            {m.jobTitle ?? '\u2014'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {hasMore && !showAll && (
                    <div className="border-t border-[var(--border-default)] px-3 py-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAll(true);
                        }}
                        className="text-xs font-medium text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-primary-hover)]"
                      >
                        Show all {group.members.length} members
                      </button>
                    </div>
                  )}
                  {showAll && hasMore && (
                    <div className="border-t border-[var(--border-default)] px-3 py-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAll(false);
                        }}
                        className="text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                      >
                        Show fewer
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* No members */}
              {!group.loading && !group.error && group.members.length === 0 && (
                <div className="px-3 py-3 text-center text-xs text-[var(--text-tertiary)]">
                  No members found
                </div>
              )}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}
