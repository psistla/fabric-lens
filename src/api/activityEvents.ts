import type { FabricClient } from './fabricClient';
import type { ActivityEventsResponse } from './types/activityEvents';
import { POWERBI_SCOPES, POWERBI_ADMIN_API_BASE } from '@/utils/constants';
import { adminRateLimiter } from '@/utils/rateLimiter';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ActivityScanOptions {
  /** Called after each UTC day of the window is fully consumed. */
  onProgress?: (completed: number, total: number) => void;
}

/**
 * Creates the activity events API bound to the given FabricClient instance.
 */
export function createActivityEventsApi(client: FabricClient) {
  return {
    /**
     * Fetches the most recent activity date per workspace across the last `lookbackDays`.
     *
     * Walks the window backwards, newest day first, folding each page into the result map and
     * discarding the raw events. At the 28-day platform maximum a busy tenant returns far more
     * events than are worth holding in a browser, and only the latest date per workspace is ever
     * read, so nothing is lost by reducing on arrival.
     *
     * @param lookbackDays - Width of the window in days. The Power BI API rejects anything
     *   beyond 28, and requires start/end to fall within the same UTC day, so this issues one
     *   request per day plus one per continuation page.
     * @returns `workspaceId` → most recent event date within the window.
     */
    async fetchLatestActivityByWorkspace(
      lookbackDays: number,
      options: ActivityScanOptions = {},
    ): Promise<Map<string, Date>> {
      const latest = new Map<string, Date>();
      const now = Date.now();

      // ponytail: no early termination once every workspace has been seen. It only pays off in a
      // tenant with zero ghosts, and it needs the workspace id set threaded in to count against.
      // Add it if scan latency becomes the complaint.
      for (let dayOffset = 0; dayOffset < lookbackDays; dayOffset++) {
        const day = new Date(now - dayOffset * DAY_MS);
        const dayStart = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0, 0));
        const dayEnd = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 23, 59, 59, 999));

        // Today's window cannot extend into the future.
        const effectiveEnd = dayEnd.getTime() > now ? new Date(now) : dayEnd;

        let url: string | undefined =
          `${POWERBI_ADMIN_API_BASE}/admin/activityevents?startDateTime='${dayStart.toISOString()}'&endDateTime='${effectiveEnd.toISOString()}'`;

        do {
          // Counted before the await: the request consumes budget whether or not it succeeds, and
          // a failure that went untracked would let a broken scan retry against a budget that
          // still looked full.
          // ponytail: one count per get(), not per HTTP attempt. The client's own 429 backoff can
          // retry underneath this, so the count is a floor. Still far closer than the single
          // count per whole scan it replaces.
          adminRateLimiter.trackRequest();
          const res: ActivityEventsResponse = await client.get<ActivityEventsResponse>(url, POWERBI_SCOPES);

          for (const event of res.activityEventEntities ?? []) {
            const eventDate = new Date(event.creationTime);
            if (Number.isNaN(eventDate.getTime())) continue;
            const existing = latest.get(event.workspaceId);
            if (!existing || eventDate > existing) {
              latest.set(event.workspaceId, eventDate);
            }
          }

          url = res.continuationUri;
        } while (url);

        options.onProgress?.(dayOffset + 1, lookbackDays);
      }

      return latest;
    },
  };
}
