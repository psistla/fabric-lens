import { useNavigate } from 'react-router';
import { AlertTriangle, CheckCircle2, Server, FileText, GitBranch, User } from 'lucide-react';

interface Issue {
  icon: typeof AlertTriangle;
  label: string;
  count: number;
  filter: string;
}

interface Props {
  noCapacity: number;
  noDescription: number;
  noGitIntegration: number;
  personalWorkspaces: number;
}

export function GovernanceIssues({
  noCapacity,
  noDescription,
  noGitIntegration,
  personalWorkspaces,
}: Props) {
  const navigate = useNavigate();

  const issues: Issue[] = [
    {
      icon: Server,
      label: 'workspaces without capacity assignment',
      count: noCapacity,
      filter: 'no-capacity',
    },
    {
      icon: FileText,
      label: 'workspaces without description',
      count: noDescription,
      filter: 'no-description',
    },
    {
      icon: GitBranch,
      label: 'workspaces without Git integration',
      count: noGitIntegration,
      filter: 'no-git',
    },
    {
      icon: User,
      label: 'personal workspaces',
      count: personalWorkspaces,
      filter: 'personal',
    },
  ];

  const activeIssues = issues.filter((i) => i.count > 0);

  if (activeIssues.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[var(--m-success)] bg-[var(--m-success-bg)] px-4 py-3 text-sm text-[var(--m-success-text)]">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        No governance issues detected.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
      <h2 className="border-b border-[var(--m-border)] px-4 py-3 text-sm font-medium text-[var(--m-text)]">
        Governance Issues
      </h2>
      <ul className="divide-y divide-[var(--m-border)]">
        {activeIssues.map((issue) => (
          <li key={issue.filter}>
            <button
              onClick={() =>
                void navigate(`/workspaces?filter=${issue.filter}`)
              }
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface-tertiary)]"
            >
              <issue.icon className="h-4 w-4 shrink-0 text-[var(--m-warning)]" />
              <span className="text-sm text-[var(--m-text-secondary)]">
                <span className="font-semibold text-[var(--m-text)]">
                  {issue.count}
                </span>{' '}
                {issue.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
