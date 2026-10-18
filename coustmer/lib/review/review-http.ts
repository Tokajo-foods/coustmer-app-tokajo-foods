import axios from 'axios';

import { api } from '@/lib/api';
import type { PaginationMeta } from '@/lib/review/types';

export type Envelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};

export async function request<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
  } = {}
): Promise<Envelope<T>> {
  const { method = 'GET', body } = options;
  const isMutating = method !== 'GET';

  try {
    const response = await api.request<Envelope<T> | T>({
      url: path,
      method,
      data: isMutating ? (body ?? {}) : body,
      withCredentials: true,
      timeout: 12_000,
      headers: isMutating
        ? {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }
        : { Accept: 'application/json' },
      validateStatus: (status) => status >= 200 && status < 500,
    });

    if (response.status >= 400) {
      const data = response.data as
        | { message?: string; error?: string; success?: boolean }
        | undefined;
      const err = new Error(
        data?.message || data?.error || `Request failed (${response.status})`
      ) as Error & { status?: number };
      err.status = response.status;
      throw err;
    }

    const payload = response.data as Envelope<T> | T;
    if (
      payload &&
      typeof payload === 'object' &&
      ('data' in (payload as object) || 'success' in (payload as object))
    ) {
      const envelope = payload as Envelope<T>;
      if (envelope.success === false) {
        const err = new Error(
          envelope.message || 'Review service unavailable'
        ) as Error & { status?: number };
        err.status = 502;
        throw err;
      }
      return envelope;
    }

    return { success: true, data: payload as T };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error(
          'Network request failed. Check your internet connection and try again.'
        );
      }

      const data = error.response.data as
        | { message?: string; error?: string }
        | undefined;
      const message =
        data?.message ||
        data?.error ||
        `Request failed (${error.response.status})`;

      if (message.toLowerCase().includes('csrf')) {
        throw new Error(
          'Security token expired. Close and reopen the app, then try again.'
        );
      }

      const err = new Error(message) as Error & { status?: number };
      err.status = error.response.status;
      throw err;
    }

    throw error;
  }
}


export function isNotFoundError(error: unknown): boolean {
  const status = (error as Error & { status?: number }).status;
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    status === 404 ||
    status === 204 ||
    message.includes('not found') ||
    message.includes('no review') ||
    message.includes('not reviewed') ||
    message.includes('has not reviewed')
  );
}

export function isServiceUnavailable(error: unknown): boolean {
  const status = (error as Error & { status?: number }).status;
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes('unable to reach') ||
    message.includes('unavailable') ||
    message.includes('try again later')
  );
}
