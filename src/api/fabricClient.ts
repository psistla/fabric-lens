import type { IPublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { useMemo } from 'react';
import { FabricApiError, type PaginatedResponse } from './types/common';
import {
  DEFAULT_FABRIC_API_BASE,
  FABRIC_SCOPES,
  DEFAULT_RETRY_AFTER_MS,
} from '@/utils/constants';

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
  ): Promise<T> {
    const token = await this.getToken(FABRIC_SCOPES);
    const url = path.startsWith('http') ? path : `${FABRIC_API_BASE}${path}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

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
      const retryAfter = response.headers.get('Retry-After');
      const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : DEFAULT_RETRY_AFTER_MS;
      await sleep(waitMs);
      return this.request(method, path, body);
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
    try {
      const body = (await response.json()) as Record<string, unknown>;
      const error = (body.error ?? body) as Record<string, unknown>;
      return new FabricApiError(
        response.status,
        (error.message as string) ?? response.statusText,
        error.code as string | undefined,
      );
    } catch {
      return new FabricApiError(response.status, response.statusText);
    }
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
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
