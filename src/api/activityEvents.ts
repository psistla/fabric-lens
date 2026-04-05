import type { FabricClient } from './fabricClient';
import type { ActivityEvent, ActivityEventsResponse } from './types/activityEvents';
import { POWERBI_SCOPES, POWERBI_ADMIN_API_BASE } from '@/utils/constants';

/**
 * Creates the activity events API bound to the given FabricClient instance.
 */
export function createActivityEventsApi(client: FabricClient) {
  return {
    /**
     * Fetches all activity events for the given time window from the Power BI Admin API.
     *
     * @param startDateTime - ISO 8601 string **without** surrounding quotes,
     *   e.g. `2024-01-01T00:00:00.000Z`. The function adds the required
     *   single-quote wrapping per the Power BI OData API convention.
     * @param endDateTime - ISO 8601 string in the same format as `startDateTime`.
     */
    async fetchActivityEvents(startDateTime: string, endDateTime: string): Promise<ActivityEvent[]> {
      const results: ActivityEvent[] = [];
      const initialUrl = `${POWERBI_ADMIN_API_BASE}/admin/activityevents?startDateTime='${startDateTime}'&endDateTime='${endDateTime}'`;
      let url: string | undefined = initialUrl;
      do {
        const res: ActivityEventsResponse = await client.get<ActivityEventsResponse>(url, POWERBI_SCOPES);
        results.push(...res.activityEventEntities);
        url = res.continuationUri;
      } while (url);
      return results;
    },
  };
}
