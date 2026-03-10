import type { FabricClient } from './fabricClient';
import type { Capacity } from './types/capacity';

export function createCapacitiesApi(client: FabricClient) {
  return {
    async listCapacities(): Promise<Capacity[]> {
      return client.listAll<Capacity>('/capacities');
    },
  };
}
