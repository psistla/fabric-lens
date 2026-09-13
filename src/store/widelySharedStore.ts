import { getMockWidelySharedArtifacts } from '@/api/demo';
import { fabricClient } from '@/api/fabricClientInstance';
import { createWidelySharedApi } from '@/api/widelyShared';
import { createAdminListStore } from './adminListStore';

export const useWidelySharedStore = createAdminListStore(
  createWidelySharedApi(fabricClient).fetchWidelySharedArtifacts,
  getMockWidelySharedArtifacts,
  'Failed to fetch widely shared artifacts',
);
