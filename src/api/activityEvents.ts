import type { FabricClient } from './fabricClient';
import type { ActivityEvent, ActivityEventsResponse } from './types/activityEvents';
import { POWERBI_SCOPES, POWERBI_ADMIN_API_BASE } from '@/utils/constants';

export function createActivityEventsApi(client: FabricClient) {
  return {
    async fetchActivityEvents(startDateTime: string, endDateTime: string): Promise<ActivityEvent[]> {
      const results: ActivityEvent[] = [];
      const initialUrl = `${POWERBI_ADMIN_API_BASE}/admin/activityevents?startDateTime='${startDateTime}'&endDateTime='${endDateTime}'`;
      let url: string | undefined = initialUrl;
      do {
        const res = await client.get<ActivityEventsResponse>(url, POWERBI_SCOPES);
        results.push(...res.activityEventEntities);
        url = res.continuationUri;
      } while (url);
      return results;
    },
  };
}
