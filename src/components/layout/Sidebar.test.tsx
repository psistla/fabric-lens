// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

// Mock isDemoMode — will be toggled per test via Object.defineProperty
const demoState = vi.hoisted(() => ({ isDemoMode: false }));
vi.mock('@/api/demo', () => {
  const mod = {} as { isDemoMode: boolean };
  Object.defineProperty(mod, 'isDemoMode', {
    get: () => demoState.isDemoMode,
    set: (v: boolean) => { demoState.isDemoMode = v; },
    enumerable: true,
    configurable: true,
  });
  return mod;
});
// Mock the Zustand store
vi.mock('@/store/uiStore', () => {
  const state = { sidebarCollapsed: false, toggleSidebar: () => undefined };
  const useUiStore = Object.assign(
    (sel: (s: typeof state) => unknown) => sel(state),
    { getState: () => state },
  );
  return { useUiStore };
});

import { Sidebar } from './Sidebar';
import { DEMO_SECURITY_VISITED_KEY } from '@/utils/constants';

function renderSidebar(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar />
    </MemoryRouter>,
  );
}

describe('Sidebar demo badge', () => {
  beforeEach(() => {
    sessionStorage.clear();
    demoState.isDemoMode = false;
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('does not show badge in live mode', () => {
    demoState.isDemoMode = false;
    renderSidebar();
    expect(screen.queryByText('Try →')).toBeNull();
  });

  it('shows badge in demo mode when security not yet visited', () => {
    demoState.isDemoMode = true;
    renderSidebar();
    expect(screen.getByText('Try →')).toBeTruthy();
  });

  it('does not show badge in demo mode when security_visited key is set', () => {
    demoState.isDemoMode = true;
    sessionStorage.setItem(DEMO_SECURITY_VISITED_KEY, 'true');
    renderSidebar();
    expect(screen.queryByText('Try →')).toBeNull();
  });

  it('sets security_visited in sessionStorage when on /security path', () => {
    demoState.isDemoMode = true;
    renderSidebar('/security');
    expect(sessionStorage.getItem(DEMO_SECURITY_VISITED_KEY)).toBe('true');
  });

  it('hides badge when on /security path', () => {
    demoState.isDemoMode = true;
    renderSidebar('/security');
    expect(screen.queryByText('Try →')).toBeNull();
  });
});
