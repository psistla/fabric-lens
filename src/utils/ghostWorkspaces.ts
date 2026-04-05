import type { ActivityEvent } from '@/api/types/activityEvents';
import type { Workspace } from '@/api/types/workspace';

/**
 * A workspace that has had no activity (or insufficient recent activity)
 * within the configured lookback window.
 *
 * Note: `healthGrade` is intentionally omitted here. The store that calls
 * `deriveGhostWorkspaces` is responsible for joining with health score data
 * and annotating each entry with a grade before passing to the UI.
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
 * Derives the list of ghost workspaces from a set of activity events and workspaces.
 *
 * A workspace is considered a ghost if it has had no activity in at least `thresholdDays`
 * days. Workspaces with no events at all in the lookback window are treated as having
 * `daysInactive = lookbackDays`.
 *
 * @param events     - All activity events fetched for the lookback window.
 * @param workspaces - All tenant workspaces to check.
 * @param thresholdDays - Minimum days of inactivity to qualify as a ghost.
 * @param lookbackDays  - Width of the activity window that was fetched; used as the
 *                        `daysInactive` value when no events are found for a workspace.
 * @returns Ghost workspaces sorted by `daysInactive` descending (most inactive first).
 */
export function deriveGhostWorkspaces(
  events: ActivityEvent[],
  workspaces: Workspace[],
  thresholdDays: number,
  lookbackDays: number,
): GhostWorkspace[] {
  const now = new Date();

  // Build workspaceId → most recent event date
  const lastActivityMap = new Map<string, Date>();
  for (const event of events) {
    const eventDate = new Date(event.creationTime);
    const existing = lastActivityMap.get(event.workspaceId);
    if (!existing || eventDate > existing) {
      lastActivityMap.set(event.workspaceId, eventDate);
    }
  }

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
