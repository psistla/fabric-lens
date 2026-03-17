import type { IPublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { useMemo } from 'react';
import { FabricApiError, type PaginatedResponse } from './types/common';
import {
  DEFAULT_FABRIC_API_BASE,
  FABRIC_SCOPES,
  DEFAULT_RETRY_AFTER_MS,
  MAX_RETRY_COUNT,
  BASE_RETRY_DELAY_MS,
  MAX_RETRY_DELAY_MS,
  GUID_REGEX,
  HTTP_ERROR_MESSAGES,
  HTTP_ERROR_MESSAGE_SERVER,
} from '@/utils/constants';

/** Returns true if value is a valid RFC 4122 GUID. Use this before
 *  interpolating user-supplied IDs into API URL paths to prevent
 *  path traversal (e.g. "../admin" injected as a workspace ID). */
export function isValidGuid(value: string): boolean {
  return GUID_REGEX.test(value);
}
import { isDemoMode } from '@/api/demo';

// Module-level request counter — tracks all fabricClient requests, resets hourly.
const HOUR_MS = 60 * 60 * 1000;
let _reqCount = 0;
let _reqWindowStart = Date.now();

function trackClientRequest(): void {
  if (Date.now() - _reqWindowStart >= HOUR_MS) {
    _reqCount = 0;
    _reqWindowStart = Date.now();
  }
  _reqCount++;
}

export function getClientRequestCount(): number {
  return _reqCount;
}

const FABRIC_API_BASE =
  (import.meta.env.VITE_FABRIC_API_BASE as string) || DEFAULT_FABRIC_API_BASE;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
    retryCount = 0,
  ): Promise<T> {
    const token = await this.getToken(FABRIC_SCOPES);
    const url = path.startsWith('http') ? path : `${FABRIC_API_BASE}${path}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    trackClientRequest();
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      const retryToken = await this.getToken(FABRIC_SCOPES);
      const retryResponse = await fetch(url, {
        method,
        headers: { ...headers, Authorization: `Bearer ${retryToken}` },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      if (!retryResponse.ok) {
        throw await this.buildError(retryResponse);
      }
      return (await retryResponse.json()) as T;
    }

    if (response.status === 429) {
      if (retryCount >= MAX_RETRY_COUNT) {
        throw new FabricApiError(
          429,
          HTTP_ERROR_MESSAGES[429] ?? HTTP_ERROR_MESSAGE_SERVER,
        );
      }
      const retryAfter = response.headers.get('Retry-After');
      const serverWaitMs = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : DEFAULT_RETRY_AFTER_MS;
      const backoffMs = Math.min(
        BASE_RETRY_DELAY_MS * Math.pow(2, retryCount) + Math.random() * 1000,
        MAX_RETRY_DELAY_MS,
      );
      await sleep(Math.max(serverWaitMs, backoffMs));
      return this.request(method, path, body, retryCount + 1);
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
    const userMessage =
      HTTP_ERROR_MESSAGES[response.status] ?? HTTP_ERROR_MESSAGE_SERVER;

    let errorCode: string | undefined;
    try {
      const body = (await response.json()) as Record<string, unknown>;
      const error = (body.error ?? body) as Record<string, unknown>;
      errorCode = error.code as string | undefined;
      if (import.meta.env.DEV) {
        console.warn('[FabricClient] API error', response.status, body);
      }
    } catch {
      if (import.meta.env.DEV) {
        console.warn('[FabricClient] API error', response.status, response.statusText);
      }
    }

    return new FabricApiError(response.status, userMessage, errorCode);
  }

  async get<T>(path: string): Promise<T> {
    if (isDemoMode) {
      throw new Error(
        'fabricClient: API call attempted in demo mode. ' +
        'This is a bug — demo mode should use mock data exclusively.',
      );
    }
    return this.request<T>('GET', path);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    if (isDemoMode) {
      throw new Error(
        'fabricClient: API call attempted in demo mode. ' +
        'This is a bug — demo mode should use mock data exclusively.',
      );
    }
    return this.request<T>('POST', path, body);
  }

  async listAll<T>(path: string): Promise<T[]> {
    const results: T[] = [];
    let continuationToken: string | undefined;
    do {
      const url = continuationToken
        ? `${path}${path.includes('?') ? '&' : '?'}continuationToken=${continuationToken}`
        : path;
      const response =
        await this.get<PaginatedResponse<T>>(url);
      results.push(...response.value);
      continuationToken = response.continuationToken;
    } while (continuationToken);
    return results;
  }
}

export function useFabricClient(): FabricClient {
  const { instance } = useMsal();
  return useMemo(() => new FabricClient(instance), [instance]);
}
