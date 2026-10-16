// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { BrowserAuthError, BrowserAuthErrorCodes } from '@azure/msal-browser';

const instance = {
  loginPopup: vi.fn(),
  loginRedirect: vi.fn(),
};

vi.mock('@azure/msal-react', () => ({
  useMsal: () => ({ instance, inProgress: 'none', accounts: [] }),
  useIsAuthenticated: () => false,
}));
vi.mock('./msalConfig', () => ({ fabricLoginRequest: { scopes: ['s'] } }));

import { useAuth } from './useAuth';

describe('useAuth.login', () => {
  beforeEach(() => {
    instance.loginPopup.mockReset();
    instance.loginRedirect.mockReset();
  });

  it('falls back to a redirect when the popup is blocked', async () => {
    instance.loginPopup.mockRejectedValue(
      new BrowserAuthError(BrowserAuthErrorCodes.popupWindowError, 'cid'),
    );
    instance.loginRedirect.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuth());
    await result.current.login();
    expect(instance.loginRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ scopes: ['s'], redirectUri: window.location.origin }),
    );
  });

  it('does not redirect when the user closes the popup', async () => {
    instance.loginPopup.mockRejectedValue(
      new BrowserAuthError(BrowserAuthErrorCodes.userCancelled, 'cid'),
    );
    const { result } = renderHook(() => useAuth());
    await expect(result.current.login()).rejects.toBeInstanceOf(BrowserAuthError);
    expect(instance.loginRedirect).not.toHaveBeenCalled();
  });
});
