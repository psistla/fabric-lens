import { useNavigate } from 'react-router';
import { AlertTriangle, Server, FileText, GitBranch, User } from 'lucide-react';

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
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        No governance issues detected.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 dark:border-slate-800 dark:text-slate-100">
        Governance Issues
      </h2>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {activeIssues.map((issue) => (
          <li key={issue.filter}>
            <button
              onClick={() =>
                void navigate(`/workspaces?filter=${issue.filter}`)
              }
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <issue.icon className="h-4 w-4 shrink-0 text-amber-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
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
