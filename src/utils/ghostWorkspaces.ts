import type { ActivityEvent } from '@/api/types/activityEvents';
import type { Workspace } from '@/api/types/workspace';

/**
 * A workspace that has had no activity (or insufficient recent activity)
 * within the configured lookback window.
 *
 * Note: `healthGrade` is intentionally omitted here, and is NOT annotated by the store
 * either. Items load independently of activity events, so a grade frozen at activity-fetch
 * time would be computed against whatever items happened to have arrived. The grade is
 * derived at render from the live items map instead, so it corrects itself when items land.
 */
export interface GhostWorkspace {
  workspaceId: string;
  workspaceName: string;
  /** The most recent activity date found in the lookback window, or null if no events were found. */
  lastActivityDate: Date | null;
  /**
   * Days since `lastActivityDate`. When no activity was found (`lastActivityDate` is null),
   * this is set to `lookbackDays` — meaning we only know the workspace was inactive for
   * at least that many days, not how long it has truly been inactive.
   */
  daysInactive: number;
}

/**
 * Reduces raw activity events to `workspaceId` → most recent event date.
 *
 * The live fetcher folds pages into this shape as they arrive rather than accumulating
 * every event, so this is only used for event arrays that are already in memory (demo
 * mode and tests). Events with an unparseable `creationTime` are skipped: `new Date(bad)`
 * yields `NaN`, and every comparison against `NaN` is false, which would otherwise drop
 * the workspace out of the result entirely.
 */
export function latestActivityByWorkspace(events: ActivityEvent[]): Map<string, Date> {
  const lastActivityMap = new Map<string, Date>();
  for (const event of events) {
    const eventDate = new Date(event.creationTime);
    if (Number.isNaN(eventDate.getTime())) continue;
    const existing = lastActivityMap.get(event.workspaceId);
    if (!existing || eventDate > existing) {
      lastActivityMap.set(event.workspaceId, eventDate);
    }
  }
  return lastActivityMap;
}

/**
 * Derives the list of ghost workspaces from the latest-activity map and the workspace list.
 *
 * A workspace is considered a ghost if it has had no activity in at least `thresholdDays`
 * days. Workspaces with no events at all in the lookback window are treated as having
 * `daysInactive = lookbackDays`.
 *
 * @param lastActivityMap - `workspaceId` → most recent event date, from `latestActivityByWorkspace`
 *                          or folded during the fetch.
 * @param workspaces - All tenant workspaces to check.
 * @param thresholdDays - Minimum days of inactivity to qualify as a ghost.
 * @param lookbackDays  - Width of the activity window that was fetched; used as the
 *                        `daysInactive` value when no events are found for a workspace.
 * @returns Ghost workspaces sorted by `daysInactive` descending (most inactive first).
 */
export function deriveGhostWorkspaces(
  lastActivityMap: Map<string, Date>,
  workspaces: Workspace[],
  thresholdDays: number,
  lookbackDays: number,
): GhostWorkspace[] {
  const now = new Date();

  const ghosts: GhostWorkspace[] = [];

  for (const workspace of workspaces) {
    const lastActivityDate = lastActivityMap.get(workspace.id) ?? null;

    const daysInactive = lastActivityDate === null
      ? lookbackDays
      : Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysInactive >= thresholdDays) {
      ghosts.push({
        workspaceId: workspace.id,
        workspaceName: workspace.displayName,
        lastActivityDate,
        daysInactive,
      });
    }
  }

  return ghosts.sort((a, b) => b.daysInactive - a.daysInactive);
}
