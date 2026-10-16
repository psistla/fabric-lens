import type { IPublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { FabricApiError, type PaginatedResponse } from './types/common';
import {
  DEFAULT_FABRIC_API_BASE,
  CORE_SCOPES,
  DEFAULT_RETRY_AFTER_MS,
  MAX_RETRY_COUNT,
  BASE_RETRY_DELAY_MS,
  MAX_RETRY_DELAY_MS,
  REQUEST_TIMEOUT_MS,
  GUID_REGEX,
  HTTP_ERROR_MESSAGES,
  HTTP_ERROR_MESSAGE_SERVER,
  CAPACITY_LIMIT_MESSAGE,
  REQUEST_TIMEOUT_MESSAGE,
} from '@/utils/constants';

/** Returns true if value is a valid RFC 4122 GUID. Use this before
 *  interpolating user-supplied IDs into API URL paths to prevent
 *  path traversal (e.g. "../admin" injected as a workspace ID). */
export function isValidGuid(value: string): boolean {
  return GUID_REGEX.test(value);
}
import { isEffectiveDemoMode } from '@/auth/AuthProvider';

const FABRIC_API_BASE =
  (import.meta.env.VITE_FABRIC_API_BASE as string) || DEFAULT_FABRIC_API_BASE;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fabric states the 429 cause in the body's errorCode; Retry-After is whole seconds. */
const CAPACITY_LIMIT_CODE = 'CapacityLimitExceeded';

/** Wait before retry number `retryCount` (0-based): the larger of Retry-After and capped backoff. */
export function retryDelayMs(retryAfter: string | null, retryCount: number): number {
  const seconds = retryAfter === null ? NaN : Number(retryAfter);
  const serverWaitMs = Number.isFinite(seconds) ? seconds * 1000 : DEFAULT_RETRY_AFTER_MS;
  const backoffMs = Math.min(
    BASE_RETRY_DELAY_MS * Math.pow(2, retryCount) + Math.random() * 1000,
    MAX_RETRY_DELAY_MS,
  );
  return Math.max(serverWaitMs, backoffMs);
}

export async function fetchWithTimeout(
  url: string,
  token: string,
  extraHeaders: Record<string, string> = {},
): Promise<Response> {
  try {
    return await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, ...extraHeaders },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'TimeoutError') {
      throw new FabricApiError(408, REQUEST_TIMEOUT_MESSAGE, 'RequestTimeout');
    }
    throw e;
  }
}

export class FabricClient {
  private msalInstance: IPublicClientApplication;

  constructor(msalInstance: IPublicClientApplication) {
    this.msalInstance = msalInstance;
  }

  private getAccount(): AccountInfo {
    const accounts = this.msalInstance.getAllAccounts();
    const account = accounts[0];
    if (!account) {
      throw new FabricApiError(401, 'No active account. Please sign in.');
    }
    return account;
  }

  private async getToken(scopes: string[]): Promise<string> {
    const account = this.getAccount();
    try {
      const result = await this.msalInstance.acquireTokenSilent({
        scopes,
        account,
      });
      return result.accessToken;
    } catch {
      const result = await this.msalInstance.acquireTokenPopup({ scopes });
      return result.accessToken;
    }
  }

  private async request<T>(path: string, retryCount = 0, scopes?: string[]): Promise<T> {
    const token = await this.getToken(scopes ?? CORE_SCOPES);
    const url = path.startsWith('http') ? path : `${FABRIC_API_BASE}${path}`;

    const response = await fetchWithTimeout(url, token);

    if (response.status === 401) {
      const retryToken = await this.getToken(scopes ?? CORE_SCOPES);
      const retryResponse = await fetchWithTimeout(url, retryToken);
      if (!retryResponse.ok) {
        throw await this.buildError(retryResponse);
      }
      return (await retryResponse.json()) as T;
    }

    // 429 is always retryable. A 5xx is retried only when the server sent Retry-After,
    // per Microsoft's guidance not to retry a bare 503.
    const retryAfter = response.headers.get('Retry-After');
    if (response.status === 429 || (response.status >= 500 && retryAfter)) {
      const error = await this.buildError(response);
      // CapacityLimitExceeded means the capacity is overloaded, not that this caller was
      // too fast, so an immediate retry cannot succeed. Surface it instead of waiting.
      if (error.errorCode === CAPACITY_LIMIT_CODE || retryCount >= MAX_RETRY_COUNT) {
        throw error;
      }
      await sleep(retryDelayMs(retryAfter, retryCount));
      return this.request(path, retryCount + 1, scopes);
    }

    if (!response.ok) {
      throw await this.buildError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  private async buildError(response: Response): Promise<FabricApiError> {
    let userMessage =
      HTTP_ERROR_MESSAGES[response.status] ?? HTTP_ERROR_MESSAGE_SERVER;

    let errorCode: string | undefined;
    try {
      const body = (await response.json()) as Record<string, unknown>;
      const error = (body.error ?? body) as Record<string, unknown>;
      errorCode = (error.errorCode ?? error.code) as string | undefined;
      if (import.meta.env.DEV) {
        console.warn('[FabricClient] API error', response.status, body);
      }
    } catch {
      if (import.meta.env.DEV) {
        console.warn('[FabricClient] API error', response.status, response.statusText);
      }
    }

    if (errorCode === CAPACITY_LIMIT_CODE) userMessage = CAPACITY_LIMIT_MESSAGE;
    return new FabricApiError(response.status, userMessage, errorCode);
  }

  async get<T>(path: string, scopes?: string[]): Promise<T> {
    if (isEffectiveDemoMode()) {
      throw new Error(
        'fabricClient: API call attempted in demo mode. ' +
        'This is a bug. Demo mode should use mock data exclusively.',
      );
    }
    return this.request<T>(path, 0, scopes);
  }

  async listAll<T>(path: string): Promise<T[]> {
    const results: T[] = [];
    let continuationToken: string | undefined;
    do {
      const url = continuationToken
        ? `${path}${path.includes('?') ? '&' : '?'}continuationToken=${encodeURIComponent(continuationToken)}`
        : path;
      const response = await this.get<PaginatedResponse<T>>(url);
      if (!Array.isArray(response.value)) {
        // Returning what we have would show a governance result that looks complete and
        // is not. Fail loudly so the caller's error state tells the user.
        throw new FabricApiError(
          502,
          'Fabric returned an unexpected response, so the list may be incomplete.',
          'UnexpectedResponseShape',
        );
      }
      results.push(...response.value);
      continuationToken = response.continuationToken;
    } while (continuationToken);
    return results;
  }
}
