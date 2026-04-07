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

      // The Power BI Activity Events API requires startDateTime and endDateTime
      // to fall within the same UTC day. Loop day-by-day over the range.
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);
      const current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));

      while (current < end) {
        const dayStart = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate(), 0, 0, 0, 0));
        const dayEnd = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate(), 23, 59, 59, 999));

        // Clamp the last day to the requested end time
        const effectiveEnd = dayEnd > end ? end : dayEnd;

        const initialUrl = `${POWERBI_ADMIN_API_BASE}/admin/activityevents?startDateTime='${dayStart.toISOString()}'&endDateTime='${effectiveEnd.toISOString()}'`;
        let url: string | undefined = initialUrl;
        do {
          const res: ActivityEventsResponse = await client.get<ActivityEventsResponse>(url, POWERBI_SCOPES);
          if (res.activityEventEntities) {
            results.push(...res.activityEventEntities);
          }
          url = res.continuationUri;
        } while (url);

        // Advance to next UTC day
        current.setUTCDate(current.getUTCDate() + 1);
      }

      return results;
    },
  };
}
