import axios from 'axios';

import { api } from '@/lib/api';

export const DS = '/api/v1/delivery-service';
export const TRACKING = `${DS}/tracking/order`;

type Envelope<T> = { success?: boolean; message?: string; data?: T };

export type DeliveryApiError = Error & { status?: number; code?: string };

export async function get<T>(path: string): Promise<T> {
  try {
    const res = await api.get<Envelope<T> | T>(path, {
      withCredentials: true,
      headers: { Accept: 'application/json' },
      timeout: 15_000,
    });
    const payload = res.data as Envelope<T> | T;
    if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
      const env = payload as Envelope<T>;
      if (env.success === false) throw apiError(env.message, 404);
      return env.data as T;
    }
    return payload as T;
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function mutate<T>(
  method: 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<T> {
  try {
    const res = await api.request<Envelope<T> | T>({
      url: path,
      method,
      data: body ?? {},
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...extraHeaders,
      },
      timeout: 15_000,
    });
    const payload = res.data as Envelope<T> | T;
    if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
      return (payload as Envelope<T>).data as T;
    }
    return payload as T;
  } catch (err) {
    throw normaliseError(err);
  }
}

function apiError(msg?: string, status?: number, code?: string): DeliveryApiError {
  const e = new Error(msg || 'Delivery service error') as DeliveryApiError;
  e.status = status;
  e.code = code;
  return e;
}

function normaliseError(err: unknown): Error {
  if ((err as DeliveryApiError)?.status !== undefined && !axios.isAxiosError(err)) return err as Error;
  if (axios.isAxiosError(err)) {
    if (!err.response) return new Error('Network error. Check your connection.');
    const d = err.response.data as { message?: string; error?: string; code?: string } | undefined;
    const msg = d?.message || d?.error || `Request failed (${err.response.status})`;
    return apiError(msg, err.response.status, d?.code);
  }
  return err instanceof Error ? err : new Error(String(err));
}

export function errorStatus(err: unknown): number | undefined {
  return (err as DeliveryApiError | undefined)?.status;
}

export function errorCode(err: unknown): string | undefined {
  return (err as DeliveryApiError | undefined)?.code;
}

export function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
}
