import { create } from 'zustand';
import type { DomainStat, DomainGovernanceStats } from '@/utils/domainGovernance';
import { deriveDomainGovernanceStats } from '@/utils/domainGovernance';
import { useWorkspaceStore } from './workspaceStore';

export const useDomainStore = create<DomainGovernanceStats>()(() => ({
  domainStats: [] as DomainStat[],
  unassignedCount: 0,
  totalWorkspaces: 0,
}));

// Derived store — recomputes synchronously whenever workspaces change; no API calls.
useWorkspaceStore.subscribe(({ workspaces }) => {
  useDomainStore.setState(deriveDomainGovernanceStats(workspaces));
});
