import type { Workspace } from '@/api/types/workspace';

export interface DomainStat {
  domainId: string;
  workspaceCount: number;
}

export interface DomainGovernanceStats {
  domainStats: DomainStat[];
  unassignedCount: number;
  totalWorkspaces: number;
}

export function deriveDomainGovernanceStats(workspaces: Workspace[]): DomainGovernanceStats {
  const domainMap = new Map<string, number>();
  let unassignedCount = 0;

  for (const ws of workspaces) {
    if (ws.domainId) {
      domainMap.set(ws.domainId, (domainMap.get(ws.domainId) ?? 0) + 1);
    } else {
      unassignedCount++;
    }
  }

  const domainStats = [...domainMap.entries()]
    .map(([domainId, workspaceCount]) => ({ domainId, workspaceCount }))
    .sort((a, b) => b.workspaceCount - a.workspaceCount);

  return { domainStats, unassignedCount, totalWorkspaces: workspaces.length };
}
