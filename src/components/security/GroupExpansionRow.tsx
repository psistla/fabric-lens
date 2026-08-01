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
      className="inline-flex min-h-6 items-center gap-1 rounded-lg px-1.5 text-xs text-[var(--m-text-secondary)] transition-colors hover:bg-[var(--m-surface-hover)]"
    >
      <ChevronRight
        className="h-3 w-3 transition-transform"
        style={{
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transitionDuration: '200ms',
          transitionTimingFunction: 'ease-out',
        }}
      />
      <span className="rounded-full bg-[var(--m-surface)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--m-text-secondary)]">
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
            <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-surface)]">
              {/* Loading state */}
              {group.loading && (
                <div className="space-y-0 divide-y divide-[var(--m-border)]">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2">
                      <div className="m-skeleton h-3 w-28" />
                      <div className="m-skeleton h-3 w-40" />
                      <div className="m-skeleton h-3 w-24" />
                    </div>
                  ))}
                </div>
              )}

              {/* Consent required error */}
              {!group.loading && group.error === 'consent_required' && (
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2 text-xs text-[var(--m-warning-text)]">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                    Grant Microsoft Graph permissions to view group members
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetry();
                    }}
                    className="shrink-0 rounded-lg bg-[var(--m-warning-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--m-warning-text)] transition-colors hover:opacity-80"
                  >
                    Grant Access
                  </button>
                </div>
              )}

              {/* Other errors */}
              {!group.loading && group.error && group.error !== 'consent_required' && (
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2 text-xs text-[var(--m-error-text)]">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Failed to load group members
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetry();
                    }}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[var(--m-error-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--m-error-text)] transition-colors hover:opacity-80"
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
                      <tr className="border-b border-[var(--m-border)]">
                        <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-tertiary)]">
                          Name
                        </th>
                        <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-tertiary)]">
                          UPN
                        </th>
                        <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-tertiary)]">
                          Job Title
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--m-border)]">
                      {visibleMembers.map((m) => (
                        <tr key={m.userPrincipalName}>
                          <td className="whitespace-nowrap px-3 py-1.5 font-medium text-[var(--m-text)]">
                            {m.displayName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-1.5 text-[var(--m-text-secondary)]">
                            {m.userPrincipalName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-1.5 text-[var(--m-text-tertiary)]">
                            {m.jobTitle ?? '\u2014'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {hasMore && !showAll && (
                    <div className="border-t border-[var(--m-border)] px-3 py-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAll(true);
                        }}
                        className="-my-1 py-1 text-xs font-semibold text-[var(--m-primary)] transition-colors hover:text-[var(--m-primary-hover)]"
                      >
                        Show all {group.members.length} members
                      </button>
                    </div>
                  )}
                  {showAll && hasMore && (
                    <div className="border-t border-[var(--m-border)] px-3 py-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAll(false);
                        }}
                        className="-my-1 py-1 text-xs font-semibold text-[var(--m-text-secondary)] transition-colors hover:text-[var(--m-text)]"
                      >
                        Show fewer
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* No members */}
              {!group.loading && !group.error && group.members.length === 0 && (
                <div className="px-3 py-3 text-center text-xs text-[var(--m-text-tertiary)]">
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
