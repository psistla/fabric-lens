import type { NetworkCommunicationPolicy } from '@/api/types/networkPolicy';
import { getMockNetworkPolicies } from '@/api/demo';
import { fabricClient } from '@/api/fabricClientInstance';
import { createAdminListStore } from './adminListStore';

export const useNetworkPolicyStore = createAdminListStore(
  () =>
    fabricClient.listAll<NetworkCommunicationPolicy>(
      '/admin/workspaces/networking/communicationpolicies',
    ),
  getMockNetworkPolicies,
  'Failed to fetch workspace network policies',
);
