import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { deriveGhostWorkspaces } from './ghostWorkspaces';
import type { ActivityEvent } from '@/api/types/activityEvents';
import type { Workspace } from '@/api/types/workspace';
import { GHOST_WORKSPACE_THRESHOLD_DAYS, ACTIVITY_LOG_LOOKBACK_DAYS } from '@/utils/constants';

// Fixed "now" so daysInactive calculations are deterministic
const NOW = new Date('2026-04-05T12:00:00.000Z');

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


describe('deriveGhostWorkspaces', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty array when both events and workspaces are empty', () => {
    expect(deriveGhostWorkspaces([], [], GHOST_WORKSPACE_THRESHOLD_DAYS, ACTIVITY_LOG_LOOKBACK_DAYS)).toEqual([]);
  });

  it('returns empty array when all workspaces have recent activity (within threshold)', () => {
    // 10 days ago — well within the 90-day threshold
    const recentDate = new Date(NOW.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const workspaces = [makeWorkspace('ws-1', 'Active WS 1')];
    const events = [makeEvent('ws-1', recentDate)];
    expect(deriveGhostWorkspaces(events, workspaces, GHOST_WORKSPACE_THRESHOLD_DAYS, ACTIVITY_LOG_LOOKBACK_DAYS)).toEqual([]);
  });

  it('includes workspace with no events, setting daysInactive = lookbackDays and lastActivityDate = null', () => {
    const workspaces = [makeWorkspace('ws-2', 'Silent WS')];
    const result = deriveGhostWorkspaces([], workspaces, GHOST_WORKSPACE_THRESHOLD_DAYS, 30);
    // lookbackDays (30) < GHOST_WORKSPACE_THRESHOLD_DAYS (90), so it should NOT be included
    expect(result).toEqual([]);
  });

  it('includes workspace with no events when lookbackDays >= thresholdDays', () => {
    const workspaces = [makeWorkspace('ws-2', 'Silent WS')];
    // Use a lookback of 120 so the workspace qualifies
    const result = deriveGhostWorkspaces([], workspaces, GHOST_WORKSPACE_THRESHOLD_DAYS, 120);
    expect(result).toHaveLength(1);
    expect(result[0].workspaceId).toBe('ws-2');
    expect(result[0].lastActivityDate).toBeNull();
    expect(result[0].daysInactive).toBe(120);
  });

  it('includes workspace whose last activity is older than the threshold', () => {
    // 100 days ago
    const oldDate = new Date(NOW.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString();
    const workspaces = [makeWorkspace('ws-3', 'Old WS')];
    const events = [makeEvent('ws-3', oldDate)];
    const result = deriveGhostWorkspaces(events, workspaces, GHOST_WORKSPACE_THRESHOLD_DAYS, ACTIVITY_LOG_LOOKBACK_DAYS);
    expect(result).toHaveLength(1);
    expect(result[0].workspaceId).toBe('ws-3');
    expect(result[0].daysInactive).toBe(100);
    expect(result[0].lastActivityDate).toEqual(new Date(oldDate));
  });

  it('returns only ghost workspaces from a mix of active and inactive, sorted by daysInactive desc', () => {
    // 5 days ago — active
    const recent = new Date(NOW.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
    // 95 days ago — ghost
    const old95 = new Date(NOW.getTime() - 95 * 24 * 60 * 60 * 1000).toISOString();
    // 120 days ago — ghost
    const old120 = new Date(NOW.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString();

    const workspaces = [
      makeWorkspace('ws-active', 'Active WS'),
      makeWorkspace('ws-ghost-95', 'Ghost 95'),
      makeWorkspace('ws-ghost-120', 'Ghost 120'),
    ];
    const events = [
      makeEvent('ws-active', recent),
      makeEvent('ws-ghost-95', old95),
      makeEvent('ws-ghost-120', old120),
    ];

    const result = deriveGhostWorkspaces(events, workspaces, GHOST_WORKSPACE_THRESHOLD_DAYS, ACTIVITY_LOG_LOOKBACK_DAYS);
    expect(result).toHaveLength(2);
    // Most inactive first
    expect(result[0].workspaceId).toBe('ws-ghost-120');
    expect(result[0].daysInactive).toBe(120);
    expect(result[1].workspaceId).toBe('ws-ghost-95');
    expect(result[1].daysInactive).toBe(95);
  });

  it('uses the most recent event when multiple events exist for the same workspace', () => {
    const oldDate = new Date(NOW.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString();
    const newerDate = new Date(NOW.getTime() - 50 * 24 * 60 * 60 * 1000).toISOString();
    const newestDate = new Date(NOW.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString();

    const workspaces = [makeWorkspace('ws-multi', 'Multi-event WS')];
    const events = [
      makeEvent('ws-multi', oldDate),
      makeEvent('ws-multi', newestDate),
      makeEvent('ws-multi', newerDate),
    ];

    // Most recent event is 20 days ago — below the 90-day threshold → not a ghost
    const result = deriveGhostWorkspaces(events, workspaces, GHOST_WORKSPACE_THRESHOLD_DAYS, ACTIVITY_LOG_LOOKBACK_DAYS);
    expect(result).toEqual([]);
  });

  it('uses the most recent event correctly when workspace qualifies as ghost', () => {
    const oldDate = new Date(NOW.getTime() - 200 * 24 * 60 * 60 * 1000).toISOString();
    const newerDate = new Date(NOW.getTime() - 95 * 24 * 60 * 60 * 1000).toISOString();

    const workspaces = [makeWorkspace('ws-multi2', 'Multi-event Ghost')];
    const events = [
      makeEvent('ws-multi2', oldDate),
      makeEvent('ws-multi2', newerDate),
    ];

    // Most recent is 95 days ago → ghost, daysInactive should be 95 (not 200)
    const result = deriveGhostWorkspaces(events, workspaces, GHOST_WORKSPACE_THRESHOLD_DAYS, ACTIVITY_LOG_LOOKBACK_DAYS);
    expect(result).toHaveLength(1);
    expect(result[0].daysInactive).toBe(95);
    expect(result[0].lastActivityDate).toEqual(new Date(newerDate));
  });
});
