import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { deriveGhostWorkspaces, latestActivityByWorkspace } from './ghostWorkspaces';
import type { ActivityEvent } from '@/api/types/activityEvents';
import type { Workspace } from '@/api/types/workspace';
import { GHOST_WORKSPACE_THRESHOLD_DAYS, ACTIVITY_LOG_LOOKBACK_DAYS } from '@/utils/constants';

// Fixed "now" so daysInactive calculations are deterministic
const NOW = new Date('2026-04-05T12:00:00.000Z');

const DAY_MS = 24 * 60 * 60 * 1000;

// Day offsets expressed against the threshold rather than hardcoded, so retuning the constants
// cannot silently invert what a test is asserting.
const ACTIVE_DAYS = GHOST_WORKSPACE_THRESHOLD_DAYS - 2;
const GHOST_DAYS = GHOST_WORKSPACE_THRESHOLD_DAYS + 2;
const OLDER_GHOST_DAYS = GHOST_WORKSPACE_THRESHOLD_DAYS + 6;

function daysAgo(n: number): string {
  return new Date(NOW.getTime() - n * DAY_MS).toISOString();
}

function makeWorkspace(id: string, displayName: string): Workspace {
  return {
    id,
    displayName,
    description: '',
    type: 'Workspace',
    state: 'Active',
  };
}

function makeEvent(workspaceId: string, creationTime: string): ActivityEvent {
  return {
    id: `evt-${workspaceId}-${creationTime}`,
    creationTime,
    activity: 'ViewReport',
    workspaceId,
    workspaceName: `WS ${workspaceId}`,
    userId: 'user-1',
  };
}

/** The two always run together in production; compose them so tests read as one pipeline. */
function ghostsFrom(
  events: ActivityEvent[],
  workspaces: Workspace[],
  thresholdDays = GHOST_WORKSPACE_THRESHOLD_DAYS,
  lookbackDays = ACTIVITY_LOG_LOOKBACK_DAYS,
) {
  return deriveGhostWorkspaces(latestActivityByWorkspace(events), workspaces, thresholdDays, lookbackDays);
}

describe('latestActivityByWorkspace', () => {
  it('returns an empty map for no events', () => {
    expect(latestActivityByWorkspace([]).size).toBe(0);
  });

  it('keeps the most recent event per workspace regardless of input order', () => {
    const map = latestActivityByWorkspace([
      makeEvent('ws-1', daysAgo(10)),
      makeEvent('ws-1', daysAgo(2)),
      makeEvent('ws-1', daysAgo(6)),
      makeEvent('ws-2', daysAgo(4)),
    ]);
    expect(map.size).toBe(2);
    expect(map.get('ws-1')).toEqual(new Date(daysAgo(2)));
    expect(map.get('ws-2')).toEqual(new Date(daysAgo(4)));
  });

  it('skips malformed timestamps instead of dropping the workspace', () => {
    // NaN fails every comparison, so an unguarded max would leave ws-1 out of the map entirely
    // and the workspace would silently vanish from the results.
    const map = latestActivityByWorkspace([
      makeEvent('ws-1', 'not-a-date'),
      makeEvent('ws-1', daysAgo(3)),
    ]);
    expect(map.get('ws-1')).toEqual(new Date(daysAgo(3)));
  });

  it('omits a workspace whose only event is malformed', () => {
    const map = latestActivityByWorkspace([makeEvent('ws-1', 'not-a-date')]);
    expect(map.has('ws-1')).toBe(false);
  });
});

describe('deriveGhostWorkspaces', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty array when both events and workspaces are empty', () => {
    expect(ghostsFrom([], [])).toEqual([]);
  });

  it('returns empty array when all workspaces have recent activity (within threshold)', () => {
    const workspaces = [makeWorkspace('ws-1', 'Active WS 1')];
    const events = [makeEvent('ws-1', daysAgo(ACTIVE_DAYS))];
    expect(ghostsFrom(events, workspaces)).toEqual([]);
  });

  it('includes workspace with no events, setting daysInactive = lookbackDays and lastActivityDate = null', () => {
    const workspaces = [makeWorkspace('ws-2', 'Silent WS')];
    // Lookback (28) exceeds the threshold (14), so absence of any event is itself enough evidence.
    const result = ghostsFrom([], workspaces);
    expect(result).toHaveLength(1);
    expect(result[0].workspaceId).toBe('ws-2');
    expect(result[0].lastActivityDate).toBeNull();
    expect(result[0].daysInactive).toBe(ACTIVITY_LOG_LOOKBACK_DAYS);
  });

  it('excludes workspace with no events when lookbackDays < thresholdDays', () => {
    const workspaces = [makeWorkspace('ws-2', 'Silent WS')];
    // A window narrower than the threshold cannot prove inactivity, so nothing is claimed.
    const result = ghostsFrom([], workspaces, GHOST_WORKSPACE_THRESHOLD_DAYS, GHOST_WORKSPACE_THRESHOLD_DAYS - 1);
    expect(result).toEqual([]);
  });

  it('includes workspace whose last activity is older than the threshold', () => {
    const workspaces = [makeWorkspace('ws-3', 'Old WS')];
    const events = [makeEvent('ws-3', daysAgo(GHOST_DAYS))];
    const result = ghostsFrom(events, workspaces);
    expect(result).toHaveLength(1);
    expect(result[0].workspaceId).toBe('ws-3');
    expect(result[0].daysInactive).toBe(GHOST_DAYS);
    expect(result[0].lastActivityDate).toEqual(new Date(daysAgo(GHOST_DAYS)));
  });

  it('treats a workspace at exactly the threshold as inactive', () => {
    const workspaces = [makeWorkspace('ws-edge', 'Edge WS')];
    const events = [makeEvent('ws-edge', daysAgo(GHOST_WORKSPACE_THRESHOLD_DAYS))];
    const result = ghostsFrom(events, workspaces);
    expect(result).toHaveLength(1);
    expect(result[0].daysInactive).toBe(GHOST_WORKSPACE_THRESHOLD_DAYS);
  });

  it('returns only inactive workspaces from a mix of active and inactive, sorted by daysInactive desc', () => {
    const workspaces = [
      makeWorkspace('ws-active', 'Active WS'),
      makeWorkspace('ws-inactive', 'Inactive'),
      makeWorkspace('ws-most-inactive', 'Most inactive'),
    ];
    const events = [
      makeEvent('ws-active', daysAgo(ACTIVE_DAYS)),
      makeEvent('ws-inactive', daysAgo(GHOST_DAYS)),
      makeEvent('ws-most-inactive', daysAgo(OLDER_GHOST_DAYS)),
    ];

    const result = ghostsFrom(events, workspaces);
    expect(result).toHaveLength(2);
    // Most inactive first
    expect(result[0].workspaceId).toBe('ws-most-inactive');
    expect(result[0].daysInactive).toBe(OLDER_GHOST_DAYS);
    expect(result[1].workspaceId).toBe('ws-inactive');
    expect(result[1].daysInactive).toBe(GHOST_DAYS);
  });

  it('uses the most recent event when multiple events exist for the same workspace', () => {
    const workspaces = [makeWorkspace('ws-multi', 'Multi-event WS')];
    const events = [
      makeEvent('ws-multi', daysAgo(OLDER_GHOST_DAYS)),
      makeEvent('ws-multi', daysAgo(ACTIVE_DAYS)),
      makeEvent('ws-multi', daysAgo(GHOST_DAYS)),
    ];

    // Most recent is within the threshold, so the workspace is active despite the older events.
    expect(ghostsFrom(events, workspaces)).toEqual([]);
  });

  it('uses the most recent event correctly when workspace qualifies as inactive', () => {
    const workspaces = [makeWorkspace('ws-multi2', 'Multi-event Inactive')];
    const events = [
      makeEvent('ws-multi2', daysAgo(OLDER_GHOST_DAYS)),
      makeEvent('ws-multi2', daysAgo(GHOST_DAYS)),
    ];

    const result = ghostsFrom(events, workspaces);
    expect(result).toHaveLength(1);
    expect(result[0].daysInactive).toBe(GHOST_DAYS);
    expect(result[0].lastActivityDate).toEqual(new Date(daysAgo(GHOST_DAYS)));
  });

  it('ignores activity for workspaces that are not in the tenant list', () => {
    const workspaces = [makeWorkspace('ws-1', 'Only WS')];
    const events = [makeEvent('ws-deleted', daysAgo(1)), makeEvent('ws-1', daysAgo(GHOST_DAYS))];
    const result = ghostsFrom(events, workspaces);
    expect(result).toHaveLength(1);
    expect(result[0].workspaceId).toBe('ws-1');
  });
});
