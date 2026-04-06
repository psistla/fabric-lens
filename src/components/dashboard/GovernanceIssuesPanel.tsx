import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertTriangle, ChevronRight, CheckCircle } from 'lucide-react';
import type { AggregatedIssue } from '@/utils/governanceIssues';
import type { Workspace } from '@/api/types/workspace';

interface Props {
  issues: AggregatedIssue[];
  workspaces: Workspace[];
}

interface SectionProps {
  title: string;
  issues: AggregatedIssue[];
  severity: 'critical' | 'improvement';
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  workspaceMap: Map<string, string>;
  onWorkspaceClick: (id: string) => void;
}

function IssueRow({
  issue,
  expanded,
  onToggle,
  workspaceMap,
  onWorkspaceClick,
  severity,
}: {
  issue: AggregatedIssue;
  expanded: boolean;
  onToggle: () => void;
  workspaceMap: Map<string, string>;
  onWorkspaceClick: (id: string) => void;
  severity: 'critical' | 'improvement';
}) {
  const iconColor =
    severity === 'critical' ? 'text-[var(--m-error)]' : 'text-[var(--m-warning)]';

  return (
    <div className="border-b border-[var(--m-border)] last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--m-surface-hover)]"
      >
        <AlertTriangle className={`h-4 w-4 shrink-0 ${iconColor}`} />

        <span className="min-w-0 flex-1 text-sm text-[var(--m-text)]">
          {issue.fixLabel}
        </span>

        <span className="shrink-0 font-mono text-xs text-[var(--m-text-secondary)]">
          {issue.affectedCount} ws
        </span>

        <span className="shrink-0 rounded-full bg-[var(--m-primary)]/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--m-primary)]">
          +{issue.recoverablePoints} pts
        </span>

        <ChevronRight
          className={`h-4 w-4 shrink-0 text-[var(--m-text-tertiary)] transition-transform duration-200 ${
            expanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {expanded && (
        <div className="flex flex-wrap gap-1.5 px-11 pb-3">
          {issue.affectedWorkspaceIds.map((wsId) => {
            const name = workspaceMap.get(wsId) ?? wsId;
            return (
              <button
                key={wsId}
                onClick={() => onWorkspaceClick(wsId)}
                className="rounded-full border border-[var(--m-border)] bg-[var(--m-surface)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--m-text-secondary)] transition-colors hover:border-[var(--m-primary)] hover:text-[var(--m-primary)]"
              >
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IssueSection({
  title,
  issues,
  severity,
  expandedIds,
  onToggle,
  workspaceMap,
  onWorkspaceClick,
}: SectionProps) {
  if (issues.length === 0) return null;

  const headerColor =
    severity === 'critical'
      ? 'bg-[var(--m-error-bg)] text-[var(--m-error-text)]'
      : 'bg-[var(--m-warning-bg)] text-[var(--m-warning-text)]';

  return (
    <div>
      <div className={`px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${headerColor}`}>
        {title}
      </div>
      {issues.map((issue) => (
        <IssueRow
          key={issue.checkId}
          issue={issue}
          expanded={expandedIds.has(issue.checkId)}
          onToggle={() => onToggle(issue.checkId)}
          workspaceMap={workspaceMap}
          onWorkspaceClick={onWorkspaceClick}
          severity={severity}
        />
      ))}
    </div>
  );
}

export function GovernanceIssuesPanel({ issues, workspaces }: Props) {
  const navigate = useNavigate();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const workspaceMap = new Map(workspaces.map((ws) => [ws.id, ws.displayName]));

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const critical = issues.filter((i) => i.severity === 'critical');
  const improvement = issues.filter((i) => i.severity === 'improvement');

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--m-border)] px-4 py-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
          Top Governance Issues
        </h2>
        {issues.length > 0 && (
          <span className="rounded-full bg-[var(--m-surface)] px-2 py-0.5 text-[11px] font-semibold text-[var(--m-text-secondary)]">
            {issues.length} issue type{issues.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Empty state */}
      {issues.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <CheckCircle className="h-8 w-8 text-[var(--m-success)]" />
          <p className="text-sm font-medium text-[var(--m-text)]">
            All governance checks passing across {workspaces.length} workspace
            {workspaces.length !== 1 ? 's' : ''}.
          </p>
        </div>
      ) : (
        <div>
          <IssueSection
            title="Critical"
            issues={critical}
            severity="critical"
            expandedIds={expandedIds}
            onToggle={toggle}
            workspaceMap={workspaceMap}
            onWorkspaceClick={(id) => void navigate(`/workspaces/${id}`)}
          />
          <IssueSection
            title="Improvement"
            issues={improvement}
            severity="improvement"
            expandedIds={expandedIds}
            onToggle={toggle}
            workspaceMap={workspaceMap}
            onWorkspaceClick={(id) => void navigate(`/workspaces/${id}`)}
          />
        </div>
      )}
    </div>
  );
}
