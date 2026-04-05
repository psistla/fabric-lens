/** A single activity event record from the Power BI activity log API. */
export interface ActivityEvent {
  id: string;
  creationTime: string;
  activity: string;
  workspaceId: string;
  workspaceName: string;
  userId: string;
}

/** Response envelope from the Power BI activity events API.
 *  Pagination uses `continuationUri` (a full URL), not `continuationToken`. */
export interface ActivityEventsResponse {
  activityEventEntities: ActivityEvent[];
  continuationUri?: string;
  continuationToken?: string; // defensive — primary pagination uses continuationUri
}

/** Derived summary of activity for a single workspace, computed from ActivityEvent records. */
export interface WorkspaceActivity {
  workspaceId: string;
  workspaceName: string; // denormalized for display convenience
  lastActivityDate: Date;
  eventCount: number;
}
