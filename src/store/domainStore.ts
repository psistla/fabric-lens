import { create } from 'zustand';
import type { DomainStat, DomainGovernanceStats } from '@/utils/domainGovernance';
import { deriveDomainGovernanceStats } from '@/utils/domainGovernance';
import { useWorkspaceStore } from './workspaceStore';

interface DomainState extends DomainGovernanceStats {}

export const useDomainStore = create<DomainState>()(() => ({
  domainStats: [] as DomainStat[],
  unassignedCount: 0,
  totalWorkspaces: 0,
}));

// Derived store — recomputes synchronously whenever workspaces change; no API calls.
useWorkspaceStore.subscribe(({ workspaces }) => {
  useDomainStore.setState(deriveDomainGovernanceStats(workspaces));
});
